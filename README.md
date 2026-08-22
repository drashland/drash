# Drash

A strongly typed, runtime-agnostic web framework for building structured HTTP services in JavaScript, built on Web Standards.

## Documentation

https://drashland.github.io/drash

Sources live in [`docs/`](./docs), built with [Nextra](https://nextra.site) and deployed to GitHub Pages by `.github/workflows/docs.yml`. The docs are a separate package with their own `package.json`, so working on Drash itself never installs Next or React.

To preview locally:

```
$ deno task docs:dev
```

Then go to `http://localhost:3000`. The site is served from the root; if it ever needs to live under a subpath, set `DOCS_BASE_PATH` to that prefix.

## Branches / Versions

### Current

These branches/versions are undergoing active development. For support, [create an issue](https://github.com/drashland/drash/issues).

- `main`
- `v3.x`

  - Docs: https://drash.land/drash-v3.x

### Unstable

These branches are considered unstable (aka not production ready). We cannot provide support for these branches since they contain breaking and weakly tested code. Although code in these branches are not officially released, they are open for use. We recommend you proceed with caution though. Happy dev'ing!

- `{version}-beta` (e.g., `v3.x-beta`)
- `{version}-staging` (e.g., `v3.x-staging`)

## Examples

You can find examples of tiny apps in in the [examples](https://github.com/drashland/drash/tree/v3.x/examples) directory.
