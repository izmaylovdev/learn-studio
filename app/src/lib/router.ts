import { useEffect, useState } from 'react';

export type Route =
  | { name: 'dashboard' }
  | { name: 'graph' }
  | { name: 'concept'; id: string }
  | { name: 'track'; id: string };

export function parse(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').split('?')[0];
  const [head, id] = path.split('/');
  if (head === 'c' && id) return { name: 'concept', id: decodeURIComponent(id) };
  if (head === 't' && id) return { name: 'track', id: decodeURIComponent(id) };
  if (head === 'graph') return { name: 'graph' };
  return { name: 'dashboard' };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash));
  useEffect(() => {
    const on = () => { setRoute(parse(location.hash)); window.scrollTo(0, 0); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const go = (href: string) => { location.hash = href; };
