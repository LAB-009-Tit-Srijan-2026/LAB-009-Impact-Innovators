import { NextRequest, NextResponse } from 'next/server';
import { listings, guides, getAIRecommendations } from '@/lib/explore-local-data';
import type { TripPreferences } from '@/lib/explore-local-data';

/** GET /api/listings/filter?budget=low&travel_type=Adventure&group_size=2 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const prefs: TripPreferences = {
    budget:      (searchParams.get('budget') as any) ?? 'medium',
    group_size:  Number(searchParams.get('group_size') ?? 2),
    travel_type: searchParams.get('travel_type') ?? 'Family Trip',
    destination: searchParams.get('destination') ?? undefined,
  };
  const recommendations = getAIRecommendations(prefs);
  return NextResponse.json({ success: true, data: recommendations });
}
