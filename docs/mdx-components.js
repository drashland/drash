import {
  Callout,
  Cards,
  FileTree,
  Steps,
  Table,
  Tabs,
} from "nextra/components";
import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";
import { SeeAlso } from "./components/see-also";

const docsComponents = getDocsMDXComponents();

// Exposed to every MDX file without an import, so content pages stay plain
// markdown wherever possible.
export const useMDXComponents = (components) => ({
  ...docsComponents,
  Callout,
  Cards,
  FileTree,
  SeeAlso,
  Steps,
  Table,
  Tabs,
  ...components,
});
