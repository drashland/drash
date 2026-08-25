import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../../mdx-components.js";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
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
