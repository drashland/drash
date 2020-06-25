# Dev Environment Setup

## Table of Contents

* [Copy git hook for standardized commit messages](#copy-git-hook-for-standardized-commit-messages)
* [Building the API Reference pages JSON data](#building-the-api-reference-pages-json-data)
* [Upgrading mime-db](#upgrading-mime-db)

## Building the API Reference page's JSON data

```shell
deno run --allow-read --allow-write console/api_reference_app/app.ts
```

If the `deno-drash-docs` repo needs to be updated, then make a PR to it by updating the `api_reference.json` file to use the newly built one.

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

## Releasing

Check the following files for version numbers that need to be updated.

* mod.ts - Check Drash.version
* README.md - Check the import statement in the Quick Start section
