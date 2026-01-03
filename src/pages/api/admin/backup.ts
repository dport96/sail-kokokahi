import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Export all data from database
    const [users, events, userEvents, hoursLogs] = await Promise.all([
      prisma.user.findMany(),
      prisma.event.findMany(),
      prisma.userEvent.findMany(),
      prisma.hoursLog.findMany(),
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        users,
        events,
        userEvents,
        hoursLogs,
      },
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `sail-kokokahi-backup-${timestamp}.json`;

    // Set headers to trigger download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    return res.status(200).json(backup);
  } catch (error) {
    console.error('Backup failed:', error);
    return res.status(500).json({ error: 'Backup failed' });
  }
}
