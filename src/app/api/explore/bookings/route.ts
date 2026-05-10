import { NextRequest, NextResponse } from 'next/server';
import { bookingDB, availabilityDB } from '@/lib/explore-db';
import { listings, guides } from '@/lib/explore-local-data';

const allListings = [...listings, ...guides] as any[];

/**
 * GET /api/explore/bookings?userId=demo
 * Returns all bookings for a user with stats
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') ?? 'demo';
  const bookings = bookingDB.listByUser(userId);
  const stats    = bookingDB.stats(userId);

  return NextResponse.json({ success: true, data: bookings, stats, total: bookings.length });
}

/**
 * POST /api/explore/bookings
 * Create a new booking with availability check + discount calculation
 * Body: { userId, listingId, date, note, paymentMethod, discountPct? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, date, note = '', paymentMethod = 'upi', discountPct = 0 } = body;
    const userId = body.userId ?? 'demo';

    if (!listingId || !date) {
      return NextResponse.json({ success: false, error: 'listingId and date are required' }, { status: 400 });
    }

    // Find listing
    const listing = allListings.find(l => l.id === listingId);
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }
    if (!listing.available) {
      return NextResponse.json({ success: false, error: 'This listing is currently unavailable' }, { status: 409 });
    }

    // Availability check
    const avail = availabilityDB.check(listingId, date);
    if (!avail.available) {
      return NextResponse.json({
        success: false,
        error: `No slots available on ${date}`,
        next_available: avail.next_available,
      }, { status: 409 });
    }

    // Validate date (not in past)
    if (new Date(date) < new Date(new Date().toDateString())) {
      return NextResponse.json({ success: false, error: 'Booking date cannot be in the past' }, { status: 400 });
    }

    // Validate payment method
    const validPayments = ['upi', 'card', 'cash', 'wallet'];
    if (!validPayments.includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: `paymentMethod must be one of: ${validPayments.join(', ')}` }, { status: 400 });
    }

    // Price calculation
    const clampedDiscount = Math.min(Math.max(discountPct, 0), 50); // max 50% discount
    const originalPrice   = listing.price;
    const finalPrice      = originalPrice >= 5000
      ? Math.round(originalPrice * (1 - clampedDiscount / 100))
      : originalPrice; // discount only on ₹5000+

    const partnerName = listing.category === 'guide'
      ? listing.name
      : `${listing.title.split('—')[0].trim()} Host`;

    const booking = bookingDB.create({
      userId, listingId,
      listingTitle:    listing.title,
      listingCategory: listing.category,
      partnerName,
      date, note,
      originalPrice,
      discountPct: finalPrice < originalPrice ? clampedDiscount : 0,
      finalPrice,
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: `Booking confirmed! Ref: ${booking.id}`,
      slots_remaining: avail.slots_left - 1,
    }, { status: 201 });

  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

/**
 * PATCH /api/explore/bookings
 * Cancel or update booking status
 * Body: { bookingId, userId, action: 'cancel' | 'complete' }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { bookingId, userId = 'demo', action } = await req.json();
    if (!bookingId || !action) {
      return NextResponse.json({ success: false, error: 'bookingId and action are required' }, { status: 400 });
    }

    if (action === 'cancel') {
      const result = bookingDB.cancel(bookingId, userId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: result.booking, message: 'Booking cancelled. Refund will be processed in 5–7 business days.' });
    }

    if (action === 'complete') {
      const booking = bookingDB.updateStatus(bookingId, 'completed');
      if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: booking });
    }

    return NextResponse.json({ success: false, error: 'action must be cancel or complete' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
