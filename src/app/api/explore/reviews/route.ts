import { NextRequest, NextResponse } from 'next/server';
import { reviewDB } from '@/lib/explore-db';

/**
 * GET /api/explore/reviews?listingId=l_s1
 * Returns all published reviews for a listing
 */
export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get('listingId');
  if (!listingId) {
    return NextResponse.json({ success: false, error: 'listingId is required' }, { status: 400 });
  }

  const reviews   = reviewDB.getByListing(listingId);
  const avgRating = reviewDB.avgRating(listingId);

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   reviews.length ? Math.round(reviews.filter(r => r.rating === star).length / reviews.length * 100) : 0,
  }));

  return NextResponse.json({
    success: true,
    data: reviews,
    total: reviews.length,
    avg_rating: avgRating,
    distribution,
  });
}

/**
 * POST /api/explore/reviews
 * Submit a new review
 * Body: { userId, userName, userAvatar, listingId, rating, title, body }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 'demo', userName, userAvatar, listingId, rating, title, body: reviewBody } = body;

    if (!listingId || !rating || !title || !reviewBody) {
      return NextResponse.json({ success: false, error: 'listingId, rating, title, and body are required' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'rating must be between 1 and 5' }, { status: 400 });
    }
    if (title.length < 5) {
      return NextResponse.json({ success: false, error: 'title must be at least 5 characters' }, { status: 400 });
    }
    if (reviewBody.length < 20) {
      return NextResponse.json({ success: false, error: 'review body must be at least 20 characters' }, { status: 400 });
    }

    const review = reviewDB.create({
      userId, listingId, rating,
      userName:   userName ?? 'Anonymous Traveler',
      userAvatar: userAvatar ?? 'https://randomuser.me/api/portraits/lego/1.jpg',
      title, body: reviewBody,
    });

    return NextResponse.json({ success: true, data: review, message: 'Review submitted successfully!' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

/**
 * PATCH /api/explore/reviews
 * Mark a review as helpful
 * Body: { reviewId }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { reviewId } = await req.json();
    if (!reviewId) return NextResponse.json({ success: false, error: 'reviewId is required' }, { status: 400 });
    const review = reviewDB.markHelpful(reviewId);
    if (!review) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: review });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
