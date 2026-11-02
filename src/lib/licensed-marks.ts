import type { Product } from './data';

/**
 * A third-party trademark is visible in this product's artwork.
 *
 * PRODUCT.md's legal constraint is absolute: no unlicensed trademarked IP in
 * imagery. Auditing all 29 catalogue photographs at 2x (2026-11-02) found four
 * pieces carrying the same athlete-brand swoosh, embroidered into the artwork
 * itself — not as a filename hint, which is why the first version of this
 * filter only caught one:
 *
 *   floral-sweep-hoodie      a floral swoosh, dead centre
 *   floral-skeleton-hoodie   the "skeleton arm" ends in the swoosh's tail
 *   anime-hoodie             a blue swoosh beneath the figure
 *   cream-anime-tee          a red crescent-swoosh beneath the figure
 *
 * Filenames and alt text say nothing about it, so the slugs are listed
 * explicitly. This list is the only thing standing between a real trademark and
 * the brand's own marketing surfaces; when a piece is re-shot, delete its slug
 * from here in the same commit.
 *
 * This is a real-world asset problem, not a code problem: the fix is to
 * re-photograph those pieces or retire them. Until then the rule keeps them out
 * of every surface that presents a garment as the brand's own work (hero cast,
 * upsell rails, cross-sell, curated rails). It is deliberately NOT a blanket
 * hide from search or the collection — a buyer who arrives from an ad should
 * still find the piece they were shown, and hiding it would move the problem
 * rather than surface it.
 */
const MARKED_SLUGS = new Set([
  'floral-sweep-hoodie',
  'floral-skeleton-hoodie',
  'anime-hoodie',
  'cream-anime-tee',
]);

const LICENSED_MARK = /swoosh|nike|marvel|disney|batman|pokemon|jordan|adidas|gucci|chanel/i;

export function hasLicensedMark(p: Product): boolean {
  if (MARKED_SLUGS.has(p.slug)) return true;
  const blob = [
    p.slug,
    p.name,
    ...(p.images ?? []).map((i) => i.src),
    ...(p.images ?? []).map((i) => i.alt ?? ''),
  ].join(' ');
  return LICENSED_MARK.test(blob);
}

/** Products safe to present as the brand's own work in a merchandising surface. */
export function isMerchandisable(p: Product): boolean {
  return !hasLicensedMark(p);
}
