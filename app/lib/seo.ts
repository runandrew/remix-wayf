import type { MetaDescriptor } from "react-router";

export const PUBLIC_ORIGIN = "https://wayf.quietlymadesoftware.com";

export const HOME_TITLE = "WAYF: When are you free?";
export const HOME_DESCRIPTION =
  "Name a meetup, share a link, and pick the days you're free. WAYF shows the overlap. No accounts.";

const OG_IMAGE_PATH = "/og-wayf.png";
const MARK_PATH = "/wayf-mark.png";
const OG_IMAGE_ALT = "WAYF: When are you free?";

export function publicUrl(pathname = "/"): string {
  if (pathname === "/" || pathname === "") {
    return `${PUBLIC_ORIGIN}/`;
  }
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${PUBLIC_ORIGIN}${path}`;
}

function assetUrl(path: string): string {
  return publicUrl(path);
}

function robotsMeta(indexable: boolean): MetaDescriptor {
  return {
    name: "robots",
    content: indexable
      ? "index, follow, max-image-preview:large"
      : "noindex, nofollow",
  };
}

function socialMeta(input: {
  title: string;
  description: string;
  url: string;
}): MetaDescriptor[] {
  const image = assetUrl(OG_IMAGE_PATH);
  return [
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "WAYF" },
    { property: "og:locale", content: "en_US" },
    { property: "og:url", content: input.url },
    { property: "og:image", content: image },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: OG_IMAGE_ALT },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: input.title },
    { name: "twitter:description", content: input.description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: OG_IMAGE_ALT },
  ];
}

export function homeMeta(): MetaDescriptor[] {
  const url = publicUrl("/");
  return [
    { title: HOME_TITLE },
    { name: "description", content: HOME_DESCRIPTION },
    robotsMeta(true),
    { tagName: "link", rel: "canonical", href: url },
    ...socialMeta({
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      url,
    }),
    { "script:ld+json": homeJsonLd() },
  ];
}

export function meetMeta(input: {
  name: string | undefined;
  pathname: string;
}): MetaDescriptor[] {
  const title = `${input.name ?? "When are you free?"} | WAYF`;
  const description =
    "Pick the days you're free for this meetup. WAYF shows the overlap. No account.";
  const url = publicUrl(input.pathname);
  return [
    { title },
    { name: "description", content: description },
    robotsMeta(false),
    { tagName: "link", rel: "canonical", href: url },
    ...socialMeta({ title, description, url }),
  ];
}

function homeJsonLd() {
  const origin = `${PUBLIC_ORIGIN}/`;
  const organizationId = `${PUBLIC_ORIGIN}/#organization`;
  const websiteId = `${PUBLIC_ORIGIN}/#website`;
  const appId = `${PUBLIC_ORIGIN}/#app`;
  const mark = assetUrl(MARK_PATH);
  const image = assetUrl(OG_IMAGE_PATH);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: origin,
        name: HOME_TITLE,
        description: HOME_DESCRIPTION,
        publisher: { "@id": organizationId },
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Quietly Made LLC",
        url: "https://quietlymadesoftware.com/",
        email: "support@quietlymadesoftware.com",
        logo: {
          "@type": "ImageObject",
          url: mark,
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://quietlymadesoftware.com/",
          "https://github.com/runandrew/remix-wayf",
        ],
      },
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        "@id": appId,
        name: "WAYF",
        alternateName: ["When are you free?", HOME_TITLE],
        url: origin,
        description: HOME_DESCRIPTION,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        image,
        screenshot: image,
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: 0,
          priceCurrency: "USD",
        },
        publisher: { "@id": organizationId },
        featureList: [
          "Name a meetup and share a link",
          "Everyone marks the days they are free",
          "See which days overlap",
          "No accounts",
        ],
      },
    ],
  };
}
