import { NextRequest, NextResponse } from 'next/server';
import { gourmetDB } from '@/lib/db';

const DEFAULT_USER = 'demo';

/** GET /api/nainital/gourmet?userId=xxx
 *  Returns all gourmet orders/reservations for a user.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') ?? DEFAULT_USER;
  const orders = gourmetDB.listByUser(userId);
  return NextResponse.json({ success: true, data: orders });
}

/** POST /api/nainital/gourmet
 *  Body: {
 *    userId?:          string
 *    restaurantId:     string
 *    restaurantName:   string
 *    action:           'order_delivery' | 'book_table' | 'track_order' | 'view_menu'
 *  }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, restaurantName, action } = body;
    const userId: string = body.userId ?? DEFAULT_USER;

    if (!restaurantId || !restaurantName || !action) {
      return NextResponse.json(
        { success: false, error: 'restaurantId, restaurantName, action are required' },
        { status: 400 }
      );
    }

    const validActions = ['order_delivery', 'book_table', 'track_order', 'view_menu'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `action must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Determine initial status based on action
    const statusMap: Record<string, 'placed' | 'confirmed'> = {
      order_delivery: 'placed',
      book_table:     'confirmed',
      track_order:    'placed',
      view_menu:      'confirmed',
    };

    const order = gourmetDB.create({
      userId,
      restaurantId,
      restaurantName,
      action,
      status: statusMap[action],
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
