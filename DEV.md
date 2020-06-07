# Upgrading Deno

* Checkout a new branch: `upgrade-deno`

* Update all `std` dependencies in all `deps.ts` files to use the latest Deno `std` version

* Update any references to Drash's version (eg import statements)

* Update `README.md`

* Update `REQUIREMENTS.md`

* Comment your changes: `git commit -m "Upgrade Deno to {version}"`

* Make a pull request to master