import React from 'react';
import { prisma } from '@/lib/prisma';
import EventsAnalytics from '@/components/EventsAnalytics';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';
import { getServerSession } from 'next-auth';

// Define the type for our analytics data
type EventAnalytics = {
  id: number;
  eventName: string;
  eventDate: string;
  signupCount: number;
  attendanceCount: number;
  totalUsers: number;
  hours: number; // Add hours field
  isUserSignedUp: boolean; // Add signup status for current user
};

// This function fetches and transforms the data
async function getEventsAnalytics(): Promise<EventAnalytics[]> {
  // Get total number of users with USER role
  const totalUserCount = await prisma.user.count({
    where: {
      role: 'USER',
    },
  });

  // Get current session to determine current user
  const session = await getServerSession(authOptions);
  const currentUserEmail = session?.user?.email;

  // Get current user ID
  let currentUserId: number | null = null;
  if (currentUserEmail) {
    const currentUser = await prisma.user.findUnique({
      where: { email: currentUserEmail },
      select: { id: true },
    });
    currentUserId = currentUser?.id || null;
  }

  // Get all events with their associated users
  const events = await prisma.event.findMany({
    include: {
      users: {
        include: {
          User: {
            select: {
              id: true,
              role: true,
              approvedHours: true,
            },
          },
        },
      },
    },
  });

  // Transform the data into the required format
  const eventsAnalytics = events.map(event => {
    // Count only users with USER role who signed up
    const signupCount = event.users.filter(
      userEvent => userEvent.User.role === 'USER',
    ).length;

    // Count attendees based on approved hours greater than 0
    const attendanceCount = event.users.filter(
      userEvent => userEvent.attended === true && userEvent.User.role === 'USER',
    ).length;

    // Check if current user is signed up for this event
    const isUserSignedUp = currentUserId ? event.users.some(
      userEvent => userEvent.User.id === currentUserId,
    ) : false;

    return {
      id: event.id,
      eventName: event.title,
      eventDate: event.date,
      signupCount,
      attendanceCount,
      totalUsers: totalUserCount,
      hours: event.hours,
      isUserSignedUp,
    };
  });

  return eventsAnalytics;
}

// Convert to Server Component
const Page = async () => {
  const session = await getServerSession(authOptions);
  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const eventsData = await getEventsAnalytics();

  return (
    <main>
      <div className="admin-analytics">
        <EventsAnalytics events={eventsData} />
      </div>
    </main>
  );
};

export default Page;
