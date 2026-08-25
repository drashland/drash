import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../../mdx-components.js";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);

  /*
   * The homepage carries its own title instead of the "%s — Drash" template in
   * app/layout.tsx, which would otherwise render it as "Drash — Drash".
   *
   * `absolute` is the only thing that opts a page out of a parent template, and
   * it has to be set here. Nextra builds each page's metadata from its
   * frontmatter, where a nested `title.absolute` is not understood — it falls
   * back to the file name and the page becomes "Index — Drash". Exporting
   * `metadata` from the MDX file instead collides with the export Nextra
   * generates from that same frontmatter, and the compile fails.
   *
   * An empty `mdxPath` is the site root; every other page keeps the template.
   */
  if (!params.mdxPath?.length) {
    return {
      ...metadata,
      title: {
        absolute: "Drash - Better web apps without the framework tax",
      },
    };
  }

  return metadata;
}

type PageProps = {
  params: Promise<{ mdxPath: string[] }>;
};

export default async function Page(props: PageProps) {
  const params = await props.params;
  const result = await importPage(params.mdxPath);
  const { default: MDXContent, toc, metadata } = result;

  // Resolved per render, not once at module scope. Fast Refresh re-evaluates
  // the components module when an MDX file is saved, and a component captured
  // at module scope goes stale — leaving `Wrapper` undefined and throwing
  // "Element type is invalid" on save.
  const { wrapper: Wrapper } = getMDXComponents();

  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
