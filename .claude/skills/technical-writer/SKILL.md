---
name: technical-writer
description: Write or edit pages on the Drash documentation site (Nextra 4 + MDX under docs/). Use when adding a page, restructuring the sidebar, editing docs copy, or reviewing documentation for accuracy and voice.
---

# Technical Writer

Documentation for Drash lives in `docs/`, a Nextra 4 site built with Next.js and
exported statically. Follow this when writing or editing any page under
`docs/content/`.

## Voice

- **Concrete over persuasive.** Name the mechanism, not the feeling. "A strict
  resource interface forces separation of concerns" beats "clean, maintainable
  architecture."
- **No filler.** Cut "powerful", "seamless", "simply", "just", "easily". If a
  sentence survives deleting the adjective, delete it.
- **Concede real limits.** A stated trade-off is more convincing than an
  unqualified claim. Saying the only lock-in is your runtime's is stronger than
  claiming there is none.
- **Second person for instructions, present tense for behaviour.** "You hand the
  chain a request." "The chain rejects on error."

## Verify before asserting

Docs that describe code must be checked against the code.

- **API surface**: read `src/` — do not infer from another doc page. Entry-point
  exports live in `src/modules/http.native.ts` and `http.polyfill.ts`; the chain
  builder in `src/modules/builders/RequestChainBuilder.ts`.
- **Versions**: take them from CI (`.github/workflows/*.yml`) or `package.json`.
  If a number cannot be sourced, say what is tested rather than inventing a
  minimum.
- **Import paths differ between source and npm.** The published package uses
  `@drashland/drash/modules/chains/RequestChain/mod.*`; the source has been
  renamed to `modules/http.*`. Check which one a page should show, and keep a
  page internally consistent.
- **Error messages**: quote them from source, not memory.

## One fact, one page

The site splits by intent. Putting the same explanation in two places means both
rot.

| Section                    | Holds                                     |
| -------------------------- | ----------------------------------------- |
| `content/docs/concepts/`   | Why it works that way                     |
| `content/docs/quickstart/` | A complete app per runtime                |
| `content/docs/tutorials/`  | Building something step by step           |
| `content/reference/`       | API surface, by Core / Standard / Modules |
| `content/examples/`        | Finished apps you can run                 |

Cross-link instead of repeating. When merging pages, delete the duplicate rather
than keeping both phrasings.

## Nextra mechanics

**Components are global** — no imports needed. `mdx-components.js` injects
`Callout`, `Cards`, `Compare`, `CompareItem`, `FileTree`, `SeeAlso`, `Steps`,
`Tabs`, and the table elements.

- `<Callout type="info" | "warning" | "gray">` — `gray` is a local component.
- `<Cards>` — **title-only** on this site. Passing children switches the card to
  a filled style and breaks visual consistency with every other card.
- `<Tabs items={[…]}>` — put shared headings _outside_ the group. A `###` inside
  four tabs produces four TOC entries (`#steps`, `#steps-1`, …). Two groups can
  be synced with a matching `storageKey`, but one group is better when the
  reader should choose once.

**`_meta.js` controls order and labels.** Keys are file basenames; order in the
file is order in the sidebar.

- A folder that appears first in its parent `_meta.js` **must contain an
  `index.mdx`**. The breadcrumb resolves to the folder's own route, and a folder
  with no index 404s.
- `display: "hidden"` keeps a page out of the sidebar; omit `type` to keep it out
  of the top bar too.
- Use `"quoted-keys"` for hyphenated basenames, matching the other `_meta.js`
  files.

**Code fences** support `filename=`, `showLineNumbers`, and highlight ranges:

    ```ts filename="app.ts" showLineNumbers {2,13-17}

Inside a list item, indent the fence **4 spaces** so it stays in the item. When a
step adds to the previous one, highlight only the added lines. Never delete
explanatory comments from a sample to make it shorter, and keep trailing comments
aligned to one column per block.

## Links

- Site-relative, no origin: `/docs/concepts/chains`.
- **Verify the route exists.** Folder routes without an `index.mdx` are not
  pages — `/reference/core` 404s while `/reference/core/http-error` works.
- Anchors are slugified with punctuation stripped: `.urlPatternClass(x)` becomes
  `#urlpatternclassurlpatternclass`. Confirm the id in the built HTML.
- **There are no redirects.** The site is `output: "export"`, so renaming or
  moving a page breaks every old URL. When moving one, rewrite every inbound
  link in the same change.

## Before calling it done

```bash
cd docs && pnpm build          # MDX and JSX errors surface here
deno fmt --check && deno lint  # from the repo root
```

`deno fmt` does **not** cover `.mdx`, so table alignment there is cosmetic only.

Then run the link check over the built output — it catches the moved-page and
missing-index cases that a grep will not:

```bash
cd docs && python3 - <<'PY'
import re, os, glob
def exists(p):
    p = p.split('#')[0].split('?')[0]; r = p.strip('/')
    if r == '': return os.path.isfile('out/index.html')
    return any(os.path.isfile(c) for c in
               (f'out/{r}/index.html', f'out/{r}', f'out/{r}.html'))
broken, total = {}, 0
for f in glob.glob('out/**/*.html', recursive=True):
    h = open(f, encoding='utf-8', errors='ignore').read()
    # `(?<!data-)` skips Nextra's data-href, which is metadata, not a link
    for href in set(re.findall(r'(?<!data-)href="(/[^"]*)"', h)):
        if href.startswith('//') or href.startswith('/_next'): continue
        total += 1
        if not exists(href): broken.setdefault(href, set()).add(f)
print(f"links={total}", "-> 0 broken" if not broken
      else "-> BROKEN: " + str({k: len(v) for k, v in broken.items()}))
PY
```

Report the counts. A page that builds is not a page that works.
