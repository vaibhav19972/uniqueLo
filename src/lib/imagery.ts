/**
 * PLACES WHERE A GRADIENT IS NOT A PHOTOGRAPH
 *
 * The catalogue's images are Supabase-hosted photographs, with one exception:
 * `arch-jaal-scarf`, whose two local files (`embroidered-silk-scarf-1.jpg` and
 * `-2.jpg`) are flat cream-to-tan gradients with no garment in them. Their
 * per-pixel range is under 100 and their 64px standard deviation under 12, so
 * cropping one to a 3.5rem plate produces something that reads as a broken
 * image rather than as cloth.
 *
 * The set is explicit rather than measured at runtime: only one product is
 * affected, and `sharp`/canvas analysis of every thumb doesn't belong in a
 * render path. Delete these entries when the scarf is re-shot — the files are
 * the thing that is missing, not the record.
 */
const FLAT_ASSET_PATHS = new Set([
  '/images/products/embroidered-silk-scarf-1.jpg',
  '/images/products/embroidered-silk-scarf-2.jpg',
  '/images/placeholders/product-embroidered-silk-scarf-1.jpg',
  '/images/placeholders/product-embroidered-silk-scarf-2.jpg',
]);

/**
 * True when an image source is a gradient stand-in rather than a photograph of
 * a garment. Callers should treat `false` as "no image" and omit the plate
 * instead of filling it with the gradient.
 */
export function isFlatPlaceholder(src: string | undefined | null): boolean {
  if (!src) return true;
  if (FLAT_ASSET_PATHS.has(src)) return true;
  return /\/images\/placeholders\/(category|hero)[^/]*\.jpg$/.test(src);
}

/** The first real photograph in a candidate list, or `null`. */
export function firstRealImage(...candidates: (string | undefined | null)[]): string | null {
  for (const src of candidates) {
    if (src && !isFlatPlaceholder(src)) return src;
  }
  return null;
}

/**
 * BACKDROPLESS CUT-OUTS
 *
 * The catalogue's photographs are shot against a studio backdrop, and in the
 * first viewport that backdrop reads as a cool grey slab the garment is
 * standing in — the one image on the home page that breaks DESIGN.md's
 * "garment photography on paper, never on chrome".
 *
 * For pieces whose backdrop is uniform enough to separate cleanly, a cut-out
 * with a real alpha channel (transparent PNG, not a CSS mask, not an SVG
 * silhouette) is produced from the same photograph: the studio field and its
 * contact shadow are removed, the rim is decontaminated against the backdrop
 * colour, and the garment keeps its own threads, buttons and shadowing. No pixel
 * of the garment is redrawn, so the cut-out cannot disagree with the record.
 *
 * Keys are product slugs; values are the cut-out's source path. A piece not
 * listed here simply has no cut-out and renders its photograph in its own
 * plate — the hero prefers a listed piece so the first viewport is always the
 * one that can sit on the ground.
 */
export const HERO_CUTOUTS: Record<string, string> = {
  'sage-linen-embroidered-shirt': '/images/products/sage-linen-embroidered-shirt-hero.png',
};

/** The cut-out for a product, or `null` when none has been produced. */
export function cutoutFor(slug: string | undefined | null): string | null {
  if (!slug) return null;
  return HERO_CUTOUTS[slug] ?? null;
}
