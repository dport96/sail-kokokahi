import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { NextApiRequest, NextApiResponse } from 'next';

// Extend the default next-auth session type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // Add the `id` field here
      email: string;
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // Only allow POST requests
  if (method === 'POST') {
    try {
      // Get session to ensure the user is logged in
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Extract the eventId from the request body
      const { eventId } = req.body;
      if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
      }

      // Ensure eventId is a valid number
      const eventIdNum = Number(eventId); // Convert eventId to a number
      if (Number.isNaN(eventIdNum)) {
        return res.status(400).json({ message: 'Invalid Event ID' });
      }

      // Convert userId from string to number
      const userId = Number(session.user.id); // Convert userId to a number
      if (Number.isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid User ID' });
      }

      // Check if the event exists (optional but recommended)
      const event = await prisma.event.findUnique({
        where: { id: eventIdNum },
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Insert a record into the UserEvent model
      const userEvent = await prisma.userEvent.create({
        data: {
          userId,
          eventId: eventIdNum,
        },
      });

      // Return the created UserEvent as a response
      return res.status(200).json(userEvent);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error signing up for the event' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
