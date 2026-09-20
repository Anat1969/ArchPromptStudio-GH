#!/usr/bin/env node
/**
 * Import the Base44 export (from scripts/export-base44.mjs) into the live
 * Netlify backend: uploads every image to /api/upload and re-creates every
 * project via /api/projects, rewriting image URLs to the new ones.
 *
 * It talks to the PUBLIC deployed API, so it needs NO Netlify credentials.
 * It is read-only against Base44 (uses the local export folder only).
 *
 * Prereqs: run `npm run export:base44` first (creates ./base44-export/).
 *
 * Usage:
 *   npm run import:netlify
 *   IMPORT_TARGET=https://archpromptstudio.netlify.app npm run import:netlify
 *   IMPORT_FORCE=1 npm run import:netlify   # allow importing even if store not empty
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EXPORT_DIR = process.env.EXPORT_DIR || join(ROOT, 'base44-export');
const TARGET = (process.env.IMPORT_TARGET || 'https://archpromptstudio.netlify.app').replace(/\/$/, '');

function contentTypeFor(name, buf) {
  const ext = extname(name).toLowerCase();
  const byExt = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif',
  }[ext];
  if (byExt) return byExt;
  // Sniff magic bytes when the extension is unknown (export saved some as .img)
  const b = buf;
  if (b[0] === 0x89 && b[1] === 0x50) return 'image/png';
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif';
  if (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57 && b[9] === 0x45) return 'image/webp';
  const head = b.slice(0, 64).toString('utf8').trim().toLowerCase();
  if (head.startsWith('<svg') || head.startsWith('<?xml')) return 'image/svg+xml';
  return 'application/octet-stream';
}

function deepRewrite(obj, map) {
  if (Array.isArray(obj)) return obj.map((v) => deepRewrite(v, map));
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = deepRewrite(v, map);
    return out;
  }
  if (typeof obj === 'string' && map[obj]) return map[obj];
  return obj;
}

async function main() {
  if (!existsSync(EXPORT_DIR)) {
    console.error(`\n✖ Export folder not found: ${EXPORT_DIR}`);
    console.error('  Run `npm run export:base44` first.\n');
    process.exit(1);
  }
  const manifest = JSON.parse(await readFile(join(EXPORT_DIR, 'manifest.json'), 'utf8'));
  const projects = JSON.parse(await readFile(join(EXPORT_DIR, 'projects.json'), 'utf8'));

  console.log(`→ Target: ${TARGET}`);
  console.log(`→ Export: ${projects.length} project(s), ${Object.keys(manifest.urlToLocal || {}).length} image(s)`);

  // Guard: don't double-import into a non-empty store unless forced.
  try {
    const existing = await (await fetch(`${TARGET}/api/projects`)).json();
    if (Array.isArray(existing) && existing.length > 0 && process.env.IMPORT_FORCE !== '1') {
      console.error(`\n✖ Target already has ${existing.length} project(s). Re-running would duplicate them.`);
      console.error('  Set IMPORT_FORCE=1 to import anyway.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error(`\n✖ Could not reach ${TARGET}/api/projects — is the site deployed? (${err?.message || err})\n`);
    process.exit(1);
  }

  // 1) Upload images, build oldUrl -> newUrl map.
  const oldToNew = {};
  const entries = Object.entries(manifest.urlToLocal || {});
  let i = 0;
  for (const [oldUrl, localRel] of entries) {
    i++;
    try {
      const buf = await readFile(join(EXPORT_DIR, localRel));
      const ct = contentTypeFor(localRel, buf);
      const res = await fetch(`${TARGET}/api/upload`, { method: 'POST', headers: { 'content-type': ct }, body: buf });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { file_url } = await res.json();
      oldToNew[oldUrl] = file_url;
      console.log(`  [img ${i}/${entries.length}] ${localRel} -> ${file_url}`);
    } catch (err) {
      console.warn(`  [img ${i}/${entries.length}] FAILED ${localRel} — ${err?.message || err}`);
    }
  }

  // 2) Re-create projects with rewritten image URLs (let the server assign id/dates).
  let created = 0;
  for (const rec of projects) {
    const clean = { ...rec };
    delete clean.id;
    delete clean.created_date;
    delete clean.updated_date;
    const body = deepRewrite(clean, oldToNew);
    try {
      const res = await fetch(`${TARGET}/api/projects`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      created++;
      console.log(`  [project ${created}/${projects.length}] ${rec.name || rec.number || rec.id}`);
    } catch (err) {
      console.warn(`  [project] FAILED ${rec.name || rec.id} — ${err?.message || err}`);
    }
  }

  console.log(`\n✓ Import complete. Projects created: ${created}/${projects.length}, images: ${Object.keys(oldToNew).length}/${entries.length}`);
  console.log(`  Open: ${TARGET}\n`);
}

main().catch((err) => {
  console.error('\n✖ Unexpected error:', err?.stack || err);
  process.exit(1);
});
