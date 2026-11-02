import type { EmbroideryTechnique, Product } from './data';
import { isMerchandisable } from './licensed-marks';

/**
 * ONE ANSWER TO "HOW MANY PIECES IS THIS TECHNIQUE?"
 *
 * Three surfaces used to count three different ways and produced three
 * different numbers for the same technique:
 *
 *   · the home technique table matched only `craftTechniques[]`      → 25
 *   · the craft index matched craftTechniques OR embroidery OR tags  → 21
 *   · the technique page matched the same three, minus licensed marks → 21
 *
 * and a fourth number appeared in the shop, which matches only
 * `craftTechniques[]` when the array is non-empty. Every one of those was
 * defensible in isolation and wrong as a set: a buyer who reads 25 on the home
 * page and 21 on the technique page has been given three arithmetic results for
 * one catalogue, and the band exists to be the proof.
 *
 * The rule, applied everywhere:
 *
 *   1. `craftTechniques[]` is the record when it is non-empty; otherwise fall
 *      back to `embroidery.technique`, which is the older single-value field.
 *   2. A piece with a licensed mark in its photography is counted out of every
 *      curated surface — see `lib/licensed-marks.ts` for why.
 *   3. A piece can be filed under more than one technique, so per-technique
 *      counts sum to more than the number of distinct pieces. Surfaces that
 *      state a total must count distinct pieces and say so.
 */
export function techniquesOf(product: Product): EmbroideryTechnique[] {
  const list = product.craftTechniques ?? [];
  if (list.length > 0) return list;
  return product.embroidery?.technique ? [product.embroidery.technique] : [];
}

export function isWorkedIn(product: Product, technique: string): boolean {
  return techniquesOf(product).includes(technique as EmbroideryTechnique);
}

/** The catalogue as every curated surface should see it. */
export function merchandisableCatalogue(products: Product[] | undefined): Product[] {
  return (products ?? []).filter(isMerchandisable);
}

/** Pieces worked in one technique. */
export function piecesInTechnique(
  products: Product[] | undefined,
  technique: string,
): Product[] {
  return merchandisableCatalogue(products).filter((p) => isWorkedIn(p, technique));
}

/** Distinct pieces filed under at least one technique. */
export function distinctPiecesInTechniques(products: Product[] | undefined): number {
  return new Set(
    merchandisableCatalogue(products)
      .filter((p) => techniquesOf(p).length > 0)
      .map((p) => p.slug),
  ).size;
}
