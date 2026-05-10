import { NextRequest, NextResponse } from 'next/server';
import { bookingDB, bookingMetaDB, splitDB, couponDB } from '@/lib/explore-db';
import { listings, guides } from '@/lib/explore-local-data';

const allListings = [...listings, ...guides] as any[];

/** GET /api/explore/invoice?bookingId=bk_xxx
 *  Returns full invoice data for a booking
 */
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get('bookingId');
  if (!bookingId) return NextResponse.json({ success: false, error: 'bookingId required' }, { status: 400 });

  const booking = bookingDB.getById(bookingId);
  if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });

  const meta  = bookingMetaDB.get(bookingId);
  const split = splitDB.get(bookingId);
  const listing = allListings.find(l => l.id === booking.listingId);

  return NextResponse.json({
    success: true,
    data: {
      booking,
      listing: listing ? { title: listing.title, category: listing.category, location: listing.location, state: listing.state, image: listing.images?.[0] } : null,
      meta,
      split,
      invoice_number: `INV-${bookingId.slice(-8).toUpperCase()}`,
      generated_at: new Date().toISOString(),
    },
  });
}

/** POST /api/explore/invoice — generate invoice before payment
 *  Body: { listingId, date, travelers, couponCode, paymentMethod, note, userId }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, date, travelers = ['You'], couponCode, paymentMethod = 'upi', note = '', rewardsDiscount = 0 } = body;
    const userId = body.userId ?? 'demo';

    if (!listingId || !date) return NextResponse.json({ success: false, error: 'listingId and date required' }, { status: 400 });

    const listing = allListings.find(l => l.id === listingId);
    if (!listing) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });

    const originalPrice = listing.price;
    let totalDiscount   = rewardsDiscount;
    let couponDiscount  = 0;
    let couponMsg       = '';
    let couponValid     = false;

    // Validate coupon
    if (couponCode) {
      const couponResult = couponDB.validate(couponCode, userId, originalPrice);
      if (couponResult.valid) {
        couponDiscount = couponResult.discount_pct;
        totalDiscount  = Math.min(totalDiscount + couponDiscount, 50);
        couponMsg      = couponResult.message;
        couponValid    = true;
      } else {
        couponMsg = couponResult.message;
      }
    }

    const discountAmount = Math.round(originalPrice * totalDiscount / 100);
    const finalPrice     = originalPrice - discountAmount;
    const splitCount     = travelers.length || 1;
    const perPerson      = Math.ceil(finalPrice / splitCount);

    // Suggest FIRST5 if first booking and no coupon applied
    const userState = couponDB.getUserState(userId);
    const suggestion = userState.is_first_booking && !couponCode
      ? 'Apply FIRST5 to save 5% on your first booking! 🎁'
      : null;

    return NextResponse.json({
      success: true,
      data: {
        listing: { id: listing.id, title: listing.title, category: listing.category, location: listing.location, state: listing.state, image: listing.images?.[0], pricing_type: listing.pricing_type },
        pricing: {
          original_price:   originalPrice,
          rewards_discount: rewardsDiscount,
          coupon_discount:  couponDiscount,
          total_discount:   totalDiscount,
          discount_amount:  discountAmount,
          final_price:      finalPrice,
        },
        split: { count: splitCount, per_person: perPerson, travelers },
        coupon: { code: couponCode ?? null, valid: couponValid, message: couponMsg },
        payment_method: paymentMethod,
        date, note,
        suggestion,
        invoice_number: `DRAFT-${Date.now().toString(36).toUpperCase()}`,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }
}
