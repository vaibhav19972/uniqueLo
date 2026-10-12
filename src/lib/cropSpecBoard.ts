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
 * applied at crop time. Measured off the v1 reference board; see pipeline doc.
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
    [0.3377, 0.7027],
    [0.7096, 0.9969],
  ],
  rowBounds: [
    [0.0025, 0.4621],
    [0.5013, 0.9566],
  ],
  inset: 0.004,
};

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
    const fctx = full.getContext('2d');
    if (!fctx) throw new Error('2D canvas context unavailable');
    fctx.drawImage(bitmap, 0, 0);

    const slots: CroppedSlot[] = [];
    for (let row = 0; row < geometry.rows; row++) {
      for (let col = 0; col < geometry.cols; col++) {
        const index = row * geometry.cols + col;
        const def = SPEC_BOARD_SLOTS[index];
        const [cx0, cx1] = geometry.colBounds[col];
        const [ry0, ry1] = geometry.rowBounds[row];
        const x = Math.round(cx0 * W + geometry.inset * W);
        const y = Math.round(ry0 * H + geometry.inset * H);
        const w = Math.round(cx1 * W - geometry.inset * W) - x;
        const h = Math.round(ry1 * H - geometry.inset * H) - y;
        if (w <= 0 || h <= 0) throw new Error(`Geometry v${geometry.version} yields empty crop at cell ${index + 1}`);

        const cell = document.createElement('canvas');
        cell.width = w;
        cell.height = h;
        const cctx = cell.getContext('2d');
        if (!cctx) throw new Error('2D canvas context unavailable');
        cctx.drawImage(full, x, y, w, h, 0, 0, w, h);

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

        // Label-bleed scan: bottom 8% rows; dark pixels there = label text.
        const bandStart = Math.floor(scanH * 0.92);
        let dark = 0;
        let total = 0;
        for (let y = bandStart; y < scanH; y++) {
          for (let x = 0; x < scanW; x++) {
            const i = (y * scanW + x) * 4;
            total++;
            if (data[i] < 90 && data[i + 1] < 90 && data[i + 2] < 90) dark++;
          }
        }
        if (total > 0 && dark / total > 0.02) {
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
