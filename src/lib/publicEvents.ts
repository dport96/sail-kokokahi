import { prisma } from '@/lib/prisma';
import { getApplicationSettingsNoCache } from '@/lib/settings';

export type PublicEvent = {
  id: number;
  title: string;
  description: string;
  date: string; // MM/DD/YYYY as stored
  isoDate: string; // YYYY-MM-DD for sorting / client formatting
  time: string;
  location: string;
  hours: number;
  signupReq: boolean;
};

// Converts stored MM/DD/YYYY into YYYY-MM-DD (null if malformed)
const toIso = (value: string): string | null => {
  const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
};

// Returns events dated today (in the configured time zone) or later.
// Only whitelisted fields are returned: no PIN, QR data, or attendee info.
export async function getPublicUpcomingEvents(): Promise<PublicEvent[]> {
  const { TIME_ZONE } = await getApplicationSettingsNoCache();
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      time: true,
      location: true,
      hours: true,
      signupReq: true,
    },
  });

  return events
    .map((e) => ({ ...e, isoDate: toIso(e.date) }))
    .filter((e): e is typeof e & { isoDate: string } => e.isoDate !== null && e.isoDate >= today)
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate) || a.time.localeCompare(b.time))
    .map((e) => ({ ...e, date: e.date.trim() }));
}
