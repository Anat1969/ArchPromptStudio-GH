// Serve an image stored in Netlify Blobs (store: "images").
//   GET /api/images?key=<key>
import { getStore } from '@netlify/blobs';

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get('key');
  if (!key) return new Response('key required', { status: 400 });

  try {
    const store = getStore({ name: 'images', consistency: 'strong' });
    const blob = await store.get(key, { type: 'arrayBuffer' });
    if (!blob) return new Response('not found', { status: 404 });

    let contentType = 'application/octet-stream';
    try {
      const meta = await store.getMetadata(key);
      if (meta?.metadata?.contentType) contentType = meta.metadata.contentType;
    } catch { /* fall back to octet-stream */ }

    return new Response(blob, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return new Response(`error: ${err?.message || err}`, { status: 500 });
  }
};
