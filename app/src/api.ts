import type { Concept, Graph, Track } from './types';
import type { Lang } from './lib/i18n';

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

export const getGraph = (lang: Lang) => req<Graph>(`/api/graph?lang=${lang}`);
export const getConcept = (id: string, lang: Lang) =>
  req<Concept>(`/api/concept/${encodeURIComponent(id)}?lang=${lang}`);
export const getTrack = (id: string, lang: Lang) =>
  req<Track>(`/api/track/${encodeURIComponent(id)}?lang=${lang}`);

export const postProgress = (id: string, body: { grade?: number; status?: string; notes?: string }) =>
  req<{ state: Concept['state'] }>(`/api/progress/${encodeURIComponent(id)}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const toggleTrack = (id: string) =>
  req<unknown>(`/api/track-toggle/${encodeURIComponent(id)}`, { method: 'POST' });
