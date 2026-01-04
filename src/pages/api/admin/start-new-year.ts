import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Delete all events, user-event associations, and hours logs
    const [deletedHoursLogs, deletedUserEvents, deletedEvents] = await Promise.all([
      prisma.hoursLog.deleteMany(),
      prisma.userEvent.deleteMany(),
      prisma.event.deleteMany(),
    ]);

    // Reset all user hours to 0
    const updatedUsers = await prisma.user.updateMany({
      data: {
        approvedHours: 0,
        pendingHours: 0,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'New year started successfully',
      cleared: {
        hoursLogs: deletedHoursLogs.count,
        userEvents: deletedUserEvents.count,
        events: deletedEvents.count,
        usersReset: updatedUsers.count,
      },
    });
  } catch (error) {
    console.error('Start new year failed:', error);
    return res.status(500).json({
      error: 'Failed to start new year',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
