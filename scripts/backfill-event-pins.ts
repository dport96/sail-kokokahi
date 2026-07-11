/* eslint-disable no-console */
import { prisma } from '../src/lib/prisma';
import { getApplicationSettingsNoCache } from '../src/lib/settings';
import { normalizeEventDate } from '../src/lib/date';
import { generateEventPin } from '../src/lib/eventPin';

type BackfillEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  pin: string | null;
};

const parseTimeToMinutes = (time: string): number | null => {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  return (hour * 60) + minute;
};

const getNowParts = (timeZone: string) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const map = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(map.get('year')),
    month: Number(map.get('month')),
    day: Number(map.get('day')),
    hour: Number(map.get('hour')),
    minute: Number(map.get('minute')),
  };
};

const isExpiredEvent = (event: BackfillEvent, timeZone: string): boolean => {
  const normalizedDate = normalizeEventDate(event.date);
  const eventMinutes = parseTimeToMinutes(event.time);
  if (!normalizedDate || eventMinutes == null) {
    return true;
  }

  const [year, month, day] = normalizedDate.split('-').map(Number);
  if (![year, month, day].every((value) => Number.isFinite(value))) {
    return true;
  }

  const now = getNowParts(timeZone);
  const eventDateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const nowDateKey = `${now.year}-${String(now.month).padStart(2, '0')}-${String(now.day).padStart(2, '0')}`;

  if (eventDateKey < nowDateKey) {
    return true;
  }

  if (eventDateKey > nowDateKey) {
    return false;
  }

  const nowMinutes = (now.hour * 60) + now.minute;
  return eventMinutes < nowMinutes;
};

const generateUniquePin = (usedPins: Set<string>): string => {
  for (let attempt = 0; attempt < 20000; attempt += 1) {
    const pin = generateEventPin();
    if (!usedPins.has(pin)) {
      usedPins.add(pin);
      return pin;
    }
  }

  throw new Error('Unable to generate a unique 4-digit PIN');
};

async function main() {
  const { TIME_ZONE } = await getApplicationSettingsNoCache();

  const events = await prisma.event.findMany({
    where: {
      OR: [
        { pin: null },
        { pin: '' },
      ],
    },
    select: {
      id: true,
      title: true,
      date: true,
      time: true,
      pin: true,
    },
  }) as BackfillEvent[];

  const existingPins = new Set(
    (await prisma.event.findMany({
      where: { pin: { not: null } },
      select: { pin: true },
    }))
      .map((event) => event.pin)
      .filter((pin): pin is string => Boolean(pin)),
  );

  let updatedCount = 0;
  let skippedExpiredCount = 0;
  let skippedInvalidCount = 0;

  for (const event of events) {
    if (isExpiredEvent(event, TIME_ZONE)) {
      skippedExpiredCount += 1;
      console.log(`Skipping expired event ${event.id} (${event.title})`);
      continue;
    }

    const pin = generateUniquePin(existingPins);
    await prisma.event.update({
      where: { id: event.id },
      data: { pin },
    });

    updatedCount += 1;
    console.log(`Assigned PIN ${pin} to event ${event.id} (${event.title})`);
  }

  if (events.length === 0) {
    console.log('No events without PINs were found.');
  }

  console.log(`Backfill complete. Updated: ${updatedCount}, skipped expired: ${skippedExpiredCount}, skipped invalid: ${skippedInvalidCount}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('Backfill failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });