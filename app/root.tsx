import { IconGithub } from "@/components/icons";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
} from "react-router";
import stylesheet from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

const themeScript = `(() => {
  const root = document.documentElement;
  const media = matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    const stored = localStorage.getItem("theme");
    root.classList.toggle(
      "dark",
      stored === "dark" || (stored !== "light" && media.matches),
    );
  };
  apply();
  media.addEventListener("change", () => {
    const stored = localStorage.getItem("theme");
    if (stored !== "light" && stored !== "dark") apply();
  });
})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-between px-4">
      <Outlet />
      <footer className="flex w-full flex-col pt-10">
        <div className="h-px w-full bg-border" />
        <div className="flex w-full items-center justify-between py-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center text-base font-semibold tracking-tight"
          >
            WAYF
          </Link>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/runandrew/remix-wayf"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WAYF on GitHub"
              >
                <IconGithub className="h-5 w-5" />
              </a>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </footer>
    </main>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const message = notFound ? "Meetup not found" : "Something went wrong";

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-4">
      <p className="text-lg font-semibold">{message}</p>
      <Link to="/" className="mt-4 underline">
        Back to WAYF
      </Link>
    </main>
  );
}
