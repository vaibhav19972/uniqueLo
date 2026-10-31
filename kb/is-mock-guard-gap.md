---
title: is_mock Guard Gap
type: bug
status: closed (retired by decision 2026-10-25)
updated: 2026-10-25
sources: [backend/CONTRACT.md §5, backend/contracts/parity-gaps.md, src/lib/data.ts]
links: ["[[catalog-fallback-gate]]", "[[audit-trail]]", "[[legacy-catalog-frozen]]"]
---

# is_mock Guard Gap (CLOSED / RETIRED)

> **Status: Closed 2026-10-25.**
> There is **no `is_mock` column and no mock flag in the contract or schema**.
> Retired on 2026-10-25: nothing consumed it, the column never existed in the
> production schema, and catalogue size is a property of the data, not of a boolean.
> `mock-products.json` is a client-side offline fallback only, while the database holds
> the real published catalogue. No `.eq('is_mock', ...)` filter is required or valid.

## Historical Context (2026-10-11 to 2026-10-12)

Prior to the 2026-10-25 contract alignment, an `is_mock` flag was proposed to distinguish
local prototypes from database rows. That flag was officially retired across web, mobile,
and backend. Both clients now query `products` directly and map rows via their adapters.