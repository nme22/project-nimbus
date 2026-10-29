import 'server-only';
import { storeSearchUrl } from '@/lib/format';
import type { CatalogProduct, CatalogSearchResponse } from '@/types/project';

// Neither Home Depot nor Lowe's has a public product API. Home Depot results come
// from SerpApi's `home_depot` engine (free tier: 250 searches/month) when
// SERPAPI_API_KEY is set. Lowe's has no affordable live provider, so it always
// falls back to a deep link the user can open, plus pasting product links.

type CatalogStore = CatalogProduct['store'];

// One day: prices don't move fast enough to justify burning the free quota.
const CACHE_SECONDS = 60 * 60 * 24;

interface SerpApiHomeDepotProduct {
  product_id?: string;
  title?: string;
  brand?: string;
  model_number?: string;
  price?: number;
  link?: string;
  thumbnails?: string[][];
  rating?: number;
  reviews?: number;
}

export async function searchCatalog(store: CatalogStore, query: string): Promise<CatalogSearchResponse> {
  const base = { store, query, searchUrl: storeSearchUrl(store, query) };
  const apiKey = process.env.SERPAPI_API_KEY;

  if (store !== 'home_depot' || !apiKey) {
    return { ...base, live: false, products: [] };
  }

  const params = new URLSearchParams({ engine: 'home_depot', q: query, api_key: apiKey, ps: '24' });
  const zip = process.env.CATALOG_DELIVERY_ZIP;
  if (zip) params.set('delivery_zip', zip);

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      next: { revalidate: CACHE_SECONDS },
    });
    if (!res.ok) throw new Error(`SerpApi responded ${res.status}`);
    const json = (await res.json()) as { products?: SerpApiHomeDepotProduct[]; error?: string };
    if (json.error && !json.products) throw new Error(json.error);
    return { ...base, live: true, products: (json.products ?? []).map(toHomeDepotProduct).filter(isProduct) };
  } catch (err) {
    console.error('Home Depot catalog search failed:', err);
    return { ...base, live: true, products: [], error: 'Home Depot search is unavailable right now.' };
  }
}

function toHomeDepotProduct(p: SerpApiHomeDepotProduct): CatalogProduct | null {
  if (!p.title || !p.link) return null;
  // SerpApi sometimes returns the apionline.homedepot.com host; send people to the real site.
  const url = p.link.replace('://apionline.homedepot.com', '://www.homedepot.com');
  // thumbnails is [[size65, size100, ..., size1000]]; pick a mid-size image.
  const sizes = p.thumbnails?.[0] ?? [];
  const thumbnail = sizes.find((s) => s.includes('_300')) ?? sizes[sizes.length - 1] ?? null;
  return {
    store: 'home_depot',
    productId: p.product_id ?? null,
    title: p.title,
    brand: p.brand ?? null,
    model: p.model_number ?? null,
    price: typeof p.price === 'number' ? p.price : null,
    url,
    thumbnail,
    rating: p.rating ?? null,
    reviews: p.reviews ?? null,
  };
}

function isProduct(p: CatalogProduct | null): p is CatalogProduct {
  return p !== null;
}
