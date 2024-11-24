/* eslint-disable no-await-in-loop */
import { PrismaClient, Role, Condition } from '@prisma/client';
import { hash } from 'bcrypt';
import * as config from '../config/settings.development.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database');
  const password = await hash('changeme', 10);

  // Seed default accounts
  for (const account of config.defaultAccounts) {
    const role: Role = account.role === 'ADMIN' ? 'ADMIN' : 'USER';
    console.log(`  Creating user: ${account.email} with role: ${role}`);

    await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        email: account.email,
        password,
        pendingHours: account.pendingHours || 0,
        approvedHours: account.approvedHours || 0,
        role,
        firstName: account.firstName || 'DefaultFirstName', // Ensure firstName exists
        lastName: account.lastName || 'DefaultLastName', // Ensure lastName exists
      },
    });
  }

  // Seed default data for Stuff
  for (const [index, data] of config.defaultData.entries()) {
    let condition: Condition;
    switch (data.condition) {
      case 'poor':
        condition = 'poor';
        break;
      case 'excellent':
        condition = 'excellent';
        break;
      case 'fair':
        condition = 'fair';
        break;
      default:
        condition = 'good';
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
  }

  // Seed default events
  for (const [index, event] of config.defaultEvents.entries()) {
    console.log(`  Adding event: ${event.title}`);
    const user = await prisma.user.findUnique({
      where: { email: event.owner },
    });

    if (user) {
      await prisma.event.upsert({
        where: { id: index + 1 },
        update: {
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          hours: event.hours,
          time: event.time,
          owner: event.owner,
          User: {
            connect: { id: user.id },
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
            connect: { id: user.id },
          },
        },
      });
    } else {
      console.error(`User with email ${event.owner} not found.`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
