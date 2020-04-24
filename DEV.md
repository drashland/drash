# Dev Environment Setup

## Table of Contents

* [Copy git hook for standardized commit messages](#copy-git-hook-for-standardized-commit-messages)
* [Building the API Reference pages JSON data](#building-the-api-reference-pages-json-data)
* [Upgrading Deno](#upgrading-deno)
* [Upgrading mime-db](#upgrading-mime-db)

## Copy git hook for standardized commit messages

This makes your commit messages as follows: `[branch-name] commit message`

```shell
/path/to/deno-drash/console/git_hooks/copy-prepare-commit-msg
```

## Building the API Reference page's JSON data

```shell
console/build_docs
```

`console/build_docs` will create `api_reference.json` in the root directory of your `deno-drash` clone (e.g., `/path/to/deno-drash/api_reference.json`).

If the `deno-drash-docs` repo needs to be updated, then make a PR to it by updating the `api_reference.json` file to use the newly built one.

## Upgrading Deno

Check out the `upgrade-deno` branch.

```
git checkout upgrade-deno
git pull
```

Update the `deps.ts` file automatically by updating line the `bumpVersions()` call in `console/typescript/bump_versions.ts`. This call should reflect which version to update from and which version to update to. See below as an example.

```typescript
let result = await bumpVersions(fromVersion, toVersion);
```

Run the following command.

```
console/bump_verisons
```

Update the version property in `mod.ts`:
```typescript
export const version: string = "the new version here"; // "v0.41.1"
```

Update `README.md`.

Update `console/install_deno`.

Update `REQUIREMENTS.md`.

Commit your changes.

```
git commit -m "upgrade deno to {version}"
```

Make a pull request to `master`.

## Upgrading mime-db

Check out the `upgrade-mime-db` branch.

```
git checkout upgrade-mime-db
git pull
```

Go to https://github.com/jshttp/mime-db/blob/master/db.json

Copy the file's contents into `/src/dictionaries/mime_db.json`.

Commit your changes.

```
git commit -m "upgrade mime-db to {version}"
```

Make a pull request to `master`.
