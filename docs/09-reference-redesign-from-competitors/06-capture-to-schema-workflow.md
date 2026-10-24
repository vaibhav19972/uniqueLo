# Capture → Schema Workflow

> You screenshot competitor apps; this turns those screenshots into page
> structure and data schemas we can build against. **No decompilation for this** —
> screenshots are the correct instrument (see `00-positioning-reframe.md` §6).

## Why this exists

A folder of screenshots is not research. It becomes research when each capture
yields (a) the **block order** of the page and (b) the **fields** each block
needs — because those two outputs map directly onto `src/lib/data.ts` and the
existing components. Everything else is wallpaper.

## Capture standard

| Rule | Why |
|---|---|
| One screen per file, full-bleed, no device frame | Frames eat pixels and add nothing |
| 390×844 (iPhone) **and** 360×800 (Android) for any mobile screen | Tier-2/3 skews Android; a layout that only works on iPhone is untested |
| Capture **3 scroll positions**: top, mid, bottom | Sticky headers, lazy rows and footer trust bars only appear when scrolling |
| Capture open **and** closed state for every sheet/modal/drawer | The closed state is the affordance; the open state is the content |
| Capture the **empty** and **error** states | The states most likely to be missing from our build |
| Log the URL/path + build version + date | Unlabelled screenshots are unreadable a week later |

Naming: `NN-<screen>-<state>-<viewport>.png`
→ `03-plp-filters-open-390.png`, `07-pdp-size-chart-open-390.png`

Store under `assets/myntra/`, `assets/nykaa-fashion/`, `assets/bewakoof/` …
(src-only, gitignored if large — confirm before committing binaries).

## Per-screen extraction sheet

Copy this block into the competitor's teardown file, one per screen. Fill it by
**looking at the screenshot**, not from memory.

```markdown
### <Screen name> — <viewport>

**Source:** <url or app path> · **Captured:** <date> · **Build:** <version>

| # | Block | Content observed | Data fields required | Ours has it? |
|---|---|---|---|---|
| 1 | | | | yes / no / partial |
| 2 | | | | |

**Block order:** 1 → 2 → 3 …
**Above the fold ends after:** block <n>
**States captured:** default / empty / error / loading
**Verbatim micro-copy worth studying:** "…"
**What I'd change for us:** …
```

The **"Data fields required"** column is the whole point. It produces the schema
directly:

- field appears in ≥2 competitors → it belongs in our contract
- field appears in 1 competitor at our price band → candidate, discuss
- field appears only at >₹4,000 → likely luxury noise, skip
- field we already have but is composed inconsistently → **a presentation gap,
  not a data gap**

## Why the last two rows matter

Our catalog carries craft-depth fields no mass-market competitor has at all:
`fabricGsm`, `craftRegion`, `craftCluster`, `handcrafted`. Verified as rendered
in `src/components` and `src/pages` (fabricGsm in 3 files, craftCluster in 2,
handcrafted in 8). That is our moat on PDP — keep it.

The real gap is different, and it is at the **card and above-the-fold level**:
`rating` (7 UI files), `reviewCount` (3), `soldCount` (2) are all rendered, but
spread thinly and inconsistently rather than composed into one scannable trust
row. Meanwhile the trust surfaces that decide a tier-2/3 first order — **COD
availability, delivery date, return window** — are not in the contract at all.

So the first capture pass should answer two things:

1. **Composition, not presence.** Myntra/Nykaa put rating + count + price + badge
   in a fixed visual order on the card. What is that order, and at what density?
2. **The missing trust block.** Where exactly do COD, delivery date and return
   window sit relative to price and CTA — and in what wording?

Question 1 is free (no new data). Question 2 needs new contract fields and is the
higher-value of the two.

## Ordering of work

1. **PLP card + filter sheet** (highest reuse, affects every page)
2. **PDP: size guidance + trust block + price block**
3. **Bag / checkout: COD, delivery date, coupon**
4. Home (lowest reuse — most brand-specific)

Do not capture Home first. It is the most fun and the least reusable.

## Where the output goes

| Output | Destination |
|---|---|
| Structure + field findings | `05-myntra-teardown.md` etc., per screen |
| Adopt/Adapt/Reject verdicts | `03-pick-and-place-for-uniquelo.md` |
| Build tasks | `04-implementation-roadmap.md` |
| New contract fields | `src/lib/data.ts` + `docs/03-data-contracts`, via `docs/README.md §4` gate |
