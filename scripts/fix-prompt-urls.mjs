#!/usr/bin/env node
/**
 * One-time data fix: make stored Midjourney prompts use an ABSOLUTE image URL.
 *
 * Generated prompts start with the inspiration image URL (Midjourney image ref).
 * After the Netlify migration some stored prompts kept a RELATIVE "/api/images?..."
 * prefix, which Midjourney can't fetch. This rewrites any prompt starting with a
 * relative "/api/..." to the absolute site URL. Idempotent (skips already-absolute).
 *
 * Hits the public API — no credentials. Usage:
 *   npm run fix:prompts
 *   IMPORT_TARGET=https://archpromptstudio.netlify.app npm run fix:prompts
 */

const TARGET = (process.env.IMPORT_TARGET || 'https://archpromptstudio.netlify.app').replace(/\/$/, '');
const GROUPS = ['boards', 'rooms', 'building_types'];

function fixPrompt(prompt) {
  if (typeof prompt === 'string' && prompt.startsWith('/api/')) {
    return TARGET + prompt;
  }
  return prompt;
}

async function main() {
  const projects = await (await fetch(`${TARGET}/api/projects`)).json();
  let changed = 0;

  for (const p of projects) {
    let dirty = false;
    for (const g of GROUPS) {
      const group = p[g];
      if (!group || typeof group !== 'object') continue;
      for (const slot of Object.values(group)) {
        if (slot && typeof slot === 'object' && typeof slot.prompt === 'string') {
          const fixed = fixPrompt(slot.prompt);
          if (fixed !== slot.prompt) { slot.prompt = fixed; dirty = true; }
        }
      }
    }
    if (dirty) {
      const res = await fetch(`${TARGET}/api/projects?id=${encodeURIComponent(p.id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (!res.ok) { console.warn(`  FAILED #${p.number} — HTTP ${res.status}`); continue; }
      changed++;
      console.log(`  fixed prompts in #${p.number} ${p.name || ''}`);
    }
  }

  console.log(`\n✓ Done. Projects updated: ${changed}/${projects.length}`);
}

main().catch((e) => { console.error('✖', e?.stack || e); process.exit(1); });
