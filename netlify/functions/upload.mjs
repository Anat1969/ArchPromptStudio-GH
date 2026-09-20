// Image upload -> Netlify Blobs (store: "images").
// Client POSTs the raw file bytes with the file's Content-Type.
// Returns { file_url: "/api/images?key=<key>" } to store on the record.
import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  try {
    const contentType = req.headers.get('content-type') || 'application/octet-stream';
    const ext = (contentType.split('/')[1] || 'img').split(';')[0].replace(/[^a-z0-9]/gi, '') || 'img';
    const key = `${(globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`)}.${ext}`;

    const buf = await req.arrayBuffer();
    if (!buf || buf.byteLength === 0) return new Response('empty body', { status: 400 });

    const store = getStore('images');
    await store.set(key, buf, { metadata: { contentType } });

    return Response.json({ file_url: `/api/images?key=${encodeURIComponent(key)}` });
  } catch (err) {
    return new Response(`error: ${err?.message || err}`, { status: 500 });
  }
};
