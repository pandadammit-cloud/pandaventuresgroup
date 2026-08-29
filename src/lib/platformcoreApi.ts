const BASE_URL = import.meta.env.VITE_PLATFORMCORE_API_URL;
const API_KEY  = import.meta.env.VITE_PLATFORMCORE_API_KEY;

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function listDockGuides(status?: string) {
  const qs = status ? `?status=${status}` : '';
  return apiFetch(`/guides/dock${qs}`);
}

export async function getGuide(guideTypeId: string, entityId: string) {
  return apiFetch(`/guides/${guideTypeId}/${entityId}`);
}
