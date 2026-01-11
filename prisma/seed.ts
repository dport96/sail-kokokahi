/* eslint-disable no-await-in-loop */
import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding users with payment details...');

  const password = await hash('changeme', 10);

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

  console.log('Users seeded:', adminUser, johnUser);

  // Seed application settings with default values
  console.log('Seeding application settings...');

  await prisma.applicationSettings.upsert({
    where: { key: 'HOURLY_RATE' },
    update: {},
    create: {
      key: 'HOURLY_RATE',
      value: '20',
      description: 'Dollars per approved hour',
    },
  });

  await prisma.applicationSettings.upsert({
    where: { key: 'MEMBERSHIP_BASE_AMOUNT' },
    update: {},
    create: {
      key: 'MEMBERSHIP_BASE_AMOUNT',
      value: '120',
      description: 'Base membership amount',
    },
  });

  await prisma.applicationSettings.upsert({
    where: { key: 'HOURS_REQUIRED' },
    update: {},
    create: {
      key: 'HOURS_REQUIRED',
      value: '6',
      description: 'Minimum volunteer hours required for membership',
    },
  });

  console.log('Application settings seeded');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
