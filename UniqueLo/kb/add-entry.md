# How to add a KB entry

1. Read `index.md` — check the fact isn't already captured on an existing page.
2. Create `kb/<slug>.md` with frontmatter (title, type, updated, sources, links).
3. **Every page links to ≥2 other pages** via `[[wikilinks]]` — an unlinked page is invisible.
4. Add the page to `index.md` (one-line summary + related).
5. Update `updated:` on any existing page you cross-linked from, if the new fact changes it.
6. Record the change in the page's `## Changelog`.
7. Bugs get `status: open` in frontmatter and move to `status: fixed` with a dated
   changelog line when resolved — never delete a bug page; it's regression history.

**Rule of thumb:** specs live in `../docs/`, cross-checked current-state reality lives
here. If a KB page and a docs page disagree, the docs are usually aspirational and this
one is usually true — reconcile both.