import Drash from "https://deno.land/x/drash/mod.ts";

/**
 * Create an HTTP resource that handles HTTP requests to the / URI
 */
export default class HomeResource extends Drash.Http.Resource {
  /**
   * Define the paths (a.k.a. URIs) that clients can use to access this resource.
   */
  static paths = ["/"];

  /**
   * Handle GET requests.
   */
  public GET() {
    this.response.body = `<!DOCTYPE html>
<html class="w-full h-full">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, minimum-scale=1.0, user-scalable=no"/>
    <title>Drash</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet">
    <link href="/public/style.css" rel="stylesheet">
  </head>
  <body class="w-full h-full">
    <div class="flex justify-center w-full h-full">
      <div class="self-center max-w-sm rounded overflow-hidden shadow-lg">
        <div class="px-6 py-4">
          <div class="font-bold text-xl mb-2">Hello</div>
          <p class="text-grey-darker text-base my-text">This is my title and it is red.</p>
        </div>
        <div class="px-6 py-4">
          <span class="inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker mr-2">#cool</span>
          <span class="inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker mr-2">#made</span>
          <span class="inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker">#yay</span>
        </div>
      </div>
    </div>
  </body>
</html>
`;
    return this.response;
  }
}
