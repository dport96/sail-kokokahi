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
 * Create an event without performing a Next.js redirect.
 * This is intended for CLI / import scripts that need to reuse the
 * server-side event creation logic but can't run inside a Next.js
 * action context.
 */
export async function createEventForImport(event: {
  title: string;
  description?: string;
  date?: string | null;
  location?: string | null;
  hours?: number | null;
  time?: string | null;
  signupReq?: boolean;
  qr?: string | null;
  ownerId?: number | null;
}) {
  // Prisma schema currently marks some fields as required (non-nullable).
  // Provide safe defaults when values are missing in import data so the
  // import script can create events without causing type errors.
  const created = await prisma.event.create({
    data: {
      title: event.title,
      description: event.description ?? '',
      // Event schema expects strings/numbers for these fields; fall back to
      // empty string or 0 when missing so Prisma accepts the create call.
      date: event.date ?? '',
      location: event.location ?? '',
      hours: event.hours ?? 0,
      time: event.time ?? '',
      signupReq: !!event.signupReq,
      qr: event.qr ?? undefined,
    },
  });

  return created;
}

/**
 * Deletes an existing event from the database.
 * @param id, the id of the event to delete.
 */
export const deleteEvent = async (eventId: number) => {
  try {
    // Fetch the event to get its hours (needed to adjust user hours)
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error(`Event with id ${eventId} not found`);

    // Find all userEvent records for this event
    const userEvents = await prisma.userEvent.findMany({ where: { eventId } });

    // For attendees who had 'attended' = true, batch update their pendingHours
    const attendingUserIds = userEvents.filter((ue) => ue.attended).map((ue) => ue.userId);
    if (attendingUserIds.length > 0) {
      // Fetch current users to compute safe (non-negative) pendingHours values
      const users = await prisma.user.findMany({ where: { id: { in: attendingUserIds } } });

      const decrementBy = Number(event.hours) || 0;
      const updatePromises = users.map((user) => {
        const newPending = Math.max(0, Number(user.pendingHours) - decrementBy);
        return prisma.user.update({ where: { id: user.id }, data: { pendingHours: newPending } });
      });

      // Apply user updates in parallel
      await Promise.all(updatePromises);

      // Best-effort: delete hoursLog entries that match these users and the event hours
      // (hoursLog doesn't reference eventId so we match by userId, action and hours)
      await prisma.hoursLog.deleteMany({
        where: {
          userId: { in: attendingUserIds },
          action: 'check-in',
          hours: event.hours,
        },
      });
    }

    // Delete related UserEvent records for this event
    await prisma.userEvent.deleteMany({ where: { eventId } });

    // Delete the event after deleting related records
    const deletedEvent = await prisma.event.delete({ where: { id: eventId } });

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
  const password = await hash(credentials.password, 10);
  const email = credentials.email.trim().toLowerCase();
  await prisma.user.create({
    data: {
      email,
      password,
    },
  });
}

/**
 * Changes the password of an existing user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function changePassword(credentials: { email: string; password: string }) {
  const password = await hash(credentials.password, 10);
  const email = credentials.email.trim().toLowerCase();
  // Update password and clear mustChangePassword flag.
  // Use case-insensitive match on email and update matching users.
  await prisma.user.updateMany({
    where: { email: { equals: email, mode: 'insensitive' } },
    data: { password, mustChangePassword: false },
  });
}
