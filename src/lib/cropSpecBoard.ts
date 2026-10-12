/**
 * All-in-One spec-board cropper (see `docs/08-universe-build/07-image-pipeline.md`
 * "All-in-One Spec-Board Intake"). Canvas-based, zero new dependencies.
 *
 * A fixed-format 3×2 spec-board PNG (v1: 1312×1199, photo cells + numbered
 * label strips) is split into the six catalog image slots in cell order.
 * Geometry is config-driven so a future board template becomes a new config
 * version instead of silent guessing.
 */

/** One catalog image slot produced from a spec-board cell. */
export interface SpecBoardSlotDef {
  /** Catalog slot index = `product_images.sort_order` (0–5). */
  index: number;
  /** Stable key used for generated filenames (`<slug>-<key>.<ext>`). */
  key: string;
  /** Human label shown in Admin previews. */
  label: string;
  /** Alt-text suffix: `<Product> — <colorway> — <altSuffix>`. */
  altSuffix: string;
}

export const SPEC_BOARD_SLOTS: SpecBoardSlotDef[] = [
  { index: 0, key: 'front', label: '1 · Full Front (hero)', altSuffix: 'front view' },
  { index: 1, key: 'back', label: '2 · Full Back (on-model)', altSuffix: 'back view' },
  { index: 2, key: 'profile', label: '3 · Three-Quarter Profile (scale)', altSuffix: 'three-quarter profile on model' },
  { index: 3, key: 'macro-neckline', label: '4 · Hood / Neckline Detail (macro)', altSuffix: 'hood and neckline stitch detail' },
  { index: 4, key: 'macro-cuff', label: '5 · Cuff / Hem Embroidery Macro (placement)', altSuffix: 'cuff and hem embroidery macro' },
  { index: 5, key: 'macro-front', label: '6 · Front Embroidery / Fabric Macro', altSuffix: 'front embroidery and fabric macro' },
];

/**
 * Fractional (0–1, of natural W/H) photo-cell bounds with a safety inset
 * applied at crop time. v1 priors measured off the reference board — but
 * dividers DRIFT between boards (the reference middle-column divider sits at
 * x≈0.664 top / x≈0.657 bottom, not where a full-height scan suggests), so
 * `cropSpecBoard` measures each board via `detectGeometry` and treats these
 * priors as fallback only. See the pipeline doc.
 */
export interface SpecBoardGeometry {
  version: number;
  cols: number;
  rows: number;
  /** Per-column [x0, x1] photo bounds (dividers/labels excluded). */
  colBounds: [number, number][];
  /** [topRow, bottomRow] each as [y0, y1] photo bounds. */
  rowBounds: [[number, number], [number, number]];
  /** Safety inset as a fraction of W (x) / H (y). */
  inset: number;
}

export const SPEC_BOARD_V1: SpecBoardGeometry = {
  version: 1,
  cols: 3,
  rows: 2,
  colBounds: [
    [0.0023, 0.3323],
    [0.3377, 0.664],
    [0.7096, 0.9969],
  ],
  rowBounds: [
    [0.0025, 0.4621],
    [0.5013, 0.9566],
  ],
  inset: 0.004,
};

/**
 * Measured geometry: pixel bounds detected from the actual board, plus the
 * deviation from the v1 priors (fraction of W; >0.05 means this board drifts
 * from the template and detection is doing real work).
 */
export interface MeasuredGeometry {
  /** Per-column [x0, x1] photo bounds in px (dividers/labels excluded). */
  cols: [number, number][];
  /** [topRow, bottomRow] each as [y0, y1] photo bounds in px. */
  rows: [[number, number], [number, number]];
  deviation: number;
}

function columnBrightness(
  data: Uint8ClampedArray,
  W: number,
  yBands: [number, number][]
): number[] {
  const means = new Array<number>(W).fill(0);
  const counts = new Array<number>(W).fill(0);
  for (const [ya, yb] of yBands) {
    for (let y = ya; y < yb; y += 2) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        means[x] += (data[i] + data[i + 1] + data[i + 2]) / 3;
        counts[x]++;
      }
    }
  }
  return means.map((s, x) => (counts[x] > 0 ? s / counts[x] : 0));
}

/**
 * Detect the real cell geometry of a spec board instead of trusting fixed
 * fractions. Vertical dividers read as bright columns (near-white) running
 * through both photo bands; label strips read as near-white rows. Anything
 * that fails detection falls back to the v1 fractional priors, so a board
 * that breaks the template degrades to the old behavior rather than garbage.
 *
 * Why detection-first: fixed fractions were measured off one reference board,
 * but dividers drift a few px between boards — enough to bleed a white line
 * plus a sliver of the neighboring cell into middle-column crops.
 */
export function detectGeometry(
  imageData: ImageData,
  fallback: SpecBoardGeometry = SPEC_BOARD_V1
): MeasuredGeometry {
  const W = imageData.width;
  const H = imageData.height;
  const data = imageData.data;

  // Label strips: rows that are mostly near-white.
  const whiteRows: boolean[] = [];
  for (let y = 0; y < H; y++) {
    let white = 0;
    const total = Math.ceil(W / 3);
    for (let x = 0; x < W; x += 3) {
      const i = (y * W + x) * 4;
      if ((data[i] + data[i + 1] + data[i + 2]) / 3 > 225) white++;
    }
    whiteRows.push(white / total > 0.55);
  }
  const runs: [number, number][] = [];
  let start = -1;
  for (let y = 0; y <= H; y++) {
    const w = y < H && whiteRows[y];
    if (w && start < 0) start = y;
    if (!w && start >= 0) {
      if (y - start >= 8) runs.push([start, y - 1]);
      start = -1;
    }
  }
  // Photo bands = the two tallest non-white bands.
  const bands: [number, number][] = [];
  const bandStarts = [0, ...runs.map(([, b]) => b + 1)];
  for (let i = 0; i < bandStarts.length; i++) {
    const end = i < runs.length ? runs[i][0] - 1 : H - 1;
    if (end - bandStarts[i] >= 40) bands.push([bandStarts[i], end]);
  }
  bands.sort((a, b) => b[1] - b[0] - (a[1] - a[0]));
  const photoBands = bands.slice(0, 2).sort((a, b) => a[0] - b[0]);

  const fail: MeasuredGeometry = {
    cols: fallback.colBounds.map(([a, b]) => [Math.round(a * W), Math.round(b * W)] as [number, number]),
    rows: [
      [Math.round(fallback.rowBounds[0][0] * H), Math.round(fallback.rowBounds[0][1] * H)],
      [Math.round(fallback.rowBounds[1][0] * H), Math.round(fallback.rowBounds[1][1] * H)],
    ],
    deviation: 0,
  };
  if (photoBands.length < 2) return fail;

  // Dividers: bright columns running through BOTH photo bands.
  const bright = columnBrightness(data, W, photoBands);
  const dividerCols: number[] = [];
  for (let x = 0; x < W; x++) {
    if (bright[x] <= 228) continue;
    // Must be bright in each band independently (a white garment is not a divider).
    let inAll = true;
    for (const [ya, yb] of photoBands) {
      let sum = 0;
      let n = 0;
      for (let y = ya; y < yb; y += 2) {
        const i = (y * W + x) * 4;
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        n++;
      }
      if (n === 0 || sum / n <= 228) {
        inAll = false;
        break;
      }
    }
    if (inAll) dividerCols.push(x);
  }
  const groups: number[][] = [];
  for (const x of dividerCols) {
    if (groups.length > 0 && x - groups[groups.length - 1][groups[groups.length - 1].length - 1] <= 3) {
      groups[groups.length - 1].push(x);
    } else {
      groups.push([x]);
    }
  }
  const dividers = groups.filter((g) => g.length >= 2).map((g) => (g[0] + g[g.length - 1]) / 2);
  // Expect cols-1 interior dividers; tolerate the outer border as well.
  const interior = dividers.filter((x) => x > W * 0.05 && x < W * 0.95);
  if (interior.length !== fallback.cols - 1) return fail;

  const edges = [2, ...interior, W - 3];
  const margin = Math.max(3, Math.round(W * fallback.inset));
  const cols: [number, number][] = [];
  for (let i = 0; i < fallback.cols; i++) {
    cols.push([Math.round(edges[i] + margin), Math.round(edges[i + 1] - margin)]);
  }
  const vMargin = Math.max(3, Math.round(H * fallback.inset));
  const rows = photoBands.map(
    ([a, b]) => [a + vMargin, b - vMargin] as [number, number]
  ) as [[number, number], [number, number]];

  // Deviation vs priors: max edge drift as a fraction of W.
  let deviation = 0;
  for (let i = 0; i < fallback.cols; i++) {
    deviation = Math.max(
      deviation,
      Math.abs(cols[i][0] / W - fallback.colBounds[i][0]),
      Math.abs(cols[i][1] / W - fallback.colBounds[i][1])
    );
  }
  return { cols, rows, deviation };
}

export interface CroppedSlot {
  def: SpecBoardSlotDef;
  /** Cropped image data (JPEG). */
  blob: Blob;
  /** `data:` preview URL (revoke with `URL.revokeObjectURL` when done). */
  previewUrl: string;
  width: number;
  height: number;
}

function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas crop produced no data'))),
      type,
      quality
    );
  });
}

/**
 * Split a spec-board image (File/Blob/URL/data-URL) into its six slot crops.
 * Throws on undecodable input or geometry mismatch (board < 600px wide).
 */
export async function cropSpecBoard(
  source: ImageBitmapSource,
  geometry: SpecBoardGeometry = SPEC_BOARD_V1
): Promise<CroppedSlot[]> {
  const bitmap = await createImageBitmap(source);
  try {
    const { width: W, height: H } = bitmap;
    if (W < 600 || H < 400) {
      throw new Error(`Spec board too small (${W}×${H}); expected ≥600×400`);
    }
    const full = document.createElement('canvas');
    full.width = W;
    full.height = H;
    const fctx = full.getContext('2d', { willReadFrequently: true });
    if (!fctx) throw new Error('2D canvas context unavailable');
    fctx.drawImage(bitmap, 0, 0);

    // Measure the real grid; fall back to the v1 fractional priors when the
    // board breaks the template (detection is conservative by design).
    const measured = detectGeometry(fctx.getImageData(0, 0, W, H), geometry);

    const slots: CroppedSlot[] = [];
    for (let row = 0; row < geometry.rows; row++) {
      for (let col = 0; col < geometry.cols; col++) {
        const index = row * geometry.cols + col;
        const def = SPEC_BOARD_SLOTS[index];
        const [cx0, cx1] = measured.cols[col];
        const [ry0, ry1] = measured.rows[row];
        const w = cx1 - cx0;
        const h = ry1 - ry0;
        if (w <= 0 || h <= 0) throw new Error(`Geometry v${geometry.version} yields empty crop at cell ${index + 1}`);

        const cell = document.createElement('canvas');
        cell.width = w;
        cell.height = h;
        const cctx = cell.getContext('2d');
        if (!cctx) throw new Error('2D canvas context unavailable');
        cctx.drawImage(full, cx0, ry0, w, h, 0, 0, w, h);

        const blob = await canvasToBlob(cell);
        slots.push({ def, blob, previewUrl: URL.createObjectURL(blob), width: w, height: h });
      }
    }
    return slots;
  } finally {
    bitmap.close();
  }
}

export interface CropIssue {
  slotIndex: number;
  message: string;
}

function luminanceStdDev(data: Uint8ClampedArray): number {
  const n = data.length / 4;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  const mean = sum / n;
  let variance = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    variance += (lum - mean) * (lum - mean);
  }
  return Math.sqrt(variance / n);
}

/**
 * Validate crops before upload. Returns issues (empty = pass):
 * - minimum dimensions (photos must survive the 3:4 PDP stage),
 * - blank/flat detection (failed decode or empty cell),
 * - label-bleed scan (dark text pixels in the bottom 8% band mean the crop
 *   caught a label strip — geometry is wrong for this board).
 */
export async function validateCrops(slots: CroppedSlot[]): Promise<CropIssue[]> {
  const issues: CropIssue[] = [];
  if (slots.length !== SPEC_BOARD_SLOTS.length) {
    issues.push({ slotIndex: -1, message: `Expected ${SPEC_BOARD_SLOTS.length} crops, got ${slots.length}` });
    return issues;
  }
  await Promise.all(
    slots.map(async (slot) => {
      if (slot.width < 200 || slot.height < 200) {
        issues.push({ slotIndex: slot.def.index, message: `Crop too small (${slot.width}×${slot.height}); check board geometry` });
        return;
      }
      const bitmap = await createImageBitmap(slot.blob);
      try {
        const canvas = document.createElement('canvas');
        // Downsample for a cheap scan — full-res readback is wasteful.
        const scanW = 64;
        const scanH = Math.max(1, Math.round((64 * bitmap.height) / bitmap.width));
        canvas.width = scanW;
        canvas.height = scanH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(bitmap, 0, 0, scanW, scanH);
        const data = ctx.getImageData(0, 0, scanW, scanH).data;

        if (luminanceStdDev(data) < 6) {
          issues.push({ slotIndex: slot.def.index, message: 'Crop looks blank — wrong cell or failed decode' });
          return;
        }

        // Label-bleed scan: a real label strip is a near-WHITE band carrying
        // dark text. First require the band to actually look like a label
        // background (>40% near-white pixels); dark garments (Obsidian Noir,
        // black hoodies) fail that gate and skip the text check entirely,
        // which removes the false-positive class on dark lower frames.
        const bandStart = Math.floor(scanH * 0.92);
        let white = 0;
        let dark = 0;
        let total = 0;
        for (let y = bandStart; y < scanH; y++) {
          for (let x = 0; x < scanW; x++) {
            const i = (y * scanW + x) * 4;
            const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
            total++;
            if (lum > 225) white++;
            if (data[i] < 90 && data[i + 1] < 90 && data[i + 2] < 90) dark++;
          }
        }
        if (total > 0 && white / total > 0.4 && dark / total > 0.02) {
          issues.push({ slotIndex: slot.def.index, message: 'Possible label-strip bleed in crop — verify geometry' });
        }
      } finally {
        bitmap.close();
      }
    })
  );
  return issues.sort((a, b) => a.slotIndex - b.slotIndex);
}

/** Release preview URLs created by `cropSpecBoard`. */
export function revokeCropPreviews(slots: CroppedSlot[]): void {
  for (const slot of slots) URL.revokeObjectURL(slot.previewUrl);
}
