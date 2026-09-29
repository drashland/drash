// The models the page offers and the only ones the server will call. Both
// sides import this list, so they cannot disagree. It is plain data with no
// secrets in it, which is what makes it safe to ship to the browser.
export const MODELS = {
  "claude-opus-5": "Claude Opus 5",
  "claude-sonnet-5": "Claude Sonnet 5",
  "claude-haiku-4-5": "Claude Haiku 4.5",
  "claude-fable-5-1": "Claude Fable 5.1",
} as const;

export type Model = keyof typeof MODELS;

export const DEFAULT_MODEL: Model = "claude-opus-5";

export function isModel(value: unknown): value is Model {
  return typeof value === "string" && Object.hasOwn(MODELS, value);
}
