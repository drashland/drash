/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * A `URLPattern` implementation for runtimes that do not provide a dependable
 * one. Supports the pathname syntax Drash's resources use, not the whole spec.
 *
 * @module
 */

/**
 * What a successful match returns: the path params, keyed by the names declared
 * in the path.
 */
export type ExecResult = {
  pathname?: {
    groups: Record<string, string | undefined>;
  };
};

// The pathname rules below follow the URLPattern spec's pattern parser:
// https://urlpattern.spec.whatwg.org/#parsing-patterns

type TokenType =
  | "char"
  | "escaped-char"
  | "name"
  | "regexp"
  | "asterisk"
  | "other-modifier"
  | "open"
  | "close"
  | "end";

type Token = { type: TokenType; value: string };

type Modifier = "" | "?" | "*" | "+";

type Part =
  | { type: "fixed"; value: string; modifier: Modifier }
  | {
    type: "param";
    name: string;
    regexp: string;
    prefix: string;
    suffix: string;
    modifier: Modifier;
  };

/** What `:name` matches when no regexp follows it: one path segment. */
const SEGMENT_WILDCARD = "[^\\/]+?";
/** What `*` matches: anything, slashes included. */
const FULL_WILDCARD = ".*";

const NAME_START = /[$_\p{ID_Start}]/u;
const NAME_CONTINUE = /[$‌‍\p{ID_Continue}]/u;

/**
 * A `URLPattern` for runtimes that do not provide a dependable one.
 *
 * This implements the `URLPattern` pathname syntax Drash resources use — named
 * params (`:id`), params constrained by a regexp (`:id(\\d+)`), unnamed regexp
 * groups (`(\\d+)`), wildcards (`*`), `?`/`*`/`+` modifiers, and `{...}` groups
 * — and matches the same URLs, with the same groups, as the native class. It
 * matches on the path only; the other URL components are ignored.
 */
class URLPatternPolyfill {
  #regexp: RegExp;
  #names: string[];

  /**
   * The path this pattern was compiled from, with the trailing-slash suffix the
   * resource index appends removed.
   */
  public readonly pathname: string;

  /**
   * Compile a path into the regular expression used to match it.
   *
   * @param options The pattern source. Only `pathname` is used.
   * @throws {TypeError} If the path is not a valid pattern — the same paths the
   * native `URLPattern` rejects.
   */
  constructor(options: { pathname: string }) {
    const parts = parse(tokenize(options.pathname));
    const { source, names } = generateRegExp(parts);
    this.#regexp = new RegExp(source, "u");
    this.#names = names;
    this.pathname = options.pathname.replace("{/}?", "");
  }

  /**
   * Match a URL against this pattern.
   *
   * @param url The URL to match. Only its path is considered.
   * @returns The matched path params, or `null` if the path does not match.
   */
  exec(url: string): ExecResult | null {
    const { pathname } = new URL(url);
    const matches = this.#regexp.exec(pathname);

    if (matches === null) {
      return null;
    }

    const groups: Record<string, string | undefined> = {};
    this.#names.forEach((name, index) => {
      groups[name] = matches[index + 1];
    });

    return { pathname: { groups } };
  }
}

/**
 * Split a pathname pattern into tokens.
 *
 * @param input The pathname pattern.
 * @returns The tokens, ending with an `end` token.
 * @throws {TypeError} On a dangling `\`, an empty name, or a malformed regexp
 * group.
 */
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const chars = [...input];
  let i = 0;

  while (i < chars.length) {
    const char = chars[i];

    if (char === "*") {
      tokens.push({ type: "asterisk", value: char });
      i++;
      continue;
    }

    if (char === "+" || char === "?") {
      tokens.push({ type: "other-modifier", value: char });
      i++;
      continue;
    }

    if (char === "\\") {
      if (i + 1 >= chars.length) {
        throw invalid(input, "it ends with a `\\`");
      }
      tokens.push({ type: "escaped-char", value: chars[i + 1] });
      i += 2;
      continue;
    }

    if (char === "{") {
      tokens.push({ type: "open", value: char });
      i++;
      continue;
    }

    if (char === "}") {
      tokens.push({ type: "close", value: char });
      i++;
      continue;
    }

    if (char === ":") {
      let name = "";
      let j = i + 1;
      while (
        j < chars.length &&
        (name === "" ? NAME_START : NAME_CONTINUE).test(chars[j])
      ) {
        name += chars[j];
        j++;
      }
      if (name === "") {
        throw invalid(input, `the \`:\` at index ${i} has no name`);
      }
      tokens.push({ type: "name", value: name });
      i = j;
      continue;
    }

    if (char === "(") {
      const { value, end } = readRegExp(input, chars, i);
      tokens.push({ type: "regexp", value });
      i = end;
      continue;
    }

    tokens.push({ type: "char", value: char });
    i++;
  }

  tokens.push({ type: "end", value: "" });
  return tokens;
}

/**
 * Read a `(...)` regexp group starting at `start`.
 *
 * @returns The regexp between the parentheses and the index just past them.
 * @throws {TypeError} If the group is empty, unbalanced, starts with `?`, or
 * contains a capturing group — the same rules the native `URLPattern` applies.
 */
function readRegExp(
  input: string,
  chars: string[],
  start: number,
): { value: string; end: number } {
  let depth = 1;
  let value = "";
  let j = start + 1;

  if (chars[j] === "?") {
    throw invalid(input, `the regexp at index ${start} starts with \`?\``);
  }

  while (j < chars.length) {
    const char = chars[j];

    if (!isAscii(char)) {
      throw invalid(input, `the regexp at index ${start} is not ASCII`);
    }

    if (char === "\\") {
      if (j + 1 >= chars.length || !isAscii(chars[j + 1])) {
        throw invalid(input, `the regexp at index ${start} has a bad escape`);
      }
      value += char + chars[j + 1];
      j += 2;
      continue;
    }

    if (char === ")") {
      depth--;
      if (depth === 0) {
        j++;
        break;
      }
    } else if (char === "(") {
      depth++;
      if (chars[j + 1] !== "?") {
        throw invalid(
          input,
          `the regexp at index ${start} contains a capturing group`,
        );
      }
    }

    value += char;
    j++;
  }

  if (depth !== 0) {
    throw invalid(input, `the regexp at index ${start} is not closed`);
  }

  if (value === "") {
    throw invalid(input, `the regexp at index ${start} is empty`);
  }

  return { value, end: j };
}

/**
 * Turn tokens into fixed parts and param parts.
 *
 * A `/` directly before a param becomes that param's prefix, which is what
 * lets `/users/:id?` match `/users` — the modifier covers the slash too.
 *
 * @param tokens The tokens from {@link tokenize}.
 * @returns The parts, in order.
 * @throws {TypeError} On an unclosed `{` or a repeated param name.
 */
function parse(tokens: Token[]): Part[] {
  const parts: Part[] = [];
  const names = new Set<string>();
  let index = 0;
  let pendingFixed = "";
  let nextUnnamed = 0;

  const tryConsume = (type: TokenType): Token | null => {
    if (tokens[index].type !== type) {
      return null;
    }
    return tokens[index++];
  };

  const tryConsumeModifier = (): Modifier => {
    const token = tryConsume("other-modifier") ?? tryConsume("asterisk");
    return (token?.value ?? "") as Modifier;
  };

  const tryConsumeRegExpOrWildcard = (name: Token | null): Token | null => {
    const regexp = tryConsume("regexp");
    if (regexp === null && name === null) {
      return tryConsume("asterisk");
    }
    return regexp;
  };

  const consumeText = (): string => {
    let text = "";
    while (true) {
      const token = tryConsume("char") ?? tryConsume("escaped-char");
      if (token === null) {
        return text;
      }
      text += token.value;
    }
  };

  const flushPendingFixed = (): void => {
    if (pendingFixed === "") {
      return;
    }
    parts.push({
      type: "fixed",
      value: encodePathname(pendingFixed),
      modifier: "",
    });
    pendingFixed = "";
  };

  const addPart = (
    prefix: string,
    name: Token | null,
    regexpOrWildcard: Token | null,
    suffix: string,
    modifier: Modifier,
  ): void => {
    if (name === null && regexpOrWildcard === null && modifier === "") {
      pendingFixed += prefix;
      return;
    }

    flushPendingFixed();

    if (name === null && regexpOrWildcard === null) {
      if (prefix !== "") {
        parts.push({ type: "fixed", value: encodePathname(prefix), modifier });
      }
      return;
    }

    let regexp = SEGMENT_WILDCARD;
    if (regexpOrWildcard?.type === "asterisk") {
      regexp = FULL_WILDCARD;
    } else if (regexpOrWildcard?.type === "regexp") {
      regexp = regexpOrWildcard.value;
    }

    const partName = name?.value ?? String(nextUnnamed++);
    if (names.has(partName)) {
      throw new TypeError(
        `Invalid path pattern: the name "${partName}" is used more than once`,
      );
    }
    names.add(partName);

    parts.push({
      type: "param",
      name: partName,
      regexp,
      prefix: encodePathname(prefix),
      suffix: encodePathname(suffix),
      modifier,
    });
  };

  while (index < tokens.length) {
    const char = tryConsume("char");
    const name = tryConsume("name");
    const regexpOrWildcard = tryConsumeRegExpOrWildcard(name);

    if (name !== null || regexpOrWildcard !== null) {
      let prefix = char?.value ?? "";
      if (prefix !== "/") {
        pendingFixed += prefix;
        prefix = "";
      }
      flushPendingFixed();
      addPart(prefix, name, regexpOrWildcard, "", tryConsumeModifier());
      continue;
    }

    const fixed = char ?? tryConsume("escaped-char");
    if (fixed !== null) {
      pendingFixed += fixed.value;
      continue;
    }

    if (tryConsume("open") !== null) {
      const prefix = consumeText();
      const groupName = tryConsume("name");
      const groupRegExp = tryConsumeRegExpOrWildcard(groupName);
      const suffix = consumeText();
      if (tryConsume("close") === null) {
        throw new TypeError("Invalid path pattern: a `{` is not closed");
      }
      addPart(prefix, groupName, groupRegExp, suffix, tryConsumeModifier());
      continue;
    }

    flushPendingFixed();

    if (tryConsume("end") === null) {
      throw new TypeError(
        `Invalid path pattern: unexpected \`${tokens[index].value}\``,
      );
    }
  }

  return parts;
}

/**
 * Build the regular expression source for a list of parts, and the param name
 * for each capturing group in it.
 */
function generateRegExp(parts: Part[]): { source: string; names: string[] } {
  let source = "^";
  const names: string[] = [];

  for (const part of parts) {
    if (part.type === "fixed") {
      source += part.modifier === ""
        ? escapeRegExp(part.value)
        : `(?:${escapeRegExp(part.value)})${part.modifier}`;
      continue;
    }

    names.push(part.name);
    const prefix = escapeRegExp(part.prefix);
    const suffix = escapeRegExp(part.suffix);
    const repeats = part.modifier === "*" || part.modifier === "+";

    if (prefix === "" && suffix === "") {
      source += repeats
        ? `((?:${part.regexp})${part.modifier})`
        : `(${part.regexp})${part.modifier}`;
      continue;
    }

    if (!repeats) {
      source += `(?:${prefix}(${part.regexp})${suffix})${part.modifier}`;
      continue;
    }

    source +=
      `(?:${prefix}((?:${part.regexp})(?:${suffix}${prefix}(?:${part.regexp}))*)${suffix})`;
    if (part.modifier === "*") {
      source += "?";
    }
  }

  return { source: source + "$", names };
}

/**
 * Escape the characters that mean something in a regular expression, so
 * literal text in a path matches only itself.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.+*?^${}()[\]|/\\]/g, "\\$&");
}

/**
 * Percent-encode literal path text the way a request URL's pathname is
 * encoded, so `/café` in a resource matches a request for `/café`.
 */
function encodePathname(value: string): string {
  if (value === "") {
    return value;
  }

  // A non-special URL, like the spec's dummy URL, so `\` is not read as `/`.
  // `?` and `#` are path text here, not the start of a query or fragment.
  const leadingSlash = value.startsWith("/");
  const path = (leadingSlash ? value : "/-" + value)
    .replace(/\?/g, "%3F")
    .replace(/#/g, "%23");
  const encoded = new URL(path, "drash://pattern").pathname;

  return leadingSlash ? encoded : encoded.slice(2);
}

function isAscii(char: string): boolean {
  return char.codePointAt(0)! <= 0x7f;
}

function invalid(input: string, reason: string): TypeError {
  return new TypeError(`Invalid path pattern "${input}": ${reason}`);
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { URLPatternPolyfill };
