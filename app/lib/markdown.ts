import { HOME_DESCRIPTION, HOME_TITLE, PUBLIC_ORIGIN } from "@/lib/seo";

const MARKDOWN_TYPE = "text/markdown; charset=utf-8";
const VARY = "Accept, Accept-Encoding";

type AcceptOffer = {
  type: string;
  q: number;
};

export const HOME_MARKDOWN = `# ${HOME_TITLE}

${HOME_DESCRIPTION}

Scheduling apps got accounts and extra features. WAYF finds a day that works. Days only, not times. There is no WAYF account.

1. Name the meetup
2. Share the link
3. Everyone marks the days they can do
4. See the overlap

- [Home](${PUBLIC_ORIGIN}/)
- [Source](https://github.com/runandrew/remix-wayf)
- [Agent summary](${PUBLIC_ORIGIN}/llms.txt)
`;

export const NOT_FOUND_MARKDOWN = `# Page not found

This path does not exist on wayf.quietlymadesoftware.com.

- [Home](${PUBLIC_ORIGIN}/)
- [Sitemap](${PUBLIC_ORIGIN}/sitemap.xml)
- [Agent summary](${PUBLIC_ORIGIN}/llms.txt)
`;

function parseAccept(header: string): AcceptOffer[] {
  const offers: AcceptOffer[] = [];
  for (const raw of header.split(",")) {
    const parts = raw.trim().split(";");
    const type = (parts[0] ?? "").trim().toLowerCase();
    if (!type) {
      continue;
    }
    let q = 1;
    for (const param of parts.slice(1)) {
      const [key, value] = param.trim().split("=");
      if (key === "q" && value) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          q = parsed;
        }
      }
    }
    offers.push({ type, q });
  }
  return offers;
}

function maxQuality(offers: AcceptOffer[], types: string[]): number {
  let best = 0;
  for (const offer of offers) {
    if (types.includes(offer.type) && offer.q > best) {
      best = offer.q;
    }
  }
  return best;
}

export function wantsMarkdown(request: Request): boolean {
  const path = new URL(request.url).pathname;
  if (path.endsWith(".md")) {
    return true;
  }
  const accept = request.headers.get("Accept");
  if (!accept) {
    return false;
  }
  const offers = parseAccept(accept);
  const markdown = maxQuality(offers, ["text/markdown", "text/x-markdown"]);
  if (markdown <= 0) {
    return false;
  }
  const html = maxQuality(offers, ["text/html", "application/xhtml+xml"]);
  return markdown >= html;
}

export function isMarkdownDocumentPath(pathname: string): boolean {
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/llms.txt" ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon-32.png" ||
    pathname === "/og-wayf.png" ||
    pathname === "/wayf-mark.png" ||
    pathname.startsWith("/assets/")
  ) {
    return false;
  }
  return true;
}

export function markdownBody(pathname: string): {
  status: number;
  body: string;
} {
  if (pathname === "/" || pathname === "/index.md") {
    return { status: 200, body: HOME_MARKDOWN };
  }
  return { status: 404, body: NOT_FOUND_MARKDOWN };
}

export function markdownResponse(
  request: Request,
  status: number,
  body: string,
): Response {
  return new Response(request.method === "HEAD" ? null : body, {
    status,
    headers: {
      "Content-Type": MARKDOWN_TYPE,
      Vary: VARY,
      ...(status === 404 ? { "X-Robots-Tag": "noindex, nofollow" } : {}),
    },
  });
}
