'use server';

import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

/**
 * Adds a new Event to the database.
 * @param event, an object with the following properties:
 * eventId, title, description, date, location, owner, hours, time, signupReq.
 */
export async function addEvent(event: {
  title: string;
  description: string;
  date: string;
  location: string;
  hours: number;
  time: string;
  signupReq: boolean;
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
      signupReq: event.signupReq,
      qr: event.qr,
    },
  });
  // After adding, redirect to the event page
  redirect('/eventsignup');
}

/**
 * Deletes an existing event from the database.
 * @param id, the id of the event to delete.
 */
export const deleteEvent = async (eventId: number) => {
  try {
    // Delete related records first
    await prisma.userEvent.deleteMany({
      where: { eventId }, // Replace `eventId` with the correct field name if different
    });

    // Delete the event after deleting related records
    const deletedEvent = await prisma.event.delete({
      where: { id: eventId },
    });

    return deletedEvent;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error; // Ensure errors are propagated
  } finally {
    await prisma.$disconnect();
  }
  // After deleting, redirect to the event page
  redirect('/admin-events');
};

/**
 * Deletes an existing user from the database.
 * @param id, the id of the user to delete.
 */
export const deleteUser = async (userId: number) => {
  try {
    // Delete related records in HoursLog and UserEvent
    await prisma.hoursLog.deleteMany({ where: { userId } });
    await prisma.userEvent.deleteMany({ where: { userId } });

    // Delete the user
    const deletedUser = await prisma.user.delete({ where: { id: userId } });

    return deletedUser;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
  // After deleting, redirect to the admin dashboard page
  redirect('/admin-dashboard');
};

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
