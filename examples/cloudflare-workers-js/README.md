# Drash / Cloudflare Workers / ECMAScript (aka ESM)

## Quickstart

1. Install [Node](https://nodejs.org) (v16+).

1. Install dependencies in `package.json`.

   ```bash
   npm install
   ```

1. Run the Drash app using Cloudflare's [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/).

   ```bash
   npx wrangler@latest dev app.js
   ```

   _Note: At the time of writing this tutorial, latest `wrangler` version is 3.15.0_

   You should see output similar to:

   ```text
   ⛅️ wrangler 3.15.0
   -------------------
   ⎔ Starting local server...
   [mf:inf] Ready on http://0.0.0.0:8787
   [mf:inf] - http://127.0.0.1:8787
   [mf:inf] - http://192.168.1.139:8787
   ```

1. Go to Wrangler local server at `http://0.0.0.0:8787`.

   You should see something like the following:

   ```text
   Hello from Home.GET()! (written at Wed Nov 01 2023 22:04:56 GMT-0400 (Eastern Daylight Time))
   ```
