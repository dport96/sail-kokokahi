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
  signupCount: number;
  attendanceCount: number;
  totalUsers: number;
  hours: number; // Add hours field
};

// This function fetches and transforms the data
async function getEventsAnalytics(): Promise<EventAnalytics[]> {
  // Get total number of users with USER role
  const totalUserCount = await prisma.user.count({
    where: {
      role: 'USER',
    },
  });

  // Get all events with their associated users
  const events = await prisma.event.findMany({
    include: {
      users: {
        include: {
          User: {
            select: {
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

    return {
      id: event.id,
      eventName: event.title,
      signupCount,
      attendanceCount,
      totalUsers: totalUserCount,
      hours: event.hours,
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
