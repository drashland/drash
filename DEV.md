# Dev Environment Setup

## Copy git hook for standardized commit messages

This makes your commit messages as follows: `[branch-name] commit message`

```shell
/path/to/deno-drash/console/git_hooks/copy-prepare-commit-msg
```

## Building API Reference pages JSON data

```shell
console/build_docs
```

`console/build_docs` will create `api_reference.json` in the root directory of your `deno-drash` clone (e.g., `/path/to/deno-drash/api_reference.json`).

If the `deno-drash-docs` repo needs to be updated, then make a PR to it by updating the `api_reference.json` file to use the newly built one.

## Upgrading Deno

Update the `deps.ts` file automaticlaly by updating line `8` in `console/typescript/bump_versions.ts` to reflect which version to update from and which version to update to. See below as an example.

```typescript
let result = await bumpVersions(fromVersion, toVersion);
```

Run the following command.

```
console/bump_verisons
```

Update `README.md` version by updating line `26`.

Update `console/install_deno` version by updating line `4`.
