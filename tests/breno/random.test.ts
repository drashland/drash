import { assertEquals, test } from "../deps.ts";

type ObjectOrMap<T> = T | Map<string, ObjectOrMap<T>>;

function createMap<T>(uri: string, obj: T) {
  if (uri.startsWith("/") === true) {
    // The uri starts with /, remove first
    uri = uri.slice(1);
  }
  if (uri.endsWith("/") === true) {
    // The uri ends with /, remove first
    uri = uri.slice(0, -1);
  }
  const map = new Map<string, T>();
  return map.set(uri, obj);
}

function searchMap<T>(
  uri: string,
  map: Map<string, T>,
): T | undefined {
  if (uri.startsWith("/") === true) {
    // The uri starts with /, remove first
    uri = uri.slice(1);
  }
  if (uri.endsWith("/") === true) {
    // The uri ends with /, remove first
    uri = uri.slice(0, -1);
  }

  const value = map.get(uri);
  return value;
}

test("custom", function () {
  const map = createMap<Record<string, unknown>>("/hello/world/", {
    foo: "bar",
  });

  console.log(map);

  const r = searchMap<Record<string, unknown>>("hello/world", map);
  console.log(r);
});
