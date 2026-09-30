// Stands in for a database. Swapping this one file for a real store is the
// whole migration — see the overview's note on state. Nothing else changes.
export const NOTES = new Map<string, string>([
  ["welcome", "Drash is a microframework for building HTTP systems."],
]);
