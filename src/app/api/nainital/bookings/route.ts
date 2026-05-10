import { NextRequest, NextResponse } from 'next/server';
import { bookingsDB } from '@/lib/db';

const DEFAULT_USER = 'demo';

/** GET /api/nainital/bookings?userId=xxx
 *  Returns all bookings for a user.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') ?? DEFAULT_USER;
  const bookings = bookingsDB.listByUser(userId);
  return NextResponse.json({ success: true, data: bookings });
}

/** POST /api/nainital/bookings
 *  Body: {
 *    userId?:    string
 *    type:       'vehicle' | 'stay'
 *    itemId:     string
 *    itemName:   string
 *    pricePerUnit: number
 *    days?:      number   (for vehicles)
 *    nights?:    number   (for stays)
 *  }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, itemId, itemName, pricePerUnit } = body;
    const userId: string = body.userId ?? DEFAULT_USER;

    if (!type || !itemId || !itemName || pricePerUnit == null) {
      return NextResponse.json(
        { success: false, error: 'type, itemId, itemName, pricePerUnit are required' },
        { status: 400 }
      );
    }
    if (!['vehicle', 'stay'].includes(type)) {
      return NextResponse.json({ success: false, error: 'type must be vehicle or stay' }, { status: 400 });
    }

    const booking = bookingsDB.create({
      userId,
      destination: 'nainital',
      type,
      itemId,
      itemName,
      pricePerUnit,
      days:    body.days    ?? (type === 'vehicle' ? 1 : undefined),
      nights:  body.nights  ?? (type === 'stay'    ? 1 : undefined),
      status: 'confirmed',
    });

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

/** DELETE /api/nainital/bookings?bookingId=xxx
 *  Cancels a booking.
 */
export async function DELETE(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get('bookingId');
  if (!bookingId) {
    return NextResponse.json({ success: false, error: 'bookingId is required' }, { status: 400 });
  }
  const booking = bookingsDB.cancel(bookingId);
  if (!booking) {
    return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: booking });
}
