import { NextRequest, NextResponse } from 'next/server';
import { availabilityDB } from '@/lib/explore-db';

/**
 * GET /api/explore/availability?listingId=l_s1&date=2026-06-20
 */
export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get('listingId');
  const date      = req.nextUrl.searchParams.get('date');

  if (!listingId || !date) {
    return NextResponse.json({ success: false, error: 'listingId and date are required' }, { status: 400 });
  }

  const result = availabilityDB.check(listingId, date);
  return NextResponse.json({ success: true, data: result });
}
