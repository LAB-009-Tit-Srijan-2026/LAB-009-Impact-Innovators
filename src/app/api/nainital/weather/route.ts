import { NextRequest, NextResponse } from 'next/server';

/** GET /api/nainital/weather?destination=nainital
 *  Proxies to the central /api/weather route.
 */
export async function GET(req: NextRequest) {
  const destination = req.nextUrl.searchParams.get('destination') ?? 'nainital';
  const baseUrl = req.nextUrl.origin;
  const res = await fetch(`${baseUrl}/api/weather?city=${encodeURIComponent(destination)}`, {
    next: { revalidate: 600 },
  });
  const json = await res.json();
  return NextResponse.json({ success: true, data: json.data });
}
