'use server';

import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

/**
 * Adds a new Event to the database.
 * @param event, an object with the following properties:
 * eventId, title, description, date, location, owner, hours, time.
 */
export async function addEvent(event: {
  title: string;
  description: string;
  date: string;
  location: string;
  hours: number;
  time: string;
  qr: string;
}) {
  await prisma.event.create({
    data: {
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      hours: event.hours,
      time: event.time,
      qr: event.qr,
    },
  });
  // After adding, redirect to the event page
  redirect('/eventsignup');
}

/**
 * Creates a new user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function createUser(credentials: { email: string; password: string }) {
  // console.log(`createUser data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.create({
    data: {
      email: credentials.email,
      password,
    },
  });
}

/**
 * Changes the password of an existing user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function changePassword(credentials: { email: string; password: string }) {
  // console.log(`changePassword data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.update({
    where: { email: credentials.email },
    data: {
      password,
    },
  });
}
