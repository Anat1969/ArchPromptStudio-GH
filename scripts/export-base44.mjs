#!/usr/bin/env node
/**
 * Export / backup ALL projects and images out of the Base44 backend.
 *
 * This is Phase 1 of migrating off Base44: it pulls every Project record and
 * downloads every referenced image into a local folder. It is read-only and
 * non-destructive — it touches nothing in Base44.
 *
 * Output (default: ./base44-export/, gitignored — it holds user data):
 *   base44-export/projects.json         raw records as returned by Base44
 *   base44-export/projects.local.json   same records, image URLs rewritten to local paths
 *   base44-export/images/<files>        downloaded image bytes
 *   base44-export/manifest.json         { exportedAt, counts, urlToLocal map, failures }
 *
 * Config (from environment or .env.local in the project root):
 *   VITE_BASE44_APP_ID         required (already in .env.local)
 *   VITE_BASE44_APP_BASE_URL   required (already in .env.local)
 *   BASE44_TOKEN               required — your Base44 access token (see below)
 *
 * Getting BASE44_TOKEN:
 *   1. Open the app while logged in (locally via `npm run dev`, or the live site).
 *   2. Open DevTools -> Console and run:
 *        localStorage.getItem('base44_access_token')
 *   3. Copy the string (without quotes) and run this script with it, e.g.
 *        BASE44_TOKEN=eyJhbGci... npm run export:base44
 *      (On Windows PowerShell: $env:BASE44_TOKEN="eyJ..."; npm run export:base44)
 */

import { createClient } from '@base44/sdk';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = process.env.EXPORT_DIR || join(ROOT, 'base44-export');
const IMAGES_DIR = join(OUT_DIR, 'images');

// ─── Minimal .env.local loader (no dependency) ────────────────────────────────
async function loadEnvLocal() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return;
  const text = await readFile(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2].replace(/^["']|["']$/g, '');
    if (process.env[key] === undefined && val !== '') process.env[key] = val;
  }
}

// ─── Collect image URLs from a project record ─────────────────────────────────
function collectImageUrls(record) {
  const urls = new Set();
  const add = (u) => { if (typeof u === 'string' && /^https?:\/\//.test(u)) urls.add(u); };
  add(record.inspiration_image);
  for (const group of ['boards', 'rooms', 'building_types']) {
    const obj = record[group];
    if (obj && typeof obj === 'object') {
      for (const slot of Object.values(obj)) {
        if (slot && typeof slot === 'object') add(slot.resultImage ?? slot.result_image);
      }
    }
  }
  return [...urls];
}

// ─── Turn a URL into a safe, unique local filename ────────────────────────────
function localNameFor(url, index, used) {
  let name;
  try {
    const p = new URL(url).pathname;
    name = basename(p) || `image-${index}`;
  } catch {
    name = `image-${index}`;
  }
  name = name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  if (!extname(name)) name += '.img';
  let candidate = name;
  let n = 1;
  while (used.has(candidate)) {
    const ext = extname(name);
    candidate = `${basename(name, ext)}-${n}${ext}`;
    n++;
  }
  used.add(candidate);
  return candidate;
}

async function downloadImage(url, destPath, token) {
  const attempt = async (withAuth) => {
    const res = await fetch(url, withAuth ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(destPath, buf);
    return buf.length;
  };
  try {
    return await attempt(false);
  } catch {
    return await attempt(true); // retry with auth header
  }
}

async function main() {
  await loadEnvLocal();

  const appId = process.env.VITE_BASE44_APP_ID;
  const appBaseUrl = process.env.VITE_BASE44_APP_BASE_URL;
  const token = process.env.BASE44_TOKEN;

  const missing = [];
  if (!appId) missing.push('VITE_BASE44_APP_ID');
  if (!appBaseUrl) missing.push('VITE_BASE44_APP_BASE_URL');
  if (!token) missing.push('BASE44_TOKEN');
  if (missing.length) {
    console.error(`\n✖ Missing config: ${missing.join(', ')}`);
    console.error('  APP_ID / APP_BASE_URL come from .env.local; BASE44_TOKEN you provide.');
    console.error("  Get the token: log in to the app, DevTools console ->");
    console.error("    localStorage.getItem('base44_access_token')");
    console.error('  Then: BASE44_TOKEN=<token> npm run export:base44\n');
    process.exit(1);
  }

  // serverUrl = the app backend so the Node client calls it directly (no dev proxy here).
  const base44 = createClient({
    appId,
    token,
    serverUrl: appBaseUrl,
    appBaseUrl,
    requiresAuth: false,
  });

  console.log(`→ Backend: ${appBaseUrl}`);
  console.log('→ Fetching all projects…');

  let records;
  try {
    records = await base44.entities.Project.list('-updated_date', 100000);
  } catch (err) {
    console.error('\n✖ Failed to list projects. Is the token valid / not expired?');
    console.error(`  ${err?.message || err}\n`);
    process.exit(1);
  }
  console.log(`  ${records.length} project(s) found.`);

  await mkdir(IMAGES_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, 'projects.json'), JSON.stringify(records, null, 2), 'utf8');

  // Download every image once, build url -> local path map.
  const allUrls = new Set();
  for (const r of records) collectImageUrls(r).forEach(u => allUrls.add(u));
  console.log(`→ Downloading ${allUrls.size} image(s)…`);

  const used = new Set();
  const urlToLocal = {};
  const failures = [];
  let i = 0;
  for (const url of allUrls) {
    i++;
    const fname = localNameFor(url, i, used);
    const dest = join(IMAGES_DIR, fname);
    try {
      const bytes = await downloadImage(url, dest, token);
      urlToLocal[url] = `images/${fname}`;
      console.log(`  [${i}/${allUrls.size}] ${fname} (${bytes} bytes)`);
    } catch (err) {
      failures.push({ url, error: err?.message || String(err) });
      console.warn(`  [${i}/${allUrls.size}] FAILED ${url} — ${err?.message || err}`);
    }
  }

  // Rewrite a copy of the records with local image paths.
  const rewrite = (obj) => {
    if (Array.isArray(obj)) return obj.map(rewrite);
    if (obj && typeof obj === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string' && urlToLocal[v]) out[k] = urlToLocal[v];
        else out[k] = rewrite(v);
      }
      return out;
    }
    return obj;
  };
  const localRecords = rewrite(records);
  await writeFile(join(OUT_DIR, 'projects.local.json'), JSON.stringify(localRecords, null, 2), 'utf8');

  const manifest = {
    exportedAt: new Date().toISOString(),
    backend: appBaseUrl,
    appId,
    projectCount: records.length,
    imageCount: allUrls.size,
    downloaded: Object.keys(urlToLocal).length,
    failedCount: failures.length,
    urlToLocal,
    failures,
  };
  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n✓ Export complete.');
  console.log(`  Projects: ${records.length}  |  Images downloaded: ${Object.keys(urlToLocal).length}/${allUrls.size}`);
  if (failures.length) console.log(`  ⚠ ${failures.length} image(s) failed — see base44-export/manifest.json`);
  console.log(`  Output: ${OUT_DIR}`);
  console.log('  Note: this folder is gitignored (it holds user data) — keep it as a local backup.\n');
}

main().catch((err) => {
  console.error('\n✖ Unexpected error:', err?.stack || err);
  process.exit(1);
});
