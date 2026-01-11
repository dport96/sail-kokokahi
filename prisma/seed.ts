/* eslint-disable no-await-in-loop */
import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function ensureApplicationSettings() {
  // Ensure default APPLICATION_SETTINGS exist
  const defaultSettings = [
    { key: 'HOURLY_RATE', value: '20' },
    { key: 'MEMBERSHIP_BASE_AMOUNT', value: '120' },
    { key: 'HOURS_REQUIRED', value: '6' },
    { key: 'TIME_ZONE', value: 'Pacific/Honolulu' },
  ];

  for (const setting of defaultSettings) {
    await prisma.applicationSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('✓ Application settings ensured');
}

async function main() {
  // Ensure application settings first (needed before users can use the app)
  await ensureApplicationSettings();

  console.log('Seeding users with payment details...');

  const password = await hash('changeme', 10);

  try {
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@foo.com' },
      update: {},
      create: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@foo.com',
        password,
        role: Role.ADMIN,
      },
    });
    console.log('Admin user seeded:', adminUser.email);
  } catch (error) {
    console.log('Admin user already exists or seed skipped');
  }

  try {
    const johnUser = await prisma.user.upsert({
      where: { email: 'john@foo.com' },
      update: {},
      create: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@foo.com',
        password,
        role: Role.USER,
      },
    });
    console.log('John user seeded:', johnUser.email);
  } catch (error) {
    console.log('John user already exists or seed skipped');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
