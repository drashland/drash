// `nextra-theme-docs/style.css` is a side-effect import of a package CSS
// subpath. Next's generated `next-env.d.ts` types CSS *modules*, but not bare
// side-effect CSS imports, so declare them here.
declare module "*.css";
