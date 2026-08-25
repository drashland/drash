import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import Image from "next/image";
import { Roboto_Condensed } from "next/font/google";
import { DrashFooter } from "../components/footer";
import { VersionBadge } from "../components/version-badge";
// Pulls in Tailwind, then nextra-theme-docs/style.css, then this site's own
// overrides — in that order. See the comment at the top of the file.
import "./globals.css";

/*
 * Headings only — body text stays on the system stack, so this adds one font to
 * the page rather than replacing the typography wholesale.
 *
 * next/font downloads the file at build time and serves it from our own origin,
 * so there is no request to Google at runtime and nothing to break under
 * `output: "export"`. `display: "swap"` means headings render in the fallback
 * immediately rather than sitting invisible while the font loads.
 *
 * Swapping the family is a one-line change: replace the import and this call.
 */
const headingFont = Roboto_Condensed({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

/*
 * Open Graph and Twitter tags have to carry *absolute* URLs — a crawler
 * unfurling a link has no page to resolve "/drash-round-250.png" against — so
 * Next resolves the relative paths below against `metadataBase`.
 *
 * `metadataBase` is the origin only, with no path. `new URL()` treats a leading
 * slash as "start again from the root", so folding the base path in here would
 * silently drop it back off every image URL. The base path is applied to each
 * path instead, which is why they are written as `${basePath}/...`.
 *
 * Mirrors next.config.mjs — same variable, read at build time, so a subpath
 * deploy cannot leave these tags pointing somewhere the assets are not.
 * DOCS_SITE_URL overrides the host for a fork or a preview deploy.
 */
const siteUrl = process.env.DOCS_SITE_URL ?? "https://drash.crookse.com";
const basePath = process.env.DOCS_BASE_PATH ?? "";

const description =
  "A strongly typed, runtime-agnostic web framework for building structured HTTP services in JavaScript, built on Web Standards.";

/*
 * The logo is square (2000x2000). `summary_large_image` crops to roughly 1.91:1,
 * which would slice the top and bottom off it, so the card stays `summary` —
 * the variant built for a square thumbnail. Swapping to a purpose-made 1200x630
 * image is the upgrade path; change the card type at the same time.
 */
const ogImage = {
  url: `${basePath}/drash-open-graph.png`,
  width: 1200,
  height: 630,
  alt: "Drash Web Framework for Node, Deno, Bun, and Cloudflare Workers",
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Drash",
    template: "%s — Drash",
  },
  description,
  applicationName: "Drash",
  // No `title` here on purpose. Nextra sets each page's `title`, and Next falls
  // back to that resolved value for og:title — so a shared link unfurls as
  // "HTTP Application — Drash". Declaring a title template here instead would
  // pin every page's og:title to the default, because the template only fills
  // when a child route supplies a value and Nextra supplies `title`, not
  // `openGraph.title`.
  openGraph: {
    type: "website",
    siteName: "Drash",
    description,
    url: `${basePath}/`,
    locale: "en_US",
    images: [ogImage],
  },
  twitter: {
    card: "summary",
    description,
    images: [ogImage],
  },
  icons: {
    icon: `${basePath}/drash-round-250.png`,
    apple: `${basePath}/drash-round-250.png`,
  },
};

const logo = (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
    <Image
      src="/drash-round-250.png"
      alt=""
      width={40}
      height={40}
      // The source is 250x250. Cap the rendered box at 40px and let it scale
      // down on narrow viewports rather than crowding the nav.
      style={{ maxWidth: "40px", maxHeight: "40px", height: "auto" }}
      priority
    />
    <b>Drash</b>
    {/* Inside the lockup, so the span above supplies the alignment and gap. */}
    <VersionBadge />
  </span>
);

const navbar = (
  <Navbar
    logo={logo}
    projectLink="https://github.com/drashland/drash"
  />
);

const footer = (
  <Footer>
    <DrashFooter />
  </Footer>
);

const banner = (
  <Banner storageKey="drash-v3-unstable">
    Drash v3 is in beta. APIs may change.
  </Banner>
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={headingFont.variable}
      suppressHydrationWarning
    >
      <Head />
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/drashland/drash/tree/main/docs"
          // Levels 1 and 2 stay expanded, so a section's folders (Core >
          // Errors, Modules > Middleware, ...) show their pages without a
          // click. Collapsing starts at level 3 — the folders nested inside
          // those, such as Core > HTTP > Request. Level-2 folders keep their
          // toggle so a reader can still close them; see app/globals.css for
          // the rules that drop the toggle at level 1 only.
          sidebar={{ defaultMenuCollapseLevel: 3 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
