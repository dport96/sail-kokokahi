import { getPublicUpcomingEvents } from '@/lib/publicEvents';

export const dynamic = 'force-dynamic';

const esc = (s: string) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Standalone HTML page (no site navbar/auth) meant to be placed in an <iframe>
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  let body: string;
  try {
    const events = await getPublicUpcomingEvents();
    body = events.length === 0
      ? '<p class="empty">No upcoming events right now. Please check back soon!</p>'
      : events.map((e) => `
      <article class="event">
        <div class="date">${esc(e.date)}${e.time ? ` &middot; ${esc(e.time)}` : ''}</div>
        <h2>${esc(e.title)}</h2>
        <div class="loc">${esc(e.location)}</div>
        <p>${esc(e.description)}</p>
        ${e.signupReq ? `<a class="btn" href="${esc(origin)}/auth/signin" target="_blank" rel="noopener">Members: sign up</a>` : ''}
      </article>`).join('');
  } catch (error) {
    console.error('Embed events page failed', error);
    body = '<p class="empty">Events are temporarily unavailable.</p>';
  }

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Upcoming Events</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;padding:12px;color:#1f2937;background:transparent}
  h1{font-size:1.25rem;margin:0 0 12px}
  .event{border:1px solid #d1d5db;border-left:4px solid #0d6efd;border-radius:6px;padding:12px 14px;margin-bottom:12px;background:#fff}
  .event h2{font-size:1.05rem;margin:2px 0 4px}
  .date{font-weight:600;color:#0d6efd;font-size:.9rem}
  .loc{font-size:.85rem;color:#6b7280;margin-bottom:6px}
  .event p{margin:0 0 8px;white-space:pre-line;font-size:.92rem}
  .btn{display:inline-block;font-size:.85rem;padding:4px 10px;border-radius:4px;background:#0d6efd;color:#fff;text-decoration:none}
  .empty{color:#6b7280}
</style></head>
<body><h1>Upcoming Events</h1>${body}</body></html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      // Allow embedding from any site
      'Content-Security-Policy': 'frame-ancestors *',
    },
  });
}
