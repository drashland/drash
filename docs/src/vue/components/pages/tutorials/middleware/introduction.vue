<script>
export const resource = {
  paths: [
    "/tutorials/middleware/introduction"
  ],
  meta: {
    title: "Introduction To Middleware",
    source_code_uri: "/middleware/introduction"
  }
}

export default {
  data() {
    return {
      example_code: this.$app_data.example_code['/docs/src/example_code/tutorials/middleware/introduction'],
      toc: {
        items: [
          "Basics",
          "Middleware Types",
          "Setting The Execution Location",
          "Sorting Middleware",
        ]
      }
    };
  },
}
</script>

<template lang="pug">
page
    div.row
      div.col
        hr
        h2 Table Of Contents
        ul-toc(:data="toc")
    div.row
      div.col
        hr
        h2-hash Basics
        p Drash defines middleware according to the MDN: <a href="https://developer.mozilla.org/en-US/docs/Glossary/Middleware" target="_BLANK">https://developer.mozilla.org/en-US/docs/Glossary/Middleware</a>.
        p Adding middleware to your application is useful when you want to filter requests throughout the request-resource-response lifecycle.
    div.row
      div.col
        hr
        h2-hash Middleware Types
        p There are two types of middleware in Drash: server-level middleware and resource-level middleware.
        h3#server-level-middleware Server-Level Middleware
        p Server-level middleware is middleware executed by the server on every request. You define server-level middleware when you create your server object. Server-level middleware can be executed before or after a request. Read the <a href="/#/tutorials/middleware/introduction#setting-the-execution-location">Setting The Execution Location</a> section below for more information on execution locations.
        p Take the example below. There are server-level middleware that will execute before the request and after the request. <code>AuthMiddleware</code> and <code>CacheMiddleware</code> will execute before the request. <code>SomeOtherMiddleware</code> will execute after the request. These middleware will execute on every request.
        p
          code-block-slotted(:header="false" language="typescript" line_highlight="3-13")
            template(v-slot:code) {{ example_code.location_server_level.contents }}
        h3#resource-level-middleware Resource-Level Middleware
        p Resource-level middleware is middleware executed by resources. That is, if a resource specifies a list of middleware in its <code>middleware</code> property, then that middleware will be executed. The server cannot execute resource-level middleware. You define resource-level middleware when you create your server object. Resource-level middleware can be executed before or after a request. Read the <a href="/#/tutorials/middleware/introduction#setting-the-execution-location">Setting The Execution Location</a> section below for more information on execution locations.
        p Take the example below. When the server object is created, it registers the following resource-level middleware: <code>MyFirstMiddleware</code>, <code>MySecondMiddleware</code>, and <code>MyThirdMiddleware</code>. When a request is made to the <code>/</code> URI, the server will see that the <code>/</code> URI is handled by <code>HomeResource</code>. It will also see that <code>HomeResource</code> has middleware defined and will execute the middleware based on their set locations (before or after the request). <code>MyThirdMiddleware</code> was registered by the server, but it will not be executed unless a resource adds it to its <code>middleware</code> property. You might have noticed the middleware defined in <code>HomeResource</code> are strings. This is intentional. They are strings because it helps keep your resource class file clean from <code>import</code> statements in case you have a long list of middleware. The server object uses these strings as keys when finding the middleware you have defined.
        p
          code-block-slotted(:header="false" language="typescript" line_highlight="5-12")
            template(v-slot:code) {{ example_code.location_resource_level.contents }}
    div.row
      div.col
        hr
        h2-hash Setting The Execution Location
        p There are two locations where middleware can be executed: before the request and after the request.
        h3#before-the-request Before The Request
        p Middleware executed before the request means it is executed before a resource's HTTP method (e.g., <code>MyResource.GET()</code>, <code>MyResource.POST()</code>, <code>MyResource.DELETE()</code>) is called.
        h3#after-the-request After The Request
        p Middleware executed after the request means it is executed immediately after a resource's HTTP method (e.g., <code>MyResource.GET()</code>, <code>MyResource.POST()</code>, <code>MyResource.DELETE()</code>) is called and before a response is sent to the client that made the request.
        h3#setting-the-execution-location-of-server-level-middleware Setting The Execution Location Of Server-Level Middleware
        p You can have server-level middleware execute before and after the request by placing your middleware in the <code>before_request</code> array or <code>after_request</code> array. See the example below to see middleware defined in these arrays.
        p
          code-block-slotted(:header="false" language="typescript" line_highlight="5,9")
            template(v-slot:code) {{ example_code.location_server_level.contents }}
        h3#setting-the-execution-location-of-resource-level-middleware Setting The Execution Location Of Resource-Level Middleware
        p You can have resource-level middleware execute before and after the request by placing your middleware in the <code>before_request</code> array or <code>after_request</code> array in your resource class' <code>middleware</code> property.  See the example below to see middleware defined in these arays.
        p
          code-block-slotted(:header="false" language="typescript" line_highlight="7,10")
            template(v-slot:code) {{ example_code.location_resource_level.contents }}
    div.row
      div.col
        hr
        h2-hash Sorting Middleware
        p Middleware is executed in the order you define them. Take the example below.
        p
          code-block-slotted(:header="false" language="typescript" line_highlight="6,7,11,12")
            template(v-slot:code) {{ example_code.sorting.contents }}
        p The server-level middleware would execute in the following order:
        ul
          li <code>OneMiddleware</code>
          li <code>TwoMiddleware</code>
        p The resource-level middleware would execute in the following order:
        ul
          li <code>RedMiddleware</code>
          li <code>BlueMiddleware</code>
</template>
