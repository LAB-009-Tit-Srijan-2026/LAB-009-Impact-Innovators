import { NextRequest, NextResponse } from 'next/server';
import { checklistDB } from '@/lib/db';
import type { CheckState } from '@/lib/db';

const DEFAULT_USER = 'demo';
const DESTINATION  = 'nainital';

/** GET /api/nainital/checklist
 *  Returns the full stateMap for the user.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') ?? DEFAULT_USER;
  const record  = checklistDB.get(userId, DESTINATION);

  if (!record) {
    // First visit — seed defaults
    const fresh = checklistDB.reset(userId, DESTINATION);
    return NextResponse.json({ success: true, data: fresh });
  }
  return NextResponse.json({ success: true, data: record });
}

/** POST /api/nainital/checklist
 *  Body: { userId?: string; stateMap: Record<string, CheckState> }
 *  Replaces the entire stateMap (full save).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId: string   = body.userId ?? DEFAULT_USER;
    const stateMap: Record<string, CheckState> = body.stateMap;

    if (!stateMap || typeof stateMap !== 'object') {
      return NextResponse.json({ success: false, error: 'stateMap is required' }, { status: 400 });
    }

    const record = checklistDB.upsert(userId, DESTINATION, stateMap);
    return NextResponse.json({ success: true, data: record });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

/** PATCH /api/nainital/checklist
 *  Body: { userId?: string; itemId: string; state: CheckState }
 *  Updates a single checklist item (optimistic-update friendly).
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const userId: string  = body.userId ?? DEFAULT_USER;
    const itemId: string  = body.itemId;
    const state: CheckState = body.state;

    if (!itemId || !state) {
      return NextResponse.json({ success: false, error: 'itemId and state are required' }, { status: 400 });
    }
    if (!['complete', 'incomplete', 'pending'].includes(state)) {
      return NextResponse.json({ success: false, error: 'Invalid state value' }, { status: 400 });
    }

    const record = checklistDB.patchItem(userId, DESTINATION, itemId, state);
    if (!record) {
      // No record yet — seed then patch
      checklistDB.reset(userId, DESTINATION);
      const patched = checklistDB.patchItem(userId, DESTINATION, itemId, state);
      return NextResponse.json({ success: true, data: patched });
    }
    return NextResponse.json({ success: true, data: record });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

/** DELETE /api/nainital/checklist?userId=xxx
 *  Resets checklist to defaults.
 */
export async function DELETE(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') ?? DEFAULT_USER;
  const record = checklistDB.reset(userId, DESTINATION);
  return NextResponse.json({ success: true, data: record });
}
