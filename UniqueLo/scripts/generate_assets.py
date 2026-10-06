import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter

random.seed(42)

def create_editorial_image(path, width, height, base_color, accent_color, title, subtitle, is_macro=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img = Image.new("RGB", (width, height), base_color)
    draw = ImageDraw.Draw(img)

    # Subtle weave texture
    r0, g0, b0 = base_color
    ar, ag, ab = accent_color
    
    # Gradient overlay
    for y in range(0, height, 4):
        factor = y / height
        cur_r = int(r0 * (1 - factor * 0.25) + ar * (factor * 0.15))
        cur_g = int(g0 * (1 - factor * 0.25) + ag * (factor * 0.15))
        cur_b = int(b0 * (1 - factor * 0.25) + ab * (factor * 0.15))
        draw.line([(0, y), (width, y)], fill=(cur_r, cur_g, cur_b), width=4)

    # Stylized fabric grain
    for _ in range(300):
        gx = random.randint(0, width - 40)
        gy = random.randint(0, height - 10)
        length = random.randint(15, 60)
        opacity_adj = random.randint(-15, 15)
        line_color = (
            max(0, min(255, r0 + opacity_adj)),
            max(0, min(255, g0 + opacity_adj)),
            max(0, min(255, b0 + opacity_adj))
        )
        draw.line([(gx, gy), (gx + length, gy)], fill=line_color, width=1)

    # Stylized embroidery needlework patterns
    if is_macro:
        # Macro close-up stitching lines
        center_x, center_y = width // 2, height // 2
        for angle_deg in range(0, 360, 20):
            rad = math.radians(angle_deg)
            for r in range(40, min(width, height) // 2 - 40, 14):
                px = int(center_x + r * math.cos(rad))
                py = int(center_y + r * math.sin(rad))
                # draw stitch dash
                dx = int(8 * math.cos(rad + 1.2))
                dy = int(8 * math.sin(rad + 1.2))
                draw.line([(px - dx, py - dy), (px + dx, py + dy)], fill=accent_color, width=3)
                # stitch highlight
                hl_color = (min(255, ar + 50), min(255, ag + 50), min(255, ab + 50))
                draw.line([(px - dx, py - dy), (px, py)], fill=hl_color, width=2)
    else:
        # Subtle garment architectural curves
        for i in range(5):
            pts = [
                (width * 0.2 + i * 20, height * 0.2),
                (width * 0.5 + i * 15, height * 0.6),
                (width * 0.8 - i * 20, height * 0.85)
            ]
            draw.line(pts, fill=accent_color, width=2)

    # Vignette
    img = img.filter(ImageFilter.SMOOTH_MORE)
    img.save(path, quality=90)
    print(f"Generated {path}")

# Palette
CREAM = (246, 244, 239)
INK = (26, 26, 26)
STONE = (229, 226, 220)
WARM_GRAY = (159, 156, 150)
ACCENT_TERRA = (192, 107, 82)
INDIGO = (29, 42, 68)
GOLD = (212, 175, 55)
CHARCOAL = (44, 44, 46)
SAGE = (57, 62, 54)
OATMEAL = (217, 210, 197)

# 1. Categories
categories = [
    ("outerwear", INDIGO, GOLD),
    ("knitwear", OATMEAL, ACCENT_TERRA),
    ("tops", CREAM, CHARCOAL),
    ("bottoms", SAGE, WARM_GRAY),
    ("accessories", STONE, ACCENT_TERRA)
]
for cat, base, acc in categories:
    create_editorial_image(f"public/images/categories/{cat}.jpg", 800, 1000, base, acc, cat.upper(), "Collection")
    create_editorial_image(f"public/images/placeholders/category-{cat}.jpg", 800, 1000, base, acc, cat.upper(), "Placeholder")

# 2. Campaigns & Hero & Lookbook
create_editorial_image("public/images/campaigns/hero.jpg", 1920, 1080, INK, ACCENT_TERRA, "UNIQUELO", "Haute Couture Needlecraft", False)
create_editorial_image("public/images/placeholders/hero.jpg", 1920, 1080, INK, ACCENT_TERRA, "UNIQUELO", "Hero", False)
create_editorial_image("public/images/campaigns/editorial-split.jpg", 1200, 1500, STONE, INDIGO, "ATELIER CRAFT", "The Needle & The Thread", False)
create_editorial_image("public/images/campaigns/atelier-craft.jpg", 1200, 1500, CHARCOAL, GOLD, "PROVENANCE", "Masters of Zardozi", False)
create_editorial_image("public/images/campaigns/lookbook-01.jpg", 1920, 1080, CHARCOAL, OATMEAL, "VOLUME 01", "Winter Flora", False)
create_editorial_image("public/images/campaigns/lookbook-02.jpg", 1920, 1080, INDIGO, GOLD, "VOLUME 02", "Celestial Stitching", False)
create_editorial_image("public/images/campaigns/lookbook-03.jpg", 1920, 1080, SAGE, CREAM, "VOLUME 03", "Architectural Denim", False)

# 3. Products
products = [
    ("botanical-silk-jacket", INDIGO, GOLD),
    ("celestial-zardozi-coat", CHARCOAL, GOLD),
    ("kantha-chore-jacket", INDIGO, CREAM),
    ("crewel-cashmere-cardigan", OATMEAL, ACCENT_TERRA),
    ("french-knot-turtleneck", CREAM, ACCENT_TERRA),
    ("monogram-poplin-shirt", STONE, CHARCOAL),
    ("vine-heavyweight-tee", OATMEAL, SAGE),
    ("sashiko-selvedge-denim", INDIGO, CREAM),
    ("pleated-zari-trousers", SAGE, GOLD),
    ("embroidered-silk-scarf", CREAM, ACCENT_TERRA),
    ("needlework-canvas-tote", STONE, CHARCOAL),
    ("nocturne-velvet-vest", CHARCOAL, GOLD)
]

for p, base, acc in products:
    # 1: Full silhouette (3:4 ratio)
    create_editorial_image(f"public/images/products/{p}-1.jpg", 900, 1200, base, acc, p, "Silhoutte", False)
    # 2: Macro embroidery detail (3:4 ratio)
    create_editorial_image(f"public/images/products/{p}-2.jpg", 900, 1200, base, acc, p, "3x Macro Stitch Relief", True)
    # Placeholders
    create_editorial_image(f"public/images/placeholders/product-{p}-1.jpg", 900, 1200, base, acc, p, "Placeholder", False)
    create_editorial_image(f"public/images/placeholders/product-{p}-2.jpg", 900, 1200, base, acc, p, "Placeholder Macro", True)

print("All assets successfully generated!")
