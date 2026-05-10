import { NextRequest, NextResponse } from 'next/server';
import { offbeatLocations, listings, guides } from '@/lib/explore-local-data';

/** GET /api/offbeat-locations?id=ob1 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (id) {
    const loc = offbeatLocations.find(o => o.id === id);
    if (!loc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    // Attach nearby listings
    const all = [...listings, ...guides] as any[];
    const nearby = loc.nearby_listing_ids.map(lid => all.find(l => l.id === lid)).filter(Boolean);
    return NextResponse.json({ success: true, data: { ...loc, nearby_listings: nearby } });
  }

  return NextResponse.json({ success: true, data: offbeatLocations, total: offbeatLocations.length });
}
