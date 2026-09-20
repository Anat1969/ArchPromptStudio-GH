// Projects API backed by Netlify Blobs (store: "projects").
// One blob per project, keyed by id; value is the full DB-shaped record.
// Routes (via netlify.toml redirect /api/* -> /.netlify/functions/:splat):
//   GET    /api/projects          list all (newest first)
//   POST   /api/projects          create (body = record)
//   PUT    /api/projects?id=<id>  update (merge body)
//   DELETE /api/projects?id=<id>  delete
import { getStore } from '@netlify/blobs';

const store = () => getStore('projects');

export default async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  try {
    if (req.method === 'GET') {
      const { blobs } = await store().list();
      const records = await Promise.all(
        blobs.map((b) => store().get(b.key, { type: 'json' }))
      );
      const clean = records.filter(Boolean);
      clean.sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0));
      return Response.json(clean);
    }

    if (req.method === 'POST') {
      const data = await req.json();
      const now = new Date().toISOString();
      const newId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
      const record = { ...data, id: newId, created_date: now, updated_date: now };
      await store().setJSON(newId, record);
      return Response.json(record);
    }

    if (req.method === 'PUT') {
      if (!id) return new Response('id required', { status: 400 });
      const existing = await store().get(id, { type: 'json' });
      if (!existing) return new Response('not found', { status: 404 });
      const data = await req.json();
      const record = { ...existing, ...data, id, updated_date: new Date().toISOString() };
      await store().setJSON(id, record);
      return Response.json(record);
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response('id required', { status: 400 });
      await store().delete(id);
      return Response.json({ ok: true });
    }

    return new Response('method not allowed', { status: 405 });
  } catch (err) {
    return new Response(`error: ${err?.message || err}`, { status: 500 });
  }
};
