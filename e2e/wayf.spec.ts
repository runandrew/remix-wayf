import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { FIXED_TIME } from "./clock";

const fontCss = fontFaceCss();

const themes = ["light", "dark"] as const;
const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
} as const;

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(FIXED_TIME) });
  await page.addInitScript((css) => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }, fontCss);
});

test("home page create form", async ({ page }) => {
  for (const theme of themes) {
    for (const [viewport, size] of Object.entries(viewports)) {
      await page.setViewportSize(size);
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/");
      await expect(page.getByRole("heading", { name: "WAYF" })).toBeVisible();
      await expect(page.getByLabel("Meetup name")).toBeVisible();
      await snap(page, `home-${theme}-${viewport}`);
    }
  }
});

test("pick days and show overlap", async ({ page }) => {
  await page.setViewportSize(viewports.desktop);
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByLabel("Meetup name").fill("Picnic");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Picnic" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Add Availability" }).click();
  await page.getByLabel("Your name").fill("Alex");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(
    page.getByRole("heading", { name: "When are you free, Alex?" }),
  ).toBeVisible();
  await expect(page.getByText("June 2026")).toBeVisible();
  await pickDay(page, "16");
  await pickDay(page, "17");

  for (const theme of themes) {
    for (const [viewport, size] of Object.entries(viewports)) {
      await page.setViewportSize(size);
      await setTheme(page, theme);
      await snap(page, `calendar-${theme}-${viewport}`);
    }
  }

  await expect(page.locator('input[name="dates"]')).toHaveValue(
    "2026-06-16,2026-06-17",
  );
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("1 / 1")).toHaveCount(2);

  await page.getByRole("link", { name: "Add Availability" }).click();
  await page.getByLabel("Your name").fill("Blair");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("June 2026")).toBeVisible();
  await pickDay(page, "17");
  await pickDay(page, "18");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("2 / 2")).toBeVisible();
  await expect(page.getByText("Alex, Blair")).toBeVisible();
  await expect(page.getByText("1 / 2")).toHaveCount(2);
  await expect(
    page.getByRole("heading", { name: "Wednesday, Jun 17" }),
  ).toBeVisible();

  const meetUrl = page.url();
  for (const theme of themes) {
    for (const [viewport, size] of Object.entries(viewports)) {
      await page.setViewportSize(size);
      await page.evaluate((next) => {
        localStorage.setItem("theme", next);
      }, theme);
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(meetUrl);
      await expect(page.getByText("2 / 2")).toBeVisible();
      await snap(page, `meet-${theme}-${viewport}`);
    }
  }
});

async function pickDay(page: Page, day: string) {
  const cell = page.getByRole("gridcell", { name: day, exact: true });
  await expect(cell).toBeVisible();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if ((await cell.getAttribute("aria-selected")) === "true") return;
    await cell.click();
    try {
      await expect(cell).toHaveAttribute("aria-selected", "true", {
        timeout: 3_000,
      });
      return;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
}

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate((next) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }, theme);
}

async function snap(page: Page, name: string) {
  await page.evaluate(async () => {
    await document.fonts.load("16px Wayf Snapshot");
    await document.fonts.load("700 16px Wayf Snapshot");
    await document.fonts.ready;
    for (const input of document.querySelectorAll("input, textarea")) {
      const field = input as HTMLInputElement;
      field.placeholder = field.placeholder
        .replace(/\p{Extended_Pictographic}/gu, "")
        .replace(/\s+$/u, "");
    }
  });
  await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
}

function fontFaceCss() {
  const dir = path.join(process.cwd(), "e2e/fonts");
  const regular = readFileSync(
    path.join(dir, "LiberationSans-Regular.ttf"),
  ).toString("base64");
  const bold = readFileSync(path.join(dir, "LiberationSans-Bold.ttf")).toString(
    "base64",
  );
  return `
    @font-face {
      font-family: "Wayf Snapshot";
      src: url(data:font/ttf;base64,${regular}) format("truetype");
      font-weight: 100 500;
      font-style: normal;
    }
    @font-face {
      font-family: "Wayf Snapshot";
      src: url(data:font/ttf;base64,${bold}) format("truetype");
      font-weight: 600 900;
      font-style: normal;
    }
    html, body, button, input, textarea, select {
      font-family: "Wayf Snapshot", sans-serif !important;
    }
  `;
}
