import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { searchCatalog } from '@/lib/catalog';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const store = request.nextUrl.searchParams.get('store');

  if (store !== 'home_depot' && store !== 'lowes') {
    return NextResponse.json({ error: 'store must be home_depot or lowes' }, { status: 400 });
  }
  if (query.length < 2 || query.length > 120) {
    return NextResponse.json({ error: 'q must be 2-120 characters' }, { status: 400 });
  }

  return NextResponse.json(await searchCatalog(store, query));
}
