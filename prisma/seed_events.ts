/* eslint-disable no-await-in-loop */
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding events from config/events_2025.json...');

  const filePath = path.join(__dirname, '..', 'config', 'events_2025.json');
  const raw = await fs.readFile(filePath, 'utf8');
  const events: Array<Record<string, unknown>> = JSON.parse(raw);

  let inserted = 0;
  let skipped = 0;

  for (const ev of events) {
    // Defensive parsing
    const title = (ev.title as string) ?? String(ev.title ?? '').trim();
    const date = (ev.date as string) ?? String(ev.date ?? '').trim();
    const description = (ev.description as string) ?? '';
    const location = (ev.location as string) ?? '';
    const time = (ev.time as string) ?? '';
    const hours = typeof ev.hours === 'number' ? (ev.hours as number) : Number(ev.hours ?? 0);

    if (!title || !date) {
      console.log('Skipping malformed event (missing title or date):', ev);
      skipped += 1;
    } else {
      // Consider an event duplicate when both title and date match (case-insensitive)
      const existing = await prisma.event.findFirst({
        where: {
          title: { equals: title, mode: 'insensitive' },
          date: { equals: date, mode: 'insensitive' },
        },
      });

      if (existing) {
        console.log(`Skipping existing event: ${title} (${date})`);
        skipped += 1;
      } else {
        await prisma.event.create({
          data: {
            title,
            description,
            date,
            location,
            hours: hours || 0,
            time,
            signupReq: false,
          },
        });

        console.log(`Inserted event: ${title} (${date})`);
        inserted += 1;
      }
    }
  }

  console.log(`Done. Inserted: ${inserted}, Skipped: ${skipped}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e: any) => {
    // Prisma P2021 = table does not exist in the current DB (common when migrations
    // haven't been applied or the DATABASE_URL points at the wrong database).
    if (e?.code === 'P2021') {
      console.error('Database schema not found: it looks like the expected tables are missing.');
      console.error('Details:', e.message ?? e);
      console.error('\nPossible fixes:');
      console.error('  - Ensure your DATABASE_URL points to the correct database (same one the app uses).');
      console.error('    You can inspect the DB used by a running PM2 process with: pm2 env <id>');
      console.error('  - Run Prisma migrations locally: npx prisma migrate dev --name init');
      console.error('  - If the app uses a remote/production DB, run this script where the app can access that DB.');
    } else {
      console.error(e);
    }

    await prisma.$disconnect();
    process.exit(1);
  });
