# Drash / Cloudflare Workers / ECMAScript (aka ESM)

## Quickstart

1. Install [Node](https://nodejs.org) (v20+).

1. Install dependencies in `package.json`.

   ```bash
   npm install
   ```

1. Run the Drash app using Cloudflare's [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/).

   ```bash
   npm start
   ```

   _Note: `npm start` is defined in the `package.json` file and runs `wrangler dev app.js`._

   You should see output similar to:

   ```text
   ⛅️ wrangler 4.121.0
   -------------------
   ⎔ Starting local server...
   [wrangler:inf] Ready on http://localhost:8787
   ```

1. Go to Wrangler local server at `http://0.0.0.0:8787`.

   You should see something like the following:

   ```text
   Oh so easy (written at Wed Nov 01 2023 22:04:56 GMT-0400 (Eastern Daylight Time))
   ```
