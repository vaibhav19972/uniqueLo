import type { Product, ProductVariant } from './data';

/**
 * ONE SIZE ORDER, EVERYWHERE
 *
 * Size chips were rendered in whatever order the `variants` array happened to
 * arrive in, and the three places that did sort used three different ladders:
 *
 *   · the rail card      XS S M L XL XXL 2XL 3XL OS
 *   · the size guide     XS S M L XL 2XL 3XL ONE
 *   · the quick view     no sort at all
 *
 * On a garment whose rows are not already alphabetical that put XS at the end
 * of the row — the smallest size, last, where a buyer scanning for it does not
 * look. A size row is a scale; it reads smallest to largest or it is not a
 * scale. `OS` and `ONE` are the single-size markers and sit at the end.
 */
const SIZE_LADDER = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '2XL',
  '3XL',
  '4XL',
  'OS',
  'ONE',
  'FREE',
];

function rank(size: string): number {
  const index = SIZE_LADDER.indexOf(size.toUpperCase());
  return index === -1 ? SIZE_LADDER.length : index;
}

/** Sort a list of size labels smallest → largest, unknowns last, stable. */
export function sortSizes(sizes: readonly string[]): string[] {
  return [...sizes].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

/** A product's variants in size order. */
export function orderedVariants(product: Product): ProductVariant[] {
  return [...product.variants].sort((a, b) => rank(a.size) - rank(b.size) || a.size.localeCompare(b.size));
}
