import { NextRequest, NextResponse } from 'next/server';
import { partnerDB, bookingDB } from '@/lib/explore-db';

/**
 * GET /api/explore/partners
 * Query: state, category, verified, listingId
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const listingId = p.get('listingId');

  // Get partner for a specific listing
  if (listingId) {
    const partner = partnerDB.getByListing(listingId);
    if (!partner) return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: partner });
  }

  const filters = {
    state:    p.get('state')    ?? undefined,
    category: p.get('category') ?? undefined,
    verified: p.get('verified') === 'true' ? true : p.get('verified') === 'false' ? false : undefined,
  };

  const partners = partnerDB.list(filters);
  return NextResponse.json({ success: true, data: partners, total: partners.length });
}
