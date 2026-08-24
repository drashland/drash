import { Cards, FileTree, Steps, Tabs } from "nextra/components";
import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";
import { Callout } from "./components/callout";
import { CodeTab, CodeTabs } from "./components/code-tabs";
import { Compare, CompareItem } from "./components/compare";
import { SeeAlso } from "./components/see-also";
import { Table, Td, Th, Tr } from "./components/table";

const docsComponents = getDocsMDXComponents();

// Exposed to every MDX file without an import, so content pages stay plain
// markdown wherever possible.
export const useMDXComponents = (components) => ({
  ...docsComponents,
  Callout,
  Cards,
  CodeTab,
  CodeTabs,
  Compare,
  CompareItem,
  FileTree,
  SeeAlso,
  Steps,
  Tabs,
  // Markdown tables render through these, so every table in the docs picks up
  // the scroll container and styling without any per-page markup.
  table: Table,
  td: Td,
  th: Th,
  tr: Tr,
  ...components,
});
