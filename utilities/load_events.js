// Programmatically register ts-node to allow requiring TypeScript modules
// from a CommonJS script. This keeps the convenience of running
// `node utilities/load_events.js` while allowing reuse of server code.
const path = require('path');
const fs = require('fs');

// register ts-node
try {
  const tsNode = require('ts-node');
  tsNode.register({ transpileOnly: true, compilerOptions: { module: 'CommonJS' } });
} catch (err) {
  console.error('ts-node is required to run this importer. Install it with `npm install --save-dev ts-node`');
  throw err;
}

// now we can require TypeScript server modules
const { createEventForImport } = require('../src/lib/dbActions');
const { prisma } = require('../src/lib/prisma');

function parseDateMaybeYear(value) {
  if (!value) return null;
  let s = String(value).trim();
  if (!/\b\d{4}\b/.test(s)) s = `${s} 2025`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

async function main() {
  const file = path.resolve(__dirname, '../config/events_2025.json');
  if (!fs.existsSync(file)) {
    console.error('events file not found:', file);
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`Importing ${items.length} events from ${file}`);

  for (const item of items) {
    try {
      const dateIso = parseDateMaybeYear(item.date);

      const existing = await prisma.event.findFirst({
        where: {
          title: item.title,
          location: item.location || undefined,
          date: dateIso || undefined,
        },
      });

      if (existing) {
        console.log('Skipping existing event:', item.title, item.date);
        continue;
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

      console.log('Created event:', created.title, created.id);
    } catch (err) {
      console.error('Error importing event', item.title, err);
    }
  }

  console.log('Import complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });