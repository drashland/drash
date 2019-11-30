let server = new Drash.Http.Server({
  address: "localhost:1447",
  middleware: {
    server_level: [
      OneMiddleware,
      TwoMiddleware
    ],
    resource_level: [
      RedMiddleware,
      BlueMiddleware
    ]
  },
  resources: [
    HomeResource
  ],
  response_output: "application/json",
});
