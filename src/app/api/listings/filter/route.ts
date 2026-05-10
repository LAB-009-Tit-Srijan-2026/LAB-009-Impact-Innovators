import { NextRequest, NextResponse } from 'next/server';
import { getAIRecommendations } from '@/lib/explore-local-data';
import { reviewDB } from '@/lib/explore-db';
import type { TripPreferences } from '@/lib/explore-local-data';

/**
 * GET /api/listings/filter
 * AI-powered recommendations based on trip preferences
 * Query: budget, travel_type, group_size, destination
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const prefs: TripPreferences = {
    budget:      (p.get('budget') as any) ?? 'medium',
    group_size:  Number(p.get('group_size') ?? 2),
    travel_type: p.get('travel_type') ?? 'Family Trip',
    destination: p.get('destination') ?? undefined,
  };

  // Validate budget
  if (!['low', 'medium', 'high'].includes(prefs.budget)) {
    return NextResponse.json({ success: false, error: 'budget must be low, medium, or high' }, { status: 400 });
  }

  const recommendations = getAIRecommendations(prefs);

  // Enrich with live ratings
  const enriched = recommendations.map(rec => ({
    ...rec,
    item: {
      ...rec.item,
      live_rating: reviewDB.avgRating(rec.item.id) || rec.item.rating,
    },
  }));

  return NextResponse.json({
    success: true,
    data: enriched,
    meta: {
      budget_level: prefs.budget,
      travel_type:  prefs.travel_type,
      group_size:   prefs.group_size,
      destination:  prefs.destination ?? 'any',
      generated_at: new Date().toISOString(),
    },
  });
}
