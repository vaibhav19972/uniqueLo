/**
 * check-contrast.ts — guard the accent tokens.
 *
 * `tokens.css` promises every accent is readable as text. That promise is easy
 * to break silently, because an accent is used on FOUR different light surfaces,
 * not just the canvas:
 *
 *   cream   the page canvas          accent text sits here in body copy
 *   paper   cards and drawers        accent text sits here in card headers
 *   panel   nested surfaces          accent text sits here in ticker badges
 *   +soft   accent at 10% over each  accent text sits here in pills and chips
 *
 * The first three are the surfaces; the fourth is the trap — an accent tinted
 * behind itself loses roughly 0.4 of its ratio and is the first thing to fail.
 *
 * Run:  npx tsx scripts/check-contrast.ts
 * Exit: 0 when every accent passes, 1 otherwise.
 */

const AA_TEXT = 4.5;
const AA_LARGE = 3.0;

type Rgb = [number, number, number];

function hex(value: string): Rgb {
  const h = value.replace('#', '').trim();
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Not a 6-digit hex colour: ${value}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

function luminance([r, g, b]: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Simulate `accent` painted at `alpha` over `base` — how a soft tint renders. */
function tint(accent: Rgb, alpha: number, base: Rgb): Rgb {
  return accent.map((c, i) => c * alpha + base[i] * (1 - alpha)) as Rgb;
}

/** The light-mode surfaces an accent can end up on. Mirrors tokens.css. */
const LIGHT_SURFACES: Record<string, Rgb> = {
  cream: hex('#f7f3ec'),
  paper: hex('#fffdf9'),
  panel: hex('#f2ece1'),
};

interface AccentDef {
  scope: string;
  accent: Rgb;
  onAccent: Rgb;
  softAlpha: number;
}

const LIGHT_ACCENTS: AccentDef[] = [
  { scope: 'atelier', accent: hex('#a93a1a'), onAccent: hex('#ffffff'), softAlpha: 0.1 },
  { scope: 'animeverse', accent: hex('#ac3159'), onAccent: hex('#ffffff'), softAlpha: 0.1 },
  { scope: 'heroverse', accent: hex('#b32d22'), onAccent: hex('#ffffff'), softAlpha: 0.1 },
  { scope: 'itihaas', accent: hex('#7d2333'), onAccent: hex('#ffffff'), softAlpha: 0.1 },
];

const DARK_ACCENTS: AccentDef[] = [
  { scope: 'atelier', accent: hex('#f0865f'), onAccent: hex('#17140f'), softAlpha: 0.12 },
  { scope: 'animeverse', accent: hex('#f28cb4'), onAccent: hex('#17140f'), softAlpha: 0.12 },
  { scope: 'heroverse', accent: hex('#f4776a'), onAccent: hex('#17140f'), softAlpha: 0.12 },
  { scope: 'itihaas', accent: hex('#e7909e'), onAccent: hex('#17140f'), softAlpha: 0.12 },
];

const DARK_SURFACES: Record<string, Rgb> = {
  canvas: hex('#000000'),
  paper: hex('#181818'),
  panel: hex('#1f1f1f'),
};

function check(label: string, accents: AccentDef[], surfaces: Record<string, Rgb>) {
  const failures: string[] = [];
  console.log(`\n${label}`);

  for (const { scope, accent, onAccent, softAlpha } of accents) {
    const measured: string[] = [];
    let worst = Infinity;
    let worstWhere = '';

    for (const [name, base] of Object.entries(surfaces)) {
      // Accent as text on the flat surface.
      const flat = ratio(accent, base);
      // Accent as text on its own soft tint over that surface.
      const onSoft = ratio(accent, tint(accent, softAlpha, base));

      for (const [r, where] of [
        [flat, name],
        [onSoft, `${name}+soft`],
      ] as const) {
        if (r < worst) {
          worst = r;
          worstWhere = where;
        }
        if (r < AA_TEXT) {
          failures.push(`${scope}: accent on ${where} is ${r.toFixed(2)}:1 (needs ${AA_TEXT})`);
        }
      }
      measured.push(`${name} ${flat.toFixed(2)}`);
    }

    // The label drawn on a solid accent fill (buttons, active pills).
    const label = ratio(onAccent, accent);
    if (label < AA_TEXT) {
      failures.push(`${scope}: on-accent label is ${label.toFixed(2)}:1 (needs ${AA_TEXT})`);
    }
    if (label < worst) {
      worst = label;
      worstWhere = 'on-accent label';
    }

    const verdict = failures.some((f) => f.startsWith(`${scope}:`)) ? 'FAIL' : ' ok ';
    console.log(
      `  ${verdict} ${scope.padEnd(11)} worst ${worst.toFixed(2)}:1 (${worstWhere})  |  ${measured.join('  ')}`,
    );
  }

  return failures;
}

const failures = [
  ...check('LIGHT surfaces', LIGHT_ACCENTS, LIGHT_SURFACES),
  ...check('DARK surfaces', DARK_ACCENTS, DARK_SURFACES),
];

// Large display text is allowed the looser threshold — report it, never fail on it.
void AA_LARGE;

if (failures.length) {
  console.error(`\n${failures.length} contrast failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('\nAll accents pass WCAG AA on every surface.');
