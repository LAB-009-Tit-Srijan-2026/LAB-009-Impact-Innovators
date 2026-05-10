import { NextRequest, NextResponse } from 'next/server';
import { wishlistDB } from '@/lib/explore-db';

/**
 * GET /api/explore/wishlist?userId=demo
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') ?? 'demo';
  const ids = wishlistDB.getByUser(userId);
  return NextResponse.json({ success: true, data: ids, total: ids.length });
}

/**
 * POST /api/explore/wishlist
 * Toggle wishlist item
 * Body: { userId, listingId }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId = 'demo', listingId } = await req.json();
    if (!listingId) return NextResponse.json({ success: false, error: 'listingId is required' }, { status: 400 });
    const result = wishlistDB.toggle(userId, listingId);
    return NextResponse.json({
      success: true,
      data: result,
      message: result.added ? 'Added to wishlist' : 'Removed from wishlist',
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
