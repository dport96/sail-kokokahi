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
      cardNumber: '4111111111111111',
      cardExpiry: '12/24',
      cardCVV: '123',
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
      cardNumber: '4111111111112222',
      cardExpiry: '01/25',
      cardCVV: '456',
    },
  });

  console.log('Users seeded:', adminUser, johnUser);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
