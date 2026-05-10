import { NextRequest, NextResponse } from 'next/server';

const MAX_DISCOUNT = 25;
const GOLDEN_KM    = 1000;

/** POST /api/rewards/update
 *  Body: { userId, distance, total_amount, destination, completed }
 *  Returns updated reward state
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { distance, total_amount, destination, completed,
            current_distance, current_trips, current_discount, current_tier } = body;

    if (distance == null || total_amount == null) {
      return NextResponse.json({ success: false, error: 'distance and total_amount required' }, { status: 400 });
    }

    const newDistance = (current_distance ?? 0) + distance;
    const newTrips    = (current_trips ?? 0) + 1;

    let newDiscount = current_discount ?? 0;
    let discountGained = 0;

    if (completed && distance >= 100) {
      discountGained = Math.min(5, MAX_DISCOUNT - newDiscount);
      newDiscount    = Math.min(newDiscount + 5, MAX_DISCOUNT);
    }

    let newTier = current_tier ?? 'Normal';
    if (newDistance >= GOLDEN_KM) {
      newTier     = 'Golden';
      newDiscount = Math.max(newDiscount, MAX_DISCOUNT);
    }

    const newPoints = Math.floor(distance * 2);

    return NextResponse.json({
      success: true,
      data: {
        total_distance_travelled: newDistance,
        total_trips:              newTrips,
        reward_points_earned:     newPoints,
        discount_percentage:      newDiscount,
        discount_gained:          discountGained,
        user_tier:                newTier,
        golden_unlocked:          newTier === 'Golden' && current_tier !== 'Golden',
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }
}

/** GET /api/rewards?userId=demo
 *  Returns current reward summary (mock — in prod: fetch from DB)
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      total_distance_travelled: 620,
      total_trips: 4,
      reward_points: 1240,
      discount_percentage: 10,
      user_tier: 'Normal',
      next_tier_km: 380,
      golden_threshold_km: 1000,
    },
  });
}
