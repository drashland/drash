import { Callout, Steps, Table, Tabs } from "nextra/components";
import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";

const docsComponents = getDocsMDXComponents();

// Exposed to every MDX file without an import, so content pages stay plain
// markdown wherever possible.
export const useMDXComponents = (components) => ({
  ...docsComponents,
  Callout,
  Steps,
  Table,
  Tabs,
  ...components,
});
