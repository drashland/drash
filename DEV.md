# Dev Environment Setup

## Table of Contents

- [Upgrading mime-db](#upgrading-mime-db)
- [Running Create App Tests on Windows](#running-create-app-tests-on-windows)
- [Releasing](#releasing)
- [Upgrading Deno Version And Drash
  Dependencies](#upgrading-deno-version-and-drash-dependencies)

## Upgrading mime-db

Check out a new branch based off of `master`.

```
git checkout master
git checkout -b upgrade-mime-db
```

Go to https://github.com/jshttp/mime-db/blob/master/db.json.

Copy the file's contents into `/src/dictionaries/mime_db.ts`.

Commit your changes.

```
git commit -m "upgrade mime-db to {version}"
```

Make a pull request to `master`.

## Running Create App Tests on Windows

There are a couple known issues discovered when running these tests on windows.

- If a test case fails but the expected and actual output looks exactly the
  same, check the line endings of the related files, for examaple if comparing
  the contents of `/console/create_app/app.ts` and `tmp-dir/app.ts` but one has
  `LF` whilst the other has `CRLF`, then this will cause the mentioned error

- To ease in debugging, if you get a `PermissionDenied`, but specifically on
  `Deno.mkdir[Sync]`, try run the following to open a new shell and re-run the
  tests: `PS> Start-Process powershell -Verb runAs`
