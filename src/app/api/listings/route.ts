import { NextRequest, NextResponse } from 'next/server';
import { listings, guides } from '@/lib/explore-local-data';

/** GET /api/listings?category=guide&state=Rajasthan&budget=low */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get('category');
  const state    = searchParams.get('state');
  const budget   = searchParams.get('budget'); // low|medium|high

  let all = [...listings, ...guides] as any[];

  if (category) all = all.filter(l => l.category === category);
  if (state)    all = all.filter(l => l.state.toLowerCase().includes(state.toLowerCase()));
  if (budget === 'low')    all = all.filter(l => l.price <= 1000);
  if (budget === 'medium') all = all.filter(l => l.price > 1000 && l.price <= 3000);
  if (budget === 'high')   all = all.filter(l => l.price > 3000);

  return NextResponse.json({ success: true, data: all, total: all.length });
}

/** POST /api/listings/create — add new listing */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ['title', 'category', 'description', 'price', 'pricing_type', 'location'];
    for (const field of required) {
      if (!body[field]) return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 });
    }
    // In production: save to DB. Here we return the mock created object.
    const newListing = { ...body, id: `l_${Date.now()}`, rating: 0, reviews: 0, available: true };
    return NextResponse.json({ success: true, data: newListing }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }
}
