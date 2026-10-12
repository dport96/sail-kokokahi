import { NextResponse } from 'next/server';
import { getPublicUpcomingEvents } from '@/lib/publicEvents';

export const dynamic = 'force-dynamic';

// Open CORS so any website can fetch this read-only feed
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const events = await getPublicUpcomingEvents();
    return NextResponse.json({ events }, { headers: corsHeaders });
  } catch (error) {
    console.error('Public events feed failed', error);
    return NextResponse.json({ events: [], error: 'Unavailable' }, { status: 500, headers: corsHeaders });
  }
}
