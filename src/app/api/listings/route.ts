import { NextRequest, NextResponse } from 'next/server';
import { listings, guides, getAIRecommendations } from '@/lib/explore-local-data';
import { reviewDB, wishlistDB, searchDB } from '@/lib/explore-db';
import type { TripPreferences } from '@/lib/explore-local-data';

const allListings = [...listings, ...guides] as any[];

/**
 * GET /api/listings
 * Query params: category, state, budget, sort, userId, search
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const category = p.get('category');
  const state    = p.get('state');
  const budget   = p.get('budget');
  const sort     = p.get('sort') ?? 'rating';   // rating | price_asc | price_desc | reviews
  const userId   = p.get('userId') ?? 'demo';
  const search   = p.get('search');
  const tags     = p.get('tags');               // comma-separated

  let result = [...allListings];

  // Filters
  if (category) result = result.filter(l => l.category === category);
  if (state)    result = result.filter(l => l.state.toLowerCase().includes(state.toLowerCase()));
  if (search)   result = result.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.location.toLowerCase().includes(search.toLowerCase()) ||
    l.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );
  if (tags) {
    const tagList = tags.split(',').map(t => t.trim().toLowerCase());
    result = result.filter(l => l.tags.some((t: string) => tagList.includes(t.toLowerCase())));
  }
  if (budget === 'low')    result = result.filter(l => l.price <= 1000);
  if (budget === 'medium') result = result.filter(l => l.price > 1000 && l.price <= 3000);
  if (budget === 'high')   result = result.filter(l => l.price > 3000);

  // Sort
  if (sort === 'price_asc')  result.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  if (sort === 'reviews')    result.sort((a, b) => b.reviews - a.reviews);
  if (sort === 'rating')     result.sort((a, b) => b.rating - a.rating);

  // Log search
  if (search) searchDB.log(search, category, result.length);

  // Enrich with live review count + wishlist status
  const wishlist = wishlistDB.getByUser(userId);
  const enriched = result.map(l => ({
    ...l,
    live_rating:   reviewDB.avgRating(l.id) || l.rating,
    live_reviews:  reviewDB.getByListing(l.id).length + l.reviews,
    is_wishlisted: wishlist.includes(l.id),
  }));

  return NextResponse.json({
    success: true,
    data: enriched,
    total: enriched.length,
    trending_searches: searchDB.trending(5),
  });
}

/**
 * POST /api/listings
 * Create a new listing (partner registration)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ['title', 'category', 'description', 'price', 'pricing_type', 'location', 'state'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 });
      }
    }
    if (body.price <= 0) {
      return NextResponse.json({ success: false, error: 'Price must be greater than 0' }, { status: 400 });
    }

    const newListing = {
      ...body,
      id:        `l_${Date.now()}`,
      rating:    0,
      reviews:   0,
      available: true,
      images:    body.images ?? [],
      tags:      body.tags ?? [],
      partner_id: body.partner_id ?? `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: newListing, message: 'Listing created successfully' }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
