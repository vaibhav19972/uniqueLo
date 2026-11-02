import { describe, expect, it } from 'vitest';
import { sortSizes } from './sizes';

describe('sortSizes', () => {
  it('reads smallest to largest regardless of input order', () => {
    // This is the order the quick view actually received from `variants` —
    // XS was sitting at the end of the row.
    expect(sortSizes(['S', 'M', 'L', 'XL', '2XL', '3XL', 'XS'])).toEqual([
      'XS',
      'S',
      'M',
      'L',
      'XL',
      '2XL',
      '3XL',
    ]);
  });

  it('keeps XXL and 2XL as distinct rungs between XL and 3XL', () => {
    expect(sortSizes(['3XL', '2XL', 'XXL', 'XL'])).toEqual(['XL', 'XXL', '2XL', '3XL']);
  });

  it('puts one-size markers last', () => {
    expect(sortSizes(['OS', 'M', 'S'])).toEqual(['S', 'M', 'OS']);
    expect(sortSizes(['ONE', 'L'])).toEqual(['L', 'ONE']);
  });

  it('leaves an unrecognised size last rather than dropping it', () => {
    expect(sortSizes(['M', 'Custom', 'S'])).toEqual(['S', 'M', 'Custom']);
  });

  it('does not mutate its input', () => {
    const input = ['L', 'S'];
    sortSizes(input);
    expect(input).toEqual(['L', 'S']);
  });
});
