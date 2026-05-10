import { NextRequest, NextResponse } from 'next/server';
import { couponDB } from '@/lib/explore-db';

/** GET /api/explore/coupon — list all active coupons */
export async function GET() {
  return NextResponse.json({ success: true, data: couponDB.getAll() });
}

/** POST /api/explore/coupon — validate a coupon
 *  Body: { code, userId, amount }
 */
export async function POST(req: NextRequest) {
  try {
    const { code, userId = 'demo', amount = 0 } = await req.json();
    if (!code) return NextResponse.json({ success: false, error: 'Coupon code required' }, { status: 400 });
    const result = couponDB.validate(code, userId, amount);
    return NextResponse.json({ success: result.valid, ...result });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }
}
