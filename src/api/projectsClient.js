// Client for the Netlify-hosted backend (Functions + Blobs).
// Mirrors the shape the app used before (base44.entities.Project.*), so the
// data layer in lib/storage.js barely changes.

const BASE = '/api/projects';

async function request(method, { id, body } = {}) {
  const url = id ? `${BASE}?id=${encodeURIComponent(id)}` : BASE;
  const res = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${method} ${url} -> ${res.status} ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const projectsClient = {
  // sort/limit are accepted for API-compatibility but the server sorts (newest first).
  list: (_sort, _limit) => request('GET'),
  create: (data) => request('POST', { body: data }),
  update: (id, data) => request('PUT', { id, body: data }),
  delete: (id) => request('DELETE', { id }),
};

// Upload an image file; returns { file_url }.
export async function uploadImage(file) {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'content-type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`upload failed -> ${res.status} ${text}`);
  }
  return res.json();
}
