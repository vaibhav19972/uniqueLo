# 10 — Launch Content Checklist (P5)

> Code is done when this file is empty. Every item blocks launch of the surface it feeds. Mock/sample content must be replaced or explicitly waived with a dated note.

## Catalog imagery (per SKU — see `07-image-pipeline.md` 6-slot contract)

- [ ] 6 slots filled, `sort_order` 0–5, real alts (no tonal blocks on launch surfaces)
- [ ] Slot 3 macro passes human gate (individual stitches + thread twist visible)
- [ ] Cross-SKU variety check (rotation sets A/B/C actually differ)
- [ ] Manifest → seed flow recorded (parity rule, §03)

## Catalog data

- [ ] Every product: 1 universe, 1 gender, garment type, `motif_id` with `ip_cleared = true`
- [ ] Prices + compare-at verified against real MRP (mock render prices replaced)
- [ ] Stock quantities real; `status` derived correctly
- [ ] `is_mock` → false flip planned with the real-seed cutover (old-13 deprecation closes here)

## People & proof (all currently SAMPLE-flagged)

- [ ] CraftStory atelier note: studio voice final (no named artisan until consent on file)
- [ ] Reviews: real purchases only, `verified` backfilled; mock `rating`/`reviewCount`/`soldCount` fields removed or recomputed from `reviews`
- [ ] UGC wall: 6+ real customer photos with usage consent; stats bar wired to aggregates (replace 10,000+ / 4.8/5 placeholders)

## Honesty rules (copy + flags)

- [ ] No generic "hand-embroidery / handcrafted / artisan-made" claims anywhere customer-facing — only "embroidery / threadwork"; Atelier technique pages reviewed for heritage-vs-process wording
- [ ] `handcrafted: true` set ONLY on SKUs verified as genuinely handcrafted (mock rule ≥30 embroidery-hours is a placeholder, re-verify per SKU at cutover)
- [ ] "30+ artisans" figure verified or reworded

## Lore & copy

- [ ] All 7 motifs have final `meaning` copy; any new motif passes the IP gate before reference
- [ ] Universe `lore` + `tagline` final; transliterations reviewed (no real-sentence translations held as decor)
- [ ] EMI/Simpl line: show only when a provider is wired; video thumbnails only when video assets exist
- [ ] Men/Women/New Arrivals routes carry real counts (no zeros without "dropping soon" treatment)

## Commerce readiness

- [ ] Payment stub replaced or explicitly labeled (UPI/card reconcile, COD flow tested end-to-end)
- [ ] Totals recompute verified against hostile client input
- [ ] Shipping/gift/coupon thresholds match ops reality (₹29,050 / ₹49,800 / NEEDLECRAFT)
- [ ] Bundle-discount engine either built or the band still shows honest unit totals

## Gates (§08)

- [ ] Lighthouse ≥ 90 per template, contrast passes in every universe × vibe
- [ ] Keyboard-only checkout pass, focus/aria audit on new components
- [ ] `audit.md` updated, RLS re-verified after schema deltas
