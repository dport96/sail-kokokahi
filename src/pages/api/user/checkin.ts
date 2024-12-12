import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handleCheckIn(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId, eventId } = req.body;

      // Fetch the event's hours
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { hours: true },
      });

      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      // Update the user's pending hours
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          pendingHours: {
            increment: event.hours, // Add the event's hours to the user's pending hours
          },
          status: {
            set: 'pending',
          },
        },
      });

      return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to check in' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
