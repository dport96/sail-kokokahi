import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { prisma } from '../src/lib/prisma';
import { createEventForImport } from '../src/lib/dbActions';

function parseDateMaybeYear(value: unknown): string | null {
  if (!value) return null;
  let s = String(value).trim();
  if (!/\b\d{4}\b/.test(s)) s = `${s} 2025`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const argv = yargs(hideBin(process.argv))
  .scriptName('load_events')
  .usage('$0 [options]')
  .option('dry-run', {
    alias: 'n',
    type: 'boolean',
    description: "Don't write to DB, only show what would be created",
    default: false,
  })
  .option('force', {
    alias: 'f',
    type: 'boolean',
    description: 'Create events even if duplicates exist (skip duplicate checks)',
    default: false,
  })
  .option('batch-size', {
    alias: 'b',
    type: 'number',
    description: 'Number of parallel inserts to run in a batch',
    default: 1,
  })
  .option('from', {
    type: 'string',
    description: 'Only import events on or after this date (YYYY-MM-DD)',
  })
  .option('to', {
    type: 'string',
    description: 'Only import events on or before this date (YYYY-MM-DD)',
  })
  .help()
  .alias('help', 'h')
  .parseSync();

async function main() {
  const file = path.resolve(__dirname, '../config/events_2025.json');
  if (!fs.existsSync(file)) {
    console.error('events file not found:', file);
    process.exit(1);
  }

  const flags = argv;
  const items = JSON.parse(fs.readFileSync(file, 'utf8')) as any[];
  console.log(`Loaded ${items.length} events from ${file}`);

  // Filter by date range if provided
  let filtered = items.map((it) => ({ raw: it, dateIso: parseDateMaybeYear(it.date) }));
  if (flags.from) {
    const fromTs = new Date(flags.from).getTime();
    filtered = filtered.filter((it) => {
      if (!it.dateIso) return false;
      return new Date(it.dateIso).getTime() >= fromTs;
    });
  }
  if (flags.to) {
    const toTs = new Date(flags.to).getTime();
    filtered = filtered.filter((it) => {
      if (!it.dateIso) return false;
      return new Date(it.dateIso).getTime() <= toTs;
    });
  }

  console.log(`Processing ${filtered.length} events (dryRun=${!!flags['dry-run']}, force=${!!flags.force})`);

  const batchSize = flags['batch-size'] && flags['batch-size'] > 0 ? flags['batch-size'] : 1;
  let createdCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // helper to process a single item
  async function processItem(item: any, dateIso: string | null) {
    try {
      if (!flags.force) {
        const existing = await prisma.event.findFirst({
          where: {
            title: item.title,
            location: item.location || undefined,
            date: dateIso || undefined,
          },
        });
        if (existing) {
          skippedCount++;
          console.log('Skipping existing event:', item.title, item.date);
          return;
        }
      }

      if (flags['dry-run']) {
        createdCount++;
        console.log('[dry-run] Would create:', item.title, dateIso);
        return;
      }

      const created = await createEventForImport({
        title: item.title,
        description: item.description || '',
        date: dateIso || '',
        location: item.location || '',
        hours: item.hours ?? 0,
        time: item.time || '',
        signupReq: !!item.signupReq,
        qr: item.qr || undefined,
      });
      createdCount++;
      console.log('Created event:', created.title, created.id);
    } catch (err) {
      errorCount++;
      console.error('Error importing event', item.title, err);
    }
  }

  // Process in batches
  for (let i = 0; i < filtered.length; i += batchSize) {
    const chunk = filtered.slice(i, i + batchSize);
    // process chunk in parallel
    await Promise.all(chunk.map((it) => processItem(it.raw, it.dateIso)));
  }

  console.log(`Import complete. created=${createdCount} skipped=${skippedCount} errors=${errorCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
