import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const backup = req.body;
    
    if (!backup || !backup.data) {
      return res.status(400).json({ error: 'Invalid backup format' });
    }

    const { users, events, userEvents, hoursLogs } = backup.data;

    // Delete all existing data (in correct order to handle foreign keys)
    await prisma.$transaction([
      prisma.hoursLog.deleteMany(),
      prisma.userEvent.deleteMany(),
      prisma.event.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    // Restore data (in correct order)
    if (users && users.length > 0) {
      await prisma.user.createMany({ data: users, skipDuplicates: true });
    }
    
    if (events && events.length > 0) {
      await prisma.event.createMany({ data: events, skipDuplicates: true });
    }
    
    if (userEvents && userEvents.length > 0) {
      await prisma.userEvent.createMany({ data: userEvents, skipDuplicates: true });
    }
    
    if (hoursLogs && hoursLogs.length > 0) {
      await prisma.hoursLog.createMany({ data: hoursLogs, skipDuplicates: true });
    }

    return res.status(200).json({ 
      success: true, 
      restored: {
        users: users?.length || 0,
        events: events?.length || 0,
        userEvents: userEvents?.length || 0,
        hoursLogs: hoursLogs?.length || 0,
      }
    });
  } catch (error) {
    console.error('Restore failed:', error);
    return res.status(500).json({ 
      error: 'Restore failed', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}
