type BasicAppTestCase = {
  method: string;
  expected: {
    status: number;
    body: string;
  }
};

export const testCases: BasicAppTestCase[] = [
  {
    method: "GET",
    expected: {
      status: 200,
      body: "Hello from GET.",
    }
  },
  {
    method: "POST",
    expected: {
      status: 200,
      body: "Hello from POST.",
    }
  },
  {
    method: "PUT",
    expected: {
      status: 501,
      body: "Not Implemented",
    }
  },
  {
    method: "DELETE",
    expected: {
      status: 500,
      body: "Hey, I'm the DELETE endpoint. Errrr.",
    }
  },
  {
    method: "PATCH",
    expected: {
      status: 405,
      body: "Method Not Allowed",
    }
  }
];

export const testCasesNotFound: BasicAppTestCase[] = [
  {
    method: "GET",
    expected: {
      status: 404,
      body: "Not Found"
    }
  },
  {
    method: "POST",
    expected: {
      status: 404,
      body: "Not Found"
    }
  },
  {
    method: "PUT",
    expected: {
      status: 404,
      body: "Not Found"
    }
  },
  {
    method: "DELETE",
    expected: {
      status: 404,
      body: "Not Found"
    }
  },
  {
    method: "PATCH",
    expected: {
      status: 404,
      body: "Not Found"
    }
  },
];
