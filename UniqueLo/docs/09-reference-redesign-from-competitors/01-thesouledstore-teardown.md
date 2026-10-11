# 01 — The Souled Store Teardown

> Reference: https://www.thesouledstore.com/ · researched Oct 2026.
> Focus: design philosophy, information architecture, conversion mechanics.

## 1. Design philosophy (in their own words)

- **"Follow your soul."** Born 2013, Mumbai, 4 founders, "a cupboard full of t-shirts".
  Philosophy: *life is short, don't do something you don't like* — love what you do,
  from designs to customer care. Name is a pun on *sold/souled*.
- **"Favourite, friendly neighbourhood store."** Aspires to corner-shop warmth at
  6M+ customer scale. Copy is deliberately goofy, pun-heavy, first-person plural
  ("we're the sock to your Dobby…").
- **"Put the POP in pop culture."** Pop = fast-moving movies/TV/sports/music/comedy.
  They promise the *freshest* designs covering every fandom, plus quirky originals.
  Official merch is the moat: Marvel, Disney, Harry Potter, Looney Tunes, anime, sports.
- **Self-expression over craft.** "Wear your fandom", "everyone is a special snowflake".
  Product truth = identity signalling + comfort + affordability, not textile provenance.
- **Homegrown + responsible.** "HOMEGROWN INDIAN BRAND / Over 6 Million Happy Customers"
  badge on every page. Ethos page: female-empowerment capsule with GiveHer5
  (1 tee = 1 girl's yearly sanitary requirement), eco-packaging claims, body-positivity /
  inclusive sizing (XXS–XXXL on Supima lines).

**Design language that follows from this:**
bright, dense, sticker-like discount badges, emoji-adjacent playfulness, social-proof
counters everywhere, app-first nudges. Energy = bazaar joy. This is the *opposite* of
UniqueLo's quiet-luxury restraint — which is exactly why we borrow mechanics, not visuals.

## 2. Information architecture

```
Header (sticky)
├── Announcement: "Download Our App & Get 10% Additional Cashback" + [Open App]
├── Nav: MEN | WOMEN | SNEAKERS | (KIDS) — gender-first, not fabric-first
├── Icons: search | profile | wishlist | cart
└── Mobile: hamburger Menu + same 4 icons

Homepage ("Home Landing Page")
├── Hero campaign carousel (sale / fandom drop led)
├── Category tiles (Men / Women / Sneakers / Kids → sub: T-shirts, Oversized,
│   Hoodies, Joggers, Dresses, Tops, Skirts…)
├── New Arrivals rail, Bestsellers rail, Fandom rails (Marvel, Anime…)
├── Membership upsell band, App download band, UGC/community band
└── Footer: NEED HELP (Contact, Track Order, Returns, FAQs, Account)
           COMPANY (About, Investors, Careers, Stores Near Me, Gift Vouchers)
           MORE INFO (T&C, Privacy, Sitemap, Blogs)
           Trust: COD Available · 30-Day Returns · 100% Secure Payment
                  Shipping partners: DTDC, Delhivery, Ecom Express, XpressBees

PLP (/home/main, /categories)
├── Title + count, Sort dropdown ("Select Sorting Options"), Filter drawer [Apply/Clear]
├── Card: image → name → category → price + MRP strike + OFF badge
└── "You may also like" recovery on 404/empty states

PDP (/product/<slug>) — full anatomy in file 02.
```

**Takeaway for UniqueLo:** their primary axis is **who (Men/Women/Kids) × fandom**,
ours is **universe × aesthetic intensity (Minimalist/Expressive)**. Keep our axis;
steal their *filter/sort/count honesty* and *empty-state recovery* ("You may also like").

## 3. Commerce engine

| Mechanic | How they do it | Evidence |
|---|---|---|
| Price framing | ₹ price big, MRP struck, `₹500 OFF`, "Price incl. of all taxes" | Supima Nude Pink ₹499/₹999; Regal Wine ₹799/₹1,199 |
| Sizes | XS–XXXL (up to 8 sizes), Size Chart modal (inches + cm), "Size not available? Notify Me" | PDP excerpts |
| Quantity | Stepper 01–10 | PDP excerpts |
| CTA row | `ADD TO CART` + `WISHLIST` side by side, `Share` link | PDP excerpts |
| Delivery | Pincode `CHECK` box + `Return Policy` block (30-day, no questions asked) | PDP excerpts |
| Trust strip | Homegrown · 6M customers · COD · 30-day exchange · Secure payment · shipper logos | Every page footer |
| Membership | ₹149/3 mo, ₹199/12 mo → member prices, early access, free delivery, prioritised shipping, online + 60+ stores | /membership |
| Loyalty | Soldier (0–3k: 10% back) / Captain (3–7k: 15%) / General (>7k: 20%); 1 pt = ₹1, wallet credit 15 days post-delivery, max 250 pts/order | /reward-points |
| Referral | Friend gets 10% off first order; referrer gets 5% of order value as points | /reward-points |
| Creator credit | "Artist's Details" block on every PDP | PDP excerpts |
| App flywheel | Sticky app banner (10% cashback), Play/App Store badges, "Open App" deep link | Header on all pages |

## 4. What makes them convert (honest assessment)

1. **Zero-risk framing:** COD + 30-day no-questions returns + pincode check *before* ATC.
2. **Price certainty:** tax-inclusive, MRP-anchored, member-price teaser.
3. **Size confidence:** chart in 2 units + notify-me captures lost sizes as leads.
4. **Retention ladder:** membership → loyalty tiers → referral → app cashback. Each step
   pays back in wallet points, not vague "coins".
5. **Fandom velocity:** licensed drops + "Shop by Variant/Look" cross-sell keep AOV high.

All five are transferable to luxury *if re-voiced* (see file 03). None requires
copying their visual noise.
