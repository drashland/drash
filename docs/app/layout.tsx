import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata = {
  title: {
    default: "Drash",
    template: "%s — Drash",
  },
  description:
    "A strongly typed, runtime-agnostic web framework for building structured HTTP services in JavaScript, built on Web Standards.",
};

const navbar = (
  <Navbar
    logo={<b>Drash</b>}
    projectLink="https://github.com/drashland/drash"
  />
);

const footer = (
  <Footer>
    GPL-3.0 © Drash authors
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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/drashland/drash/tree/main/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
