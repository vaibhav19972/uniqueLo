"""Regenerate mock-products.json for the new taxonomy (universe / garment / intensity / craft / edits).

Validation gates before write: registry slugs resolve, image paths exist on disk,
SKUs unique, embroidery technique consistent with craftTechniques[].
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # self-locating: scripts/ -> repo root
PUB = ROOT / 'public'
OUT = ROOT / 'src/data/mock-products.json'

universes = {u['slug'] for u in json.load(open(ROOT/'src/data/universes.json'))['universes']}
categories = {c['slug'] for c in json.load(open(ROOT/'src/data/categories.json'))['categories']}
motifs = {m['id']: m for m in json.load(open(ROOT/'src/data/motifs.json'))['motifs']}
edits = {e['slug'] for e in json.load(open(ROOT/'src/data/edits.json'))['edits']}
techniques = {t['slug'] for t in json.load(open(ROOT/'src/data/craft-techniques.json'))}
LEVELS = {'quiet', 'balanced', 'loud'}

TECH_LABEL = {
    'hand-zardozi': 'Hand Zardozi', 'metallic-zari': 'Metallic Zari', 'satin-stitch': 'Satin Stitch',
    'sashiko-selvedge': 'Sashiko Selvedge', 'crewel-needlework': 'Kashmiri Crewel', 'french-knot': 'French Knot',
    'botanical-chain': 'Chikankari Chain', 'monogram-bespoke': 'Bespoke Monogram', 'kantha-quilt': 'Kantha Quilt',
}

img_cache = {}
def img_ok(p):
    if p not in img_cache:
        img_cache[p] = (PUB / p.lstrip('/')).is_file()
    return img_cache[p]

def make_variants(prefix, color, hexv, price, statuses=None,
                  sizes=('XS', 'S', 'M', 'L', 'XL', '2XL', '3XL')):
    statuses = statuses or ['in-stock'] * len(sizes)
    assert len(statuses) == len(sizes), f'{prefix}/{color}: {len(statuses)} statuses vs {len(sizes)} sizes'
    out = []
    for sz, st in zip(sizes, statuses):
        q = {'in-stock': 14, 'low-stock': 2, 'out-of-stock': 0}[st]
        out.append({'sku': f'{prefix}-{color.split()[0].upper()}-{sz}', 'color': color, 'colorHex': hexv,
                    'size': sz, 'priceCents': price, 'status': st, 'quantity': q})
    return out

def second_color(prefix, color, hexv, price, statuses=None,
                 sizes=('S', 'M', 'L', 'XL', '2XL')):
    statuses = statuses or ['in-stock'] * len(sizes)
    assert len(statuses) == len(sizes), f'{prefix}/{color}: {len(statuses)} statuses vs {len(sizes)} sizes'
    out = []
    for sz, st in zip(sizes, statuses):
        q = {'in-stock': 9, 'low-stock': 2, 'out-of-stock': 0}[st]
        out.append({'sku': f'{prefix}-{color.split()[0].upper()}-{sz}', 'color': color, 'colorHex': hexv,
                    'size': sz, 'priceCents': price, 'status': st, 'quantity': q})
    return out

def emb(technique, hours, placement, comp, story, macro, alt):
    return {'technique': technique, 'techniqueLabel': TECH_LABEL[technique], 'artisanHours': hours,
            'placement': placement, 'threadComposition': comp, 'motifStory': story,
            'macroImage': {'src': macro, 'alt': alt}}

STYLE_MAP = {
    'sakura-ronin-hoodie': 'ukiyo-line',
    'koi-current-tee': 'ukiyo-line',
    'red-sun-motif-tote': 'ukiyo-line',
    'ascendant-hoodie': 'crest-emblem',
    'guardian-stripes-pullover': 'comic-noir',
    'herald-cape-jacket': 'crest-emblem',
    'royal-procession-jacket': 'mughal-miniature',
    'arch-jaal-scarf': 'mughal-miniature',
}

P = []
def add(**kw):
    if 'artStyleSlug' not in kw:
        kw['artStyleSlug'] = STYLE_MAP.get(kw.get('slug'), 'atelier-tonal')
    if 'characterIds' not in kw and kw.get('motifId'):
        kw['characterIds'] = [kw['motifId']]
    P.append(kw)

# ===== ANIMEVERSE =====
add(
    slug='sakura-ronin-hoodie', name='Sakura Ronin Hoodie',
    subtitle='A lone journey, a blossoming hope.',
    description='Oversized hoodie carrying the Sakura Ronin — a wandering swordsman beneath falling cherry blossoms. Embroidered zardozi and layered threadwork across the back panel.',
    categorySlug='tops', universeSlug='animeverse', garmentType='hoodie', gender='unisex',
    intensity='loud', craftTechniques=['hand-zardozi'], edits=['statement', 'everyday'],
    motifId='sakura', isMock=True, foreignTagline='桜の浪人',
    rating=4.8, reviewCount=320, soldCount='1.2K+', featured=True,
    tags=['animeverse', 'hoodie', 'unisex', 'bestseller'],
    variants=make_variants('SRH', 'Warm Ivory', '#f3ede2', 349900,
        ['in-stock', 'in-stock', 'low-stock', 'in-stock', 'in-stock', 'in-stock', 'low-stock'])
      + second_color('SRH', 'Midnight Ink', '#1c1c24', 349900),
    images=[
        {'src': '/images/products/sakura-ronin-hoodie-1.jpg', 'alt': 'Sakura Ronin Hoodie — front'},
        {'src': '/images/products/sakura-ronin-hoodie-2.jpg', 'alt': 'Sakura Ronin Hoodie — back panel embroidery'},
        {'src': '/images/products/sakura-ronin-hoodie-3.jpg', 'alt': 'Sakura Ronin Hoodie — stitch detail'},
        {'src': '/images/products/sakura-ronin-hoodie-4.jpg', 'alt': 'Sakura Ronin Hoodie — lifestyle'},
        {'src': '/images/products/sakura-ronin-hoodie-5.jpg', 'alt': 'Sakura Ronin Hoodie — collar detail'},
        {'src': '/images/products/sakura-ronin-hoodie-6.jpg', 'alt': 'Sakura Ronin Hoodie — lifestyle shot'}],
    embroidery=emb('hand-zardozi', 40, ['back panel', 'sleeves'], 'Silk floss, gilded bullion wire',
        'The ronin walks beneath blossoms that fall faster than he moves — beauty and transience stitched at 40 hours.',
        '/images/products/sakura-ronin-hoodie-5.jpg', 'Sakura Ronin zardozi macro'),
    material=['400 GSM cotton fleece', 'Brass drawcord tips'], fit='Oversized Fit', fabricGsm='380 GSM',
    craftRegion='Uttar Pradesh', craftCluster='Lucknow zardozi cluster', handcrafted=True,
)

add(
    slug='koi-current-tee', name='Koi Current Tee',
    subtitle='One crest, one current. Swim quietly.',
    description='Boxy drop-shoulder tee with a single tonal koi crest embroidered high on the chest — thread-on-thread, discovered rather than announced.',
    categorySlug='tops', universeSlug='animeverse', garmentType='tee', gender='unisex',
    intensity='quiet', craftTechniques=['satin-stitch'], edits=['everyday', 'comfort'],
    motifId='koi', isMock=True, foreignTagline='鯉の流れ',
    rating=4.6, reviewCount=86, soldCount='400+', featured=False,
    tags=['animeverse', 'tee', 'unisex'],
    variants=make_variants('KCT', 'Undyed Cotton', '#efe7d8', 279900)
      + second_color('KCT', 'Indigo Current', '#2b3446', 279900),
    images=[
        {'src': '/images/placeholders/product-vine-heavyweight-tee-1.jpg', 'alt': 'Koi Current Tee — front'},
        {'src': '/images/placeholders/product-vine-heavyweight-tee-2.jpg', 'alt': 'Koi Current Tee — crest macro'},
        {'src': '/images/products/vine-heavyweight-tee-1.jpg', 'alt': 'Koi Current Tee — lifestyle'}],
    embroidery=emb('satin-stitch', 6, ['left chest'], 'Mercerized cotton floss, tonal ecru',
        'The koi swims in single-color satin — perseverance rendered in one quiet pass.',
        '/images/placeholders/product-vine-heavyweight-tee-2.jpg', 'Koi crest satin macro'),
    material=['280 GSM combed organic cotton jersey'], fit='Boxy Drop-Shoulder', fabricGsm='280 GSM',
    craftRegion='Varanasi, Uttar Pradesh', craftCluster='Ghat Artisan Weavers', handcrafted=True,
)

add(
    slug='red-sun-motif-tote', name='Red Sun Motif Tote',
    subtitle='A flat crimson disc on raw canvas. Daylight carried.',
    description='Heavy raw-canvas tote with the Red Sun motif worked flat and frontal — a symbol of new beginnings on an everyday carry.',
    categorySlug='accessories', universeSlug='animeverse', garmentType='tote', gender='unisex',
    intensity='balanced', craftTechniques=['satin-stitch'], edits=['everyday'],
    motifId='red-sun', isMock=True,
    rating=4.7, reviewCount=54, soldCount='300+', featured=False,
    tags=['animeverse', 'accessories', 'unisex'],
    variants=[
        {'sku': 'RST-OS-NAT', 'color': 'Natural Canvas', 'colorHex': '#e8e2d2', 'size': 'OS',
         'priceCents': 199900, 'status': 'in-stock', 'quantity': 16},
        {'sku': 'RST-OS-WAX', 'color': 'Waxed Umber', 'colorHex': '#8a6b4a', 'size': 'OS',
         'priceCents': 199900, 'status': 'low-stock', 'quantity': 2}],
    images=[
        {'src': '/images/placeholders/product-needlework-canvas-tote-1.jpg', 'alt': 'Red Sun Motif Tote — front'},
        {'src': '/images/placeholders/product-needlework-canvas-tote-2.jpg', 'alt': 'Red Sun Motif Tote — embroidery detail'}],
    embroidery=emb('satin-stitch', 4, ['front panel'], 'Crimson silk floss on raw canvas',
        'A flat crimson disc, minimal, paired with mountain linework.',
        '/images/placeholders/product-needlework-canvas-tote-2.jpg', 'Red Sun motif macro'),
    material=['18 oz raw cotton canvas', 'Reinforced box stitches'], fit='One Size', fabricGsm='18 oz canvas',
    craftRegion='Varanasi, Uttar Pradesh', craftCluster='Ghat Artisan Weavers', handcrafted=False,
)

# ===== HEROVERSE =====
add(
    slug='ascendant-hoodie', name='Ascendant Hoodie',
    subtitle='The crest carries. Quietly.',
    description='Heavyweight fleece hoodie with the Ascendant Crest worked as a tonal chest mark — the everyday hero’s emblem, stitched to be noticed slowly.',
    categorySlug='tops', universeSlug='heroverse', garmentType='hoodie', gender='unisex',
    intensity='quiet', craftTechniques=['hand-zardozi'], edits=['everyday', 'statement'],
    motifId='ascendant-crest', isMock=True,
    rating=4.9, reviewCount=210, soldCount='900+', featured=True,
    tags=['heroverse', 'hoodie', 'unisex'],
    variants=make_variants('ASH', 'Charcoal Ash', '#33333a', 399900,
        ['in-stock', 'in-stock', 'in-stock', 'low-stock', 'in-stock', 'in-stock', 'in-stock'])
      + second_color('ASH', 'Deep Bone', '#d9d2c4', 399900),
    images=[
        {'src': '/images/products/french-knot-turtleneck-1.jpg', 'alt': 'Ascendant Hoodie — front'},
        {'src': '/images/products/french-knot-turtleneck-2.jpg', 'alt': 'Ascendant Hoodie — crest macro'},
        {'src': '/images/placeholders/category-tops.jpg', 'alt': 'Ascendant Hoodie — lifestyle'}],
    embroidery=emb('hand-zardozi', 38, ['chest'], 'Tonal charcoal bullion wire, silk core',
        'Shield-crest geometry, gold on deep red in the loud line — here rendered tonal, charcoal on ash.',
        '/images/products/french-knot-turtleneck-2.jpg', 'Ascendant crest tonal macro'),
    material=['400 GSM cotton fleece'], fit='Oversized Fit', fabricGsm='400 GSM',
    craftRegion='Uttar Pradesh', craftCluster='Lucknow zardozi cluster', handcrafted=True,
)

add(
    slug='guardian-stripes-pullover', name='Guardian Stripes Pullover',
    subtitle='Speed lines of those who show up first.',
    description='Loopback crewneck pullover with Guardian Stripes running diagonal across the chest — navy bands and burst-yellow knots in structural sashiko grid.',
    categorySlug='tops', universeSlug='heroverse', garmentType='hoodie', gender='unisex',
    intensity='balanced', craftTechniques=['sashiko-selvedge'], edits=['statement', 'everyday'],
    motifId='guardian-stripes', isMock=True,
    rating=4.7, reviewCount=68, soldCount='200+', featured=False,
    tags=['heroverse', 'hoodie', 'unisex'],
    variants=make_variants('GSP', 'Navy Surge', '#25314d', 359900)
      + second_color('GSP', 'Storm Grey', '#6b6f76', 359900),
    images=[
        {'src': '/images/products/kantha-chore-jacket-1.jpg', 'alt': 'Guardian Stripes Pullover — front'},
        {'src': '/images/products/sashiko-selvedge-denim-1.jpg', 'alt': 'Guardian Stripes Pullover — stripe macro'}],
    embroidery=emb('sashiko-selvedge', 16, ['chest', 'cuffs'], 'White cotton thread, burst-yellow accent',
        'Diagonal action-line bands — the geometry of first responders.',
        '/images/products/sashiko-selvedge-denim-2.jpg', 'Guardian stripes sashiko macro'),
    material=['340 GSM loopback cotton'], fit='Relaxed Fit', fabricGsm='340 GSM',
    craftRegion='Kutch & Okayama Collaboration', craftCluster='Craft Textile Atelier', handcrafted=True,
)

add(
    slug='herald-cape-jacket', name='Herald Cape Jacket',
    subtitle='Icons are ideas. Wear yours.',
    description='Structured cape jacket with full-back Ascendant relief in zardozi wire — a showcase garment for those who carry their own weight. Limited numbered edition.',
    categorySlug='outerwear', universeSlug='heroverse', garmentType='jacket', gender='women',
    intensity='loud', craftTechniques=['metallic-zari', 'french-knot'], edits=['statement', 'collector'],
    motifId='ascendant-crest', isMock=True, batchNumber=3, batchTotal=40,
    rating=5.0, reviewCount=41, soldCount='120+', featured=True,
    tags=['heroverse', 'jacket', 'women', 'limited'],
    variants=make_variants('HCJ', 'Crimson Court', '#7a2230', 549900,
        ['low-stock', 'in-stock', 'low-stock', 'in-stock', 'in-stock', 'low-stock', 'in-stock'])
      + second_color('HCJ', 'Gilded Ivory', '#f1e7cf', 549900),
    images=[
        {'src': '/images/products/nocturne-velvet-vest-1.jpg', 'alt': 'Herald Cape Jacket — front'},
        {'src': '/images/products/nocturne-velvet-vest-2.jpg', 'alt': 'Herald Cape Jacket — back relief'},
        {'src': '/images/products/crewel-cashmere-cardigan-1.jpg', 'alt': 'Herald Cape Jacket — texture detail'},
        {'src': '/images/products/pleated-zari-trousers-2.jpg', 'alt': 'Herald Cape Jacket — zari macro'}],
    embroidery=emb('metallic-zari', 48, ['shoulders', 'back'], 'Silver-gilt zari couched cord, French knots',
        'Crest relief built in two techniques — couching for the form, knots for the light.',
        '/images/products/pleated-zari-trousers-2.jpg', 'Herald cape zari couching macro'),
    material=['320 GSM cotton canvas', 'Antique brass buttons'], fit='Statement Fit', fabricGsm='320 GSM',
    craftRegion='Rajasthan', craftCluster='Jaipur zardozi houses', handcrafted=True,
)

# ===== ITIHAAS =====
add(
    slug='royal-procession-jacket', name='Royal Procession Jacket',
    subtitle='Moments and empires, embroidered for now.',
    description='Chore jacket carrying the Royal Procession across the back panel in couched zari — caparisoned elephant beneath a Mughal arch, festive and full.',
    categorySlug='outerwear', universeSlug='itihaas', garmentType='jacket', gender='unisex',
    intensity='loud', craftTechniques=['metallic-zari'], edits=['heritage', 'festive-gifting'],
    motifId='procession-elephant', isMock=True, foreignTagline='शाही जुलूस',
    rating=4.9, reviewCount=157, soldCount='600+', featured=True,
    tags=['itihaas', 'jacket', 'unisex', 'festive'],
    variants=make_variants('RPJ', 'Maroon Darbar', '#6d1f2c', 499900,
        ['in-stock', 'in-stock', 'low-stock', 'in-stock', 'in-stock', 'out-of-stock', 'in-stock'])
      + second_color('RPJ', 'Ivory Darbar', '#f3ecdc', 499900),
    images=[
        {'src': '/images/products/kantha-chore-jacket-2.jpg', 'alt': 'Royal Procession Jacket — back panel'},
        {'src': '/images/products/pleated-zari-trousers-1.jpg', 'alt': 'Royal Procession Jacket — front placket'},
        {'src': '/images/products/embroidered-silk-scarf-1.jpg', 'alt': 'Royal Procession Jacket — detail'}],
    embroidery=emb('metallic-zari', 52, ['back panel', 'placket'], 'Silver-gilt zari, maroon silk core',
        'The procession enters the courtyard — ceremony stitched in continuous metallic inlay.',
        '/images/products/pleated-zari-trousers-2.jpg', 'Procession zari macro'),
    material=['320 GSM cotton twill', 'Antique brass buttons'], fit='Utility Fit', fabricGsm='320 GSM',
    craftRegion='Varanasi & Surat', craftCluster='Ghat Zari Weavers Collective', handcrafted=True,
)

add(
    slug='arch-jaal-scarf', name='Arch Jaal Silk Scarf',
    subtitle='Courtyards of patience — geometry as devotion.',
    description='Mulberry silk scarf with the Arch Jaal lattice worked in tonal gold — Mughal geometry held to a whisper.',
    categorySlug='accessories', universeSlug='itihaas', garmentType='scarf', gender='unisex',
    intensity='quiet', craftTechniques=['metallic-zari'], edits=['heritage', 'festive-gifting'],
    motifId='arch-jaal', isMock=True,
    rating=4.8, reviewCount=33, soldCount='150+', featured=False,
    tags=['itihaas', 'accessories', 'unisex'],
    variants=[
        {'sku': 'AJS-OS-GLD', 'color': 'Ivory & Gold', 'colorHex': '#efe4c8', 'size': 'OS',
         'priceCents': 189900, 'status': 'in-stock', 'quantity': 11}],
    images=[
        {'src': '/images/products/embroidered-silk-scarf-2.jpg', 'alt': 'Arch Jaal Silk Scarf — drape'},
        {'src': '/images/products/embroidered-silk-scarf-1.jpg', 'alt': 'Arch Jaal Silk Scarf — lattice macro'}],
    embroidery=emb('metallic-zari', 9, ['border', 'allover lattice'], 'Champagne zari on ivory silk',
        'Mughal arch lattice, symmetric, tonal — the geometry reads only at arm’s length.',
        '/images/products/embroidered-silk-scarf-1.jpg', 'Arch jaal lattice macro'),
    material=['18 Momme Mulberry Silk Twill'], fit='One Size', fabricGsm='18 momme silk',
    craftRegion='Murshidabad, West Bengal', craftCluster='Shantiniketan Silk Guild', handcrafted=True,
)

# ===== ATELIER (universe-free base line) =====
add(
    slug='sashiko-selvedge-denim', name='Sashiko Selvedge Denim',
    subtitle='Reinforced where work lives. Aged with patina.',
    description='Raw selvedge denim work pants with sashiko lattices anchoring the high-friction zones — white cotton thread over deep indigo, built to age.',
    categorySlug='bottoms', universeSlug=None, garmentType='pants', gender='unisex',
    intensity='balanced', craftTechniques=['sashiko-selvedge'], edits=['everyday', 'heritage'],
    isMock=True,
    rating=4.8, reviewCount=74, soldCount='310+', featured=False,
    tags=['atelier', 'bottoms', 'unisex'],
    variants=make_variants('SSD', 'Raw Indigo', '#1e2a4a', 419900,
        ['in-stock', 'in-stock', 'low-stock', 'in-stock', 'in-stock'], sizes=('S', 'M', 'L', 'XL', '2XL'))
      + second_color('SSD', 'Washed Carbon', '#3a3a3e', 419900),
    images=[
        {'src': '/images/products/sashiko-selvedge-denim-1.jpg', 'alt': 'Sashiko Selvedge Denim — front'},
        {'src': '/images/products/sashiko-selvedge-denim-2.jpg', 'alt': 'Sashiko Selvedge Denim — lattice macro'}],
    embroidery=emb('sashiko-selvedge', 18, ['knees', 'pockets', 'hem'], 'Crisp white cotton thread on raw indigo',
        'Functional geometric needlework that strengthens and signatures the cloth at once.',
        '/images/products/sashiko-selvedge-denim-2.jpg', 'Sashiko lattice macro'),
    material=['14 oz raw selvedge denim', 'Copper rivets'], fit='Straight Work Fit', fabricGsm='14 oz denim',
    craftRegion='Kutch & Okayama Collaboration', craftCluster='Craft Textile Atelier', handcrafted=True,
)

add(
    slug='crewel-cashmere-cardigan', name='Crewel Cashmere Cardigan',
    subtitle='Alpine botanicals in thick wool relief.',
    description='Hand-woven wool cardigan with Kashmiri crewel botanicals in 2-ply natural yarn — dimensional relief and real insulation in one garment.',
    categorySlug='knitwear', universeSlug=None, garmentType='cardigan', gender='women',
    intensity='balanced', craftTechniques=['crewel-needlework'], edits=['comfort', 'heritage'],
    isMock=True,
    rating=4.9, reviewCount=59, soldCount='240+', featured=False,
    tags=['atelier', 'outerwear', 'women'],
    variants=make_variants('CCC', 'Lichen Sage', '#8a8f7a', 469900,
        ['in-stock', 'low-stock', 'in-stock', 'in-stock', 'in-stock'], sizes=('S', 'M', 'L', 'XL', '2XL'))
      + second_color('CCC', 'Oat Fleece', '#d8cdb6', 469900),
    images=[
        {'src': '/images/products/crewel-cashmere-cardigan-1.jpg', 'alt': 'Crewel Cashmere Cardigan — front'},
        {'src': '/images/products/crewel-cashmere-cardigan-2.jpg', 'alt': 'Crewel Cashmere Cardigan — botanical relief'}],
    embroidery=emb('crewel-needlework', 22, ['front plackets', 'cuffs'], '2-ply natural wool yarn',
        'Wild flora and alpine botanicals, hooked-loop relief through a fine aari.',
        '/images/products/crewel-cashmere-cardigan-2.jpg', 'Crewel botanical macro'),
    material=['Hand-woven wool shell', '2-ply crewel yarn'], fit='Boxy Cardigan', fabricGsm='480 GSM knit',
    craftRegion='Anantnag & Srinagar, Kashmir', craftCluster='Valley Aari Craftspersons', handcrafted=True,
)

add(
    slug='monogram-poplin-shirt', name='Monogram Poplin Shirt',
    subtitle='Your initials in precision satin. Nothing louder.',
    description='Supima cotton poplin shirt with a bespoke satin monogram at the cuff — the atelier’s quietest personalization.',
    categorySlug='tops', universeSlug=None, garmentType='shirt', gender='unisex',
    intensity='quiet', craftTechniques=['monogram-bespoke'], edits=['everyday', 'festive-gifting'],
    isMock=True, customizable=True,
    rating=4.7, reviewCount=45, soldCount='190+', featured=False,
    tags=['atelier', 'shirt', 'unisex'],
    variants=make_variants('MPS', 'Optic White', '#f7f6f2', 259900)
      + second_color('MPS', 'Pale Blue', '#c9d4de', 259900),
    images=[
        {'src': '/images/products/monogram-poplin-shirt-1.jpg', 'alt': 'Monogram Poplin Shirt — front'},
        {'src': '/images/placeholders/product-monogram-poplin-shirt-2.jpg', 'alt': 'Monogram Poplin Shirt — cuff monogram'}],
    embroidery=emb('monogram-bespoke', 6, ['left cuff'], 'Archival silk floss, 3-letter satin',
        'Precision satin initials — patron-chosen thread and placement.',
        '/images/placeholders/product-monogram-poplin-shirt-2.jpg', 'Monogram satin macro'),
    material=['140 GSM Supima Cotton Poplin', 'Mother-of-pearl buttons'], fit='Relaxed Classic', fabricGsm='140 GSM',
    craftRegion='Jaipur Atelier', craftCluster='Pink City Monogram Atelier', handcrafted=True,
)

add(
    slug='nocturne-velvet-crewel-vest', name='Nocturne Velvet Crewel Vest',
    subtitle='Two techniques, one night garden.',
    description='Cotton velvet vest layered with crewel night-blooms and French-knot stars — an after-hours collector piece, numbered edition.',
    categorySlug='knitwear', universeSlug=None, garmentType='vest', gender='unisex',
    intensity='loud', craftTechniques=['crewel-needlework', 'french-knot'], edits=['statement', 'collector'],
    isMock=True, batchNumber=7, batchTotal=25,
    rating=4.9, reviewCount=28, soldCount='90+', featured=False,
    tags=['atelier', 'vest', 'unisex', 'limited'],
    variants=make_variants('NVV', 'Nocturne Black', '#121214', 529900,
        ['low-stock', 'in-stock', 'low-stock', 'in-stock', 'low-stock', 'in-stock', 'in-stock'])
      + second_color('NVV', 'Deep Oxblood', '#4a1b20', 529900),
    images=[
        {'src': '/images/products/nocturne-velvet-vest-1.jpg', 'alt': 'Nocturne Velvet Crewel Vest — front'},
        {'src': '/images/products/nocturne-velvet-vest-2.jpg', 'alt': 'Nocturne Velvet Crewel Vest — knot stars macro'}],
    embroidery=emb('french-knot', 26, ['front panels', 'collar'], 'Wool crewel yarn, silk-knot stars',
        'Night garden in two hands — crewel for the blooms, knots for the constellation.',
        '/images/products/nocturne-velvet-vest-2.jpg', 'French knot stars macro'),
    material=['320 GSM Cotton Velvet'], fit='Fitted Vest', fabricGsm='320 GSM',
    craftRegion='Srinagar, Kashmir', craftCluster='Valley Aari Craftspersons', handcrafted=True,
)

add(
    slug='heritage-flora-silk-scarf', name='Heritage Flora Silk Scarf',
    subtitle='Botanical chain shadow-work on mulberry twill.',
    description='Mulberry silk scarf with Chikankari botanical chain — shadow-work flowers at 14 hours, heirloom-soft.',
    categorySlug='accessories', universeSlug=None, garmentType='scarf', gender='women',
    intensity='quiet', craftTechniques=['botanical-chain'], edits=['heritage', 'festive-gifting'],
    isMock=True,
    rating=4.8, reviewCount=38, soldCount='160+', featured=False,
    tags=['atelier', 'accessories', 'women'],
    variants=[
        {'sku': 'HFS-OS-ECR', 'color': 'Ecru Whisper', 'colorHex': '#efe9db', 'size': 'OS',
         'priceCents': 179900, 'status': 'in-stock', 'quantity': 10},
        {'sku': 'HFS-OS-PRL', 'color': 'Pearl Blush', 'colorHex': '#e9d9d5', 'size': 'OS',
         'priceCents': 179900, 'status': 'low-stock', 'quantity': 2}],
    images=[
        {'src': '/images/products/embroidered-silk-scarf-1.jpg', 'alt': 'Heritage Flora Silk Scarf — drape'},
        {'src': '/images/products/embroidered-silk-scarf-2.jpg', 'alt': 'Heritage Flora Silk Scarf — shadow-work macro'}],
    embroidery=emb('botanical-chain', 14, ['borders', 'pallu corners'], 'Unbleached mulberry silk floss',
        'Fluid florals in shadow-work and chain looping, calibrated tension throughout.',
        '/images/products/embroidered-silk-scarf-2.jpg', 'Chikankari shadow macro'),
    material=['18 Momme Mulberry Silk Twill'], fit='One Size', fabricGsm='18 momme silk',
    craftRegion='Lucknow, Uttar Pradesh', craftCluster='Old City Needlework Collective', handcrafted=True,
)

# ---------- integrity validation ----------
errors = []
seen_slugs, seen_skus = set(), set()
for p in P:
    s = p['slug']
    if s in seen_slugs:
        errors.append(f'dup slug {s}')
    seen_slugs.add(s)
    if p['categorySlug'] not in categories:
        errors.append(f'{s}: category {p["categorySlug"]} not in registry')
    if p['universeSlug'] not in universes and p['universeSlug'] is not None:
        errors.append(f'{s}: bad universe {p["universeSlug"]}')
    if p['intensity'] not in LEVELS:
        errors.append(f'{s}: bad intensity {p["intensity"]}')
    for e_ in p['edits']:
        if e_ not in edits:
            errors.append(f'{s}: bad edit {e_}')
    for t in p['craftTechniques']:
        if t not in techniques:
            errors.append(f'{s}: bad technique {t}')
    if p.get('motifId'):
        m = motifs.get(p['motifId'])
        if not m:
            errors.append(f'{s}: bad motif {p["motifId"]}')
        else:
            if not m['ip_cleared']:
                errors.append(f'{s}: motif not IP-cleared')
            if p.get('universeSlug') and m['universe_slug'] != p['universeSlug']:
                errors.append(f'{s}: motif universe mismatch')
    if not p.get('universeSlug') and p.get('motifId'):
        errors.append(f'{s}: atelier item must not carry motif')
    for im in p['images']:
        if not img_ok(im['src']):
            errors.append(f'{s}: missing image {im["src"]}')
    eb = p.get('embroidery')
    if eb:
        if eb['technique'] not in p['craftTechniques']:
            errors.append(f'{s}: embroidery.technique {eb["technique"]} not in craftTechniques')
        if eb.get('macroImage') and not img_ok(eb['macroImage']['src']):
            errors.append(f'{s}: missing macro image')
    for v in p['variants']:
        if v['sku'] in seen_skus:
            errors.append(f'{s}: dup variant sku {v["sku"]}')
        seen_skus.add(v['sku'])

nv = sum(len(p['variants']) for p in P)
uni_c, int_c, cat_c = {}, {}, {}
for p in P:
    u = p['universeSlug'] or 'atelier'
    uni_c[u] = uni_c.get(u, 0) + 1
    int_c[p['intensity']] = int_c.get(p['intensity'], 0) + 1
    cat_c[p['categorySlug']] = cat_c.get(p['categorySlug'], 0) + 1

print('ERRORS:', len(errors))
for e in errors:
    print(' ', e)
print('products:', len(P), '| variants:', nv)
print('universe:', uni_c)
print('intensity:', int_c)
print('category:', cat_c)

if errors:
    print('NOT WRITTEN — validation failed')
else:
    OUT.write_text(json.dumps({'products': P}, indent=2, ensure_ascii=False) + '\n')
    print('WROTE', OUT, OUT.stat().st_size, 'bytes')