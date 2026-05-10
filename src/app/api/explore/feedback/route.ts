import { NextRequest, NextResponse } from 'next/server';
import { feedbackDB, bookingDB } from '@/lib/explore-db';

/** GET /api/explore/feedback?listingId=l_s1 OR ?bookingId=bk_xxx */
export async function GET(req: NextRequest) {
  const listingId = req.nextUrl.searchParams.get('listingId');
  const bookingId = req.nextUrl.searchParams.get('bookingId');

  if (bookingId) {
    const fb = feedbackDB.getByBooking(bookingId);
    return NextResponse.json({ success: true, data: fb, submitted: !!fb });
  }
  if (listingId) {
    const items = feedbackDB.getByListing(listingId);
    const avg   = feedbackDB.avgByListing(listingId);
    return NextResponse.json({ success: true, data: items, avg, total: items.length });
  }
  return NextResponse.json({ success: false, error: 'listingId or bookingId required' }, { status: 400 });
}

/** POST /api/explore/feedback
 *  Body: { userId, bookingId, safety, budget, experience, accommodation, location, comment, would_recommend }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, safety_rating, budget_rating, experience_rating, accommodation_rating, location_rating, comment = '', would_recommend = true } = body;
    const userId = body.userId ?? 'demo';

    if (!bookingId) return NextResponse.json({ success: false, error: 'bookingId required' }, { status: 400 });

    // Validate ratings
    const ratings = [safety_rating, budget_rating, experience_rating, accommodation_rating, location_rating];
    if (ratings.some(r => !r || r < 1 || r > 5)) {
      return NextResponse.json({ success: false, error: 'All 5 ratings (1–5) are required' }, { status: 400 });
    }

    // Check booking exists
    const booking = bookingDB.getById(bookingId);
    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    if (booking.userId !== userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });

    // Prevent duplicate feedback
    if (feedbackDB.hasSubmitted(bookingId)) {
      return NextResponse.json({ success: false, error: 'Feedback already submitted for this booking' }, { status: 409 });
    }

    const feedback = feedbackDB.create({
      userId, bookingId,
      listingId:    booking.listingId,
      listingTitle: booking.listingTitle,
      safety_rating, budget_rating, experience_rating, accommodation_rating, location_rating,
      comment, would_recommend,
    });

    return NextResponse.json({ success: true, data: feedback, message: 'Feedback submit ho gaya! Shukriya 🙏' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }
}
