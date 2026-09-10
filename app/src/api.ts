import type { Concept, Graph, Track } from './types';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(detail.error ?? `request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const getGraph = () => req<Graph>('/api/graph');
export const getConcept = (id: string) => req<Concept>(`/api/concept/${encodeURIComponent(id)}`);
export const getTrack = (id: string) => req<Track>(`/api/track/${encodeURIComponent(id)}`);

export const postProgress = (id: string, body: { grade?: number; status?: string; notes?: string }) =>
  req<{ state: Concept['state'] }>(`/api/progress/${encodeURIComponent(id)}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const toggleTrack = (id: string) =>
  req<unknown>(`/api/track-toggle/${encodeURIComponent(id)}`, { method: 'POST' });
