// Projects API backed by Netlify Blobs (store: "projects").
// All projects live in ONE index document (key "all") read with strong
// consistency, so a create/update/delete is visible immediately on the next
// read. (Blobs list() is only eventually consistent — unreliable right after a
// write.) Fine for this low-traffic, single-tenant, no-auth app.
// Routes (via netlify.toml redirect /api/* -> /.netlify/functions/:splat):
//   GET    /api/projects          list all (newest first)
//   POST   /api/projects          create (body = record)
//   PUT    /api/projects?id=<id>  update (merge body)
//   DELETE /api/projects?id=<id>  delete
import { getStore } from '@netlify/blobs';

const KEY = 'all';
const store = () => getStore({ name: 'projects', consistency: 'strong' });

async function readAll() {
  const arr = await store().get(KEY, { type: 'json' });
  return Array.isArray(arr) ? arr : [];
}
async function writeAll(arr) {
  await store().setJSON(KEY, arr);
}
const uuid = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  try {
    if (req.method === 'GET') {
      const all = await readAll();
      all.sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0));
      return Response.json(all);
    }

    if (req.method === 'POST') {
      const data = await req.json();
      const now = new Date().toISOString();
      const record = { ...data, id: uuid(), created_date: now, updated_date: now };
      const all = await readAll();
      all.push(record);
      await writeAll(all);
      return Response.json(record);
    }

    if (req.method === 'PUT') {
      if (!id) return new Response('id required', { status: 400 });
      const all = await readAll();
      const idx = all.findIndex((p) => p.id === id);
      if (idx === -1) return new Response('not found', { status: 404 });
      const data = await req.json();
      const record = { ...all[idx], ...data, id, updated_date: new Date().toISOString() };
      all[idx] = record;
      await writeAll(all);
      return Response.json(record);
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response('id required', { status: 400 });
      const all = await readAll();
      await writeAll(all.filter((p) => p.id !== id));
      return Response.json({ ok: true });
    }

    return new Response('method not allowed', { status: 405 });
  } catch (err) {
    return new Response(`error: ${err?.message || err}`, { status: 500 });
  }
};
