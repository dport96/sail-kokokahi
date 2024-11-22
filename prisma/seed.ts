/* eslint-disable no-await-in-loop */
import { PrismaClient, Role, Condition } from '@prisma/client';
import { hash } from 'bcrypt';
import * as config from '../config/settings.development.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database');
  const password = await hash('changeme', 10);
  config.defaultAccounts.forEach(async (account) => {
    let role: Role = 'USER';
    if (account.role === 'ADMIN') {
      role = 'ADMIN';
    }
    console.log(`  Creating user: ${account.email} with role: ${role}`);
    await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        email: account.email,
        password,
        pendingHours: account.pendingHours,
        approvedHours: account.approvedHours,
        role,
      },
    });
    // console.log(`  Created user: ${user.email} with role: ${user.role}`);
  });
  config.defaultData.forEach(async (data, index) => {
    let condition: Condition = 'good';
    if (data.condition === 'poor') {
      condition = 'poor';
    } else if (data.condition === 'excellent') {
      condition = 'excellent';
    } else {
      condition = 'fair';
    }
    console.log(`  Adding stuff: ${data.name} (${data.owner})`);
    await prisma.stuff.upsert({
      where: { id: index + 1 },
      update: {},
      create: {
        name: data.name,
        quantity: data.quantity,
        owner: data.owner,
        condition,
      },
    });
  });

  // Seed the Event table
  config.defaultEvents.forEach(async (event, index) => {
    console.log(`  Adding event: ${event.title}`);
    const user = await prisma.user.findUnique({
      where: {
        email: event.owner,
      },
    });

    if (user) {
      await prisma.event.upsert({
        where: {
          id: index + 1,
        },
        update: {
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          hours: event.hours,
          time: event.time,
          owner: event.owner,
          User: {
            connect: {
              id: user.id,
            },
          },
        },
        create: {
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          hours: event.hours,
          time: event.time,
          owner: event.owner,
          User: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    } else {
      console.error(`User with email ${event.owner} not found.`);
    }
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
