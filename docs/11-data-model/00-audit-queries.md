# 00 — Audit Queries

Every figure in `00-product-data-audit.md` came from one of these. Re-run them
before trusting the audit on a later date; the catalogue changes.

Run from `~/UniqueLo/web` unless noted.

## 1. Field presence — which fields exist, on how many products

```bash
python3 - <<'PY'
import json
d = json.load(open("src/data/mock-products.json"))
items = d if isinstance(d, list) else d.get("products", [])
keys = {}
for it in items:
    for k in it:
        keys[k] = keys.get(k, 0) + 1
print(f"{len(items)} products")
for k, v in sorted(keys.items()):
    print(f"  {k:24} {v}/{len(items)}")
PY
```

Result: 36 distinct keys, 13 products. Full-presence fields 26; partial:
`batchNumber` 2, `batchTotal` 2, `foreignTagline` 3, `motifId` 8,
`characterIds` 8, `customizable` 1.

## 2. Price distribution

```bash
python3 - <<'PY'
import json, statistics
d = json.load(open("src/data/mock-products.json"))
items = d if isinstance(d, list) else d.get("products", [])
p = [v["priceCents"]/100 for it in items for v in it.get("variants", []) if v.get("priceCents")]
print(f"points {len(p)}  min ₹{min(p):,.0f}  median ₹{statistics.median(p):,.0f}  max ₹{max(p):,.0f}")
PY
```

Result: 121 priced variants, ₹1,799 – ₹5,499, median ₹3,999. Nothing below ₹1,500.

## 3. `expressionScore` → `expressionSlug` is 1:1

```bash
python3 - <<'PY'
import json
d = json.load(open("src/data/mock-products.json"))
items = d if isinstance(d, list) else d.get("products", [])
m, ok = {}, True
for it in items:
    s, e = it["expressionScore"], it["expressionSlug"]
    if s in m and m[s] != e: ok = False
    m[s] = e
print("1:1:", ok, m)
PY
```

Result: `{1: minimal, 2: understated, 3: cult, 4: expressive, 5: maximalist}` — true.
→ `expressionSlug` is redundant.

## 4. `intensity` does NOT determine `expressionScore`

```bash
python3 - <<'PY'
import json
d = json.load(open("src/data/mock-products.json"))
items = d if isinstance(d, list) else d.get("products", [])
fallback = {"quiet": 1, "balanced": 3, "loud": 4}   # from data.ts getExpressionScore
bad = [(i["slug"], i["intensity"], i["expressionScore"]) for i in items
       if fallback[i["intensity"]] != i["expressionScore"]]
print(f"fallback wrong for {len(bad)}/{len(items)}")
for b in bad: print("  ", b)
PY
```

Result: wrong for **5 of 13** — the two axes are genuinely independent.

## 5. `characterIds` duplicates `motifId`

```bash
python3 - <<'PY'
import json
d = json.load(open("src/data/mock-products.json"))
items = d if isinstance(d, list) else d.get("products", [])
both = [i for i in items if i.get("motifId") and i.get("characterIds")]
red  = [i for i in both if i["characterIds"] == [i["motifId"]]]
print(f"has both: {len(both)}; characterIds==[motifId]: {len(red)}")
PY
```

Result: 8 / 8 redundant.

## 6. Free-text field cardinality (the invention smell)

```bash
python3 - <<'PY'
import json
d = json.load(open("src/data/mock-products.json"))
items = d if isinstance(d, list) else d.get("products", [])
for f in ["craftRegion", "craftCluster", "fit", "fabricGsm", "material"]:
    v = sorted({str(i.get(f)) for i in items if i.get(f)})
    print(f"{f}: {len(v)} unique / 13")
    for x in v[:10]: print("   ", x)
PY
```

Result: `craftRegion` 10 unique, `craftCluster` 9, `fit` 10, `fabricGsm` 10.
Nearly every product has its own value — the signature of prose typed per row
rather than selected from a registry.

## 7. Are craft fields used as filters or only displayed?

```bash
grep -rn "craftRegion\|craftCluster" ../web/src --include="*.ts" --include="*.tsx" \
  | grep -v mock-products
grep -n "setIntensity\|setCategory\|setUniverse\|setGender\|setGarmentTypes\|setPriceMax" \
  ../web/src/stores/filters.ts | head
```

Result: only display sites (`ProductCard.tsx:175`, `ProductDetail.tsx:452,504-505`,
`Admin.tsx:335-336`). Not in `FilterStore` — so these fields cost data weight and
git churn without powering discovery.

## 8. Trust fields absent

```bash
python3 - <<'PY'
import json
d = json.load(open("src/data/mock-products.json"))
items = d if isinstance(d, list) else d.get("products", [])
keys = set()
for i in items: keys |= set(i)
for k in ["cod","cash_on_delivery","delivery","return","shipping","warranty"]:
    print(f"{k:18}", "FOUND" if any(k in x.lower() for x in keys) else "ABSENT")
PY
grep -ci "cod\|delivery\|return_window" ../../backend/schema.sql
```

Result: all six ABSENT from the product data; schema also has none.

## 9. Universe table width and its second source of truth

```bash
# column count
awk '/create table if not exists public.universes/,/^\);/' ../../backend/schema.sql \
  | grep -cE '^\s+\w+ (text|boolean|integer|jsonb|timestamp)'

# seed keys vs DB columns
python3 - <<'PY'
import json
uj = json.load(open("src/data/universes.json"))
u = uj["universes"] if isinstance(uj, dict) and "universes" in uj else uj
print("universes.json keys:", len(u[0]), sorted(u[0]))
PY
```

Result: 22 DB columns; `universes.json` has 15 keys. DB-only:
`order_num`, `hero_headline`, `hero_headline_accent`, `hero_lead_color`,
`hero_accent_color`, `hero_ornament`, `hero_note`.
Frontend reads the DB copy at `Universe.tsx:100-102` — two sources for one value.

## 10. Where craftCluster leaked into the mobile app

```bash
cd ~/UniqueLo/mobile
grep -rno "craftRegion\|craftCluster\|fabricGsm\|expressionScore\|expressionSlug\|artStyleSlug\|batchNumber\|foreignTagline" \
  composeApp/src/commonMain/kotlin --include="*.kt" \
  | awk -F: '{print $3}' | sort | uniq -c | sort -rn
```

Result: `craftCluster` 8, `craftRegion` 6, `batchNumber` 6, `fabricGsm` 5,
`foreignTagline` 4, `expressionScore` 4, `expressionSlug` 1.
**The invented supplier names are already rendered in the app**, which raises the
cost of the §3.2 fabrication finding: it is not web-only.

## 11. `care` is wired but empty

```bash
grep -c "care" ../../backend/schema.sql       # -> 1 (column present)
grep -c "care" src/data/mock-products.json    # -> 0 (seed omits it)
grep -n  "care" src/lib/data.ts               # -> 273 (interface), 525 (mapped)
```

Result: schema, interface and mapper all handle `care`; only the JSON seed lacks
it, so it renders empty. Not drift in code — a data gap. Cheapest fix in the list.
