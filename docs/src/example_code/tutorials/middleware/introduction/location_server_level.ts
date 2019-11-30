let server = new Drash.Http.Server({
  address: "localhost:1447",
  middleware: {
    server_level: {
      before_request: [
        AuthMiddleware,
        CacheMiddleware,
      ],
      after_request: [
        SomeOtherMiddleware,
      ]
    }
  },
  resources: [
    HomeResource
  ],
  response_output: "application/json",
});
