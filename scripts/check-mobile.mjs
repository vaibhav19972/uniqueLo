#!/usr/bin/env node
/**
 * check-mobile.mjs — the mobile budget gate.
 *
 * Loads each route at 390×844, measures the real DOM, and fails on four
 * classes of defect that are invisible in a desktop browser and invisible in
 * code review:
 *
 *   1. LENGTH     — page is taller than its budget (too much scroll)
 *   2. OVERFLOW   — content is wider than the viewport (horizontal scroll)
 *   3. TOUCH      — an interactive target is smaller than 44×44
 *   4. WORDS      — the page says more than its budget allows
 *
 * It exists because "mobile-first" decays into an intention without a gate.
 * Budgets live in BUDGETS below, so they are reviewable and arguable in one
 * place instead of scattered through components.
 *
 * ZERO DEPENDENCIES ON PURPOSE. It drives the machine's own Chrome over the
 * DevTools Protocol using Node's built-in WebSocket (Node ≥ 22). Adding
 * Playwright/Puppeteer to run four measurements would cost ~300MB and a
 * supply-chain surface for no gain. If no Chrome is found it exits 2 with a
 * message rather than silently skipping the check.
 *
 * Usage:
 *   node scripts/check-mobile.mjs                  # judge against budgets
 *   node scripts/check-mobile.mjs --route=/shop    # one route
 *   node scripts/check-mobile.mjs --json           # machine-readable
 *   node scripts/check-mobile.mjs --baseline       # record, do not judge
 *   node scripts/check-mobile.mjs --verbose        # print every offender
 *
 * Env:
 *   MOBILE_BASE   default http://127.0.0.1:5177
 *   CHROME_PATH   override the browser binary
 *
 * Exits 0 only when every route passes.
 */

import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.env.MOBILE_BASE ?? 'http://127.0.0.1:5177';
const VIEWPORT = { width: 390, height: 844 };
const MIN_TARGET = 44;

/**
 * Per-route budgets. `screens` is what the user actually experiences.
 *
 * Home is the tight one on purpose: it is the only route where a shopper has
 * not yet expressed intent, so every screen of scroll has to earn the next.
 * PLP is allowed to be long — a grid of 29 pieces legitimately runs deep — but
 * its *word* count stays low because a grid should carry no prose.
 */
const BUDGETS = {
  '/':                            { screens: 4.0, words: 350, note: 'shopfront, not an index' },
  '/shop':                        { screens: 26,  words: 260, note: 'grid: depth is legitimate, prose is not' },
  '/product/ascendant-cream-tee': { screens: 6.5, words: 420, note: 'gallery + buy box + 3 accordions' },
  '/worlds':                      { screens: 3.0, words: 260, note: 'four doorways' },
  '/styles':                      { screens: 3.5, words: 300, note: 'edits gallery' },
  '/clothing':                    { screens: 3.5, words: 260, note: 'garment index' },
};

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

function findChrome() {
  for (const p of CHROME_CANDIDATES) if (existsSync(p)) return p;
  return null;
}

function parseArgs(argv) {
  const out = { json: false, baseline: false, route: null, verbose: false };
  for (const a of argv.slice(2)) {
    if (a === '--json') out.json = true;
    else if (a === '--baseline') out.baseline = true;
    else if (a === '--verbose') out.verbose = true;
    else if (a.startsWith('--route=')) out.route = a.slice(8);
  }
  return out;
}

/** Minimal CDP client over a browser-level WebSocket. */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.sessions = new Map();
    ws.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      }
    });
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', () => reject(new Error('CDP socket failed')), { once: true });
    });
    return new CDP(ws);
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`${method} timed out`));
        }
      }, 30000);
    });
  }

  close() { try { this.ws.close(); } catch {} }
}

/**
 * Runs inside the page. Returns raw measurements only — all judgement happens
 * in Node so thresholds stay reviewable in one file.
 */
function measure(route) {
  const viewW = window.innerWidth;
  const docW = document.documentElement.scrollWidth;
  const root = document.querySelector('main') ?? document.body;
  const text = root.innerText ?? '';
  const words = text.split(/\s+/).filter(Boolean).length;

  const offenders = [];
  const els = document.querySelectorAll(
    'a, button, [role="button"], input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"])',
  );
  for (const el of els) {
    if (el.closest('[aria-hidden="true"], [hidden], .skip-link')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // Visually-hidden utility content (skip links, sr-only labels) collapses to
    // ~1px. It is announced by assistive tech, not tapped, so it is not a
    // touch target. Anything genuinely 1px and clickable would be a separate bug.
    if (r.width <= 2 || r.height <= 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (r.width < 44 || r.height < 44) {
      // An inline text link inside a sentence is prose, not a control.
      const inProse = !!(el.closest('p, li, figcaption, td') && cs.display === 'inline' && r.height < 24);
      const label = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('name') || '')
        .trim().replace(/\s+/g, ' ').slice(0, 44);
      offenders.push({
        tag: el.tagName.toLowerCase(),
        label: label || '(unlabelled)',
        w: Math.round(r.width),
        h: Math.round(r.height),
        inProse,
      });
    }
  }

  const overflowing = [];
  if (docW > viewW + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > viewW + 1 && r.width > 40) {
        overflowing.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 56), right: Math.round(r.right) });
        if (overflowing.length >= 5) break;
      }
    }
  }

  return {
    route,
    heightPx: document.body.scrollHeight,
    docWidth: docW,
    viewWidth: viewW,
    screens: +(document.body.scrollHeight / window.innerHeight).toFixed(2),
    words,
    offenders,
    overflowing,
  };
}

/**
 * Wait for the page to actually SETTLE before measuring.
 *
 * `readyState === 'complete'` fires when the HTML and assets are done, which is
 * long before React has fetched the catalogue and mounted the sections. An
 * earlier version measured on load and reported the PDP as "1 word, 2.2
 * screens" — i.e. it measured the loading skeleton and passed it. A gate that
 * passes an empty page is worse than no gate.
 *
 * So: poll until (height, text length, element count) are identical for several
 * consecutive samples, with a floor on elapsed time so a fast first paint
 * cannot win the race.
 */
const SETTLE = `(async () => {
  const sig = () => document.body.scrollHeight + '|' +
                   (document.body.innerText || '').length + '|' +
                   document.querySelectorAll('*').length;

  const started = Date.now();
  let last = null, stable = 0;

  // Phase 1 — wait for stability (max ~12s).
  while (Date.now() - started < 12000) {
    const s = sig();
    if (s === last) stable++; else { stable = 0; last = s; }
    // 6 consecutive identical samples at 150ms = ~900ms of silence, and never
    // judge before 1.2s so hydration has a chance.
    if (stable >= 6 && Date.now() - started > 1200) break;
    await new Promise(r => setTimeout(r, 150));
  }

  // Phase 2 — walk the page so reveal-on-scroll and lazy images mount. This
  // must come after stability: scrolling a skeleton is meaningless.
  const step = window.innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 70));
  }

  // Phase 3 — let the last reveals finish, then reset to top.
  await new Promise(r => setTimeout(r, 500));
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 250));

  return { elapsed: Date.now() - started, height: document.body.scrollHeight };
})()`;

async function main() {
  const args = parseArgs(process.argv);
  const routes = args.route ? [args.route] : Object.keys(BUDGETS);

  const chrome = findChrome();
  if (!chrome) {
    console.error('\n  No Chrome/Chromium found. Set CHROME_PATH, or install one.\n');
    process.exit(2);
  }

  const port = 9200 + (process.pid % 250);
  const proc = spawn(chrome, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--user-data-dir=/tmp/uniquelo-mobile-gate',
    '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disable-background-networking',
    '--hide-scrollbars', '--force-device-scale-factor=2',
    'about:blank',
  ], { stdio: 'ignore' });

  let cdp;
  try {
    // Wait for the debugging endpoint.
    let version = null;
    for (let i = 0; i < 100; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (res.ok) { version = await res.json(); break; }
      } catch {}
      await sleep(100);
    }
    if (!version) throw new Error('Chrome did not expose a debugging port');
    cdp = await CDP.connect(version.webSocketDebuggerUrl);

    const results = [];
    for (const route of routes) {
      try {
        const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
        const send = (m, p) => cdp.send(m, p, sessionId);

        await send('Page.enable');
        await send('Runtime.enable');
        await send('Emulation.setDeviceMetricsOverride', {
          width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 2, mobile: true,
        });
        await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

        await send('Page.navigate', { url: BASE + route });
        const warm = await send('Runtime.evaluate', { expression: SETTLE, awaitPromise: true, returnByValue: true });
        if (warm.exceptionDetails) throw new Error('settle failed: ' + (warm.exceptionDetails.text ?? ''));

        const { result } = await send('Runtime.evaluate', {
          expression: `(${measure.toString()})(${JSON.stringify(route)})`,
          returnByValue: true,
        });
        results.push(result.value);

        await cdp.send('Target.closeTarget', { targetId });
      } catch (err) {
        results.push({ route, error: String(err.message).split('\n')[0] });
      }
    }

    // ── Baseline mode: record, do not judge ──────────────────────────────
    if (args.baseline) {
      const snapshot = {
        recordedAt: new Date().toISOString(),
        viewport: VIEWPORT,
        base: BASE,
        routes: Object.fromEntries(results.map((r) => [r.route, r.error
          ? { error: r.error }
          : {
              heightPx: r.heightPx,
              screens: r.screens,
              words: r.words,
              smallTargets: r.offenders.filter((o) => !o.inProse).length,
              overflow: r.docWidth > r.viewWidth + 1,
            }])),
      };
      const file = new URL('./mobile-baseline.json', import.meta.url);
      await writeFile(file, JSON.stringify(snapshot, null, 2) + '\n');
      console.log('\n  Baseline recorded → scripts/mobile-baseline.json\n');
      for (const [route, v] of Object.entries(snapshot.routes)) {
        if (v.error) console.log(`  ${route.padEnd(34)} ERROR ${v.error}`);
        else console.log(`  ${route.padEnd(34)} ${String(v.screens).padStart(6)} screens · ${String(v.words).padStart(5)} words · ${String(v.smallTargets).padStart(4)} small targets`);
      }
      console.log('');
      return;
    }

    // ── Judge ────────────────────────────────────────────────────────────
    let failures = 0;
    const report = [];

    for (const r of results) {
      if (r.error) {
        failures++;
        report.push({ route: r.route, status: 'ERROR', problems: [r.error] });
        continue;
      }
      const b = BUDGETS[r.route] ?? { screens: 6, words: 400 };
      const problems = [];

      if (r.screens > b.screens) problems.push(`length ${r.screens} screens > budget ${b.screens} (${r.heightPx}px)`);
      if (r.words > b.words) problems.push(`words ${r.words} > budget ${b.words}`);
      if (r.docWidth > r.viewWidth + 1) {
        problems.push(`horizontal overflow: content ${r.docWidth}px vs viewport ${r.viewWidth}px` +
          (r.overflowing.length ? ` — ${r.overflowing.map((o) => `${o.tag}.${o.cls}`).join(', ')}` : ''));
      }
      const real = r.offenders.filter((o) => !o.inProse);
      if (real.length) {
        problems.push(`${real.length} tap target(s) under ${MIN_TARGET}px: ` +
          real.slice(0, args.verbose ? 999 : 6).map((o) => `"${o.label}" ${o.w}×${o.h}`).join(' · ') +
          (!args.verbose && real.length > 6 ? ` · +${real.length - 6} more` : ''));
      }

      if (problems.length) failures++;
      report.push({
        route: r.route,
        status: problems.length ? 'FAIL' : 'PASS',
        screens: r.screens, budget: b.screens,
        words: r.words, wordBudget: b.words,
        smallTargets: real.length,
        problems, note: b.note,
      });
    }

    if (args.json) {
      console.log(JSON.stringify({ ok: failures === 0, results: report }, null, 2));
    } else {
      console.log('\n  MOBILE BUDGET GATE — 390×844\n');
      for (const r of report) {
        const icon = r.status === 'PASS' ? 'PASS' : r.status === 'FAIL' ? 'FAIL' : 'ERR ';
        console.log(`  [${icon}] ${r.route}`);
        if (r.status !== 'ERROR') {
          console.log(`         ${r.screens} / ${r.budget} screens   ·   ${r.words} / ${r.wordBudget} words   ·   ${r.smallTargets} small targets`);
          if (r.note) console.log(`         ${r.note}`);
        }
        for (const p of r.problems) console.log(`         → ${p}`);
        console.log('');
      }
      console.log(failures === 0
        ? '  All routes within budget.\n'
        : `  ${failures} route(s) over budget. Fix, or consciously raise the budget in scripts/check-mobile.mjs.\n`);
    }

    process.exitCode = failures === 0 ? 0 : 1;
  } catch (err) {
    console.error('\n  ' + String(err.message).split('\n')[0] + '\n');
    process.exitCode = 2;
  } finally {
    cdp?.close();
    proc.kill('SIGKILL');
  }
}

main();
