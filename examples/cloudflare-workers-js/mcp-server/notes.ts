// Per-isolate and not durable, which on Workers is a real problem rather than
// a simplification — see the overview's note on state. This file is the only
// thing that changes when you move to Workers KV, D1, or a Durable Object.
export const NOTES = new Map<string, string>([
  ["welcome", "Drash is a microframework for building HTTP systems."],
]);
