import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import Image from "next/image";
import { Roboto_Condensed } from "next/font/google";
import { DrashFooter } from "../components/footer";
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

export const metadata = {
  title: {
    default: "Drash",
    template: "%s — Drash",
  },
  description:
    "A strongly typed, runtime-agnostic web framework for building structured HTTP services in JavaScript, built on Web Standards.",
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
