import members from "../../members.ts";

members.test(async function HttpService_hydrateHttpRequest() {
  let request = members.mockRequest(
    "/?what=the&ok=then&kthx=bye&empty=&cmon_now",
    "get",
    {},
    false
  );
  request = members.Drash.Services.HttpService.hydrateHttpRequest(request);
  members.assert.equal(
    request.url_query_params,
    {
      what: "the",
      ok: "then",
      kthx: "bye",
      empty: "",
      cmon_now: undefined
    }
  );
});

