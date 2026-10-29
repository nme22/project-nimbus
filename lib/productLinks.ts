import type { Store } from '@/types/project';

export interface ParsedProductLink {
  store: Store;
  name: string | null;
  productId: string | null;
  url: string;
}

/**
 * Pull what we can out of a pasted product URL so "paste a link" fills in the item.
 *   Home Depot: https://www.homedepot.com/p/<Slug-Name>/<itemId>
 *   Lowe's:     https://www.lowes.com/pd/<Slug-Name>/<itemId>
 */
export function parseProductLink(input: string): ParsedProductLink | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const host = url.hostname.replace(/^www\./, '');
  const segments = url.pathname.split('/').filter(Boolean);
  const store: Store = host.endsWith('homedepot.com') ? 'home_depot' : host.endsWith('lowes.com') ? 'lowes' : 'other';
  const marker = store === 'home_depot' ? 'p' : store === 'lowes' ? 'pd' : null;
  const at = marker ? segments.indexOf(marker) : -1;

  let name: string | null = null;
  let productId: string | null = null;
  if (at >= 0) {
    const slug = segments[at + 1];
    const id = segments[at + 2];
    if (slug && !/^\d+$/.test(slug)) name = decodeURIComponent(slug).replace(/-/g, ' ');
    if (id && /^\d+$/.test(id)) productId = id;
    else if (slug && /^\d+$/.test(slug)) productId = slug;
  }

  return { store, name, productId, url: url.toString() };
}
