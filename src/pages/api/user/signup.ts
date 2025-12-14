import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { eventId } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    // First get the user ID using the email from the session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Do not allow admins or non-user roles to sign up for events
    if (user.role !== Role.USER) {
      return res.status(403).json({ message: 'Admins and staff cannot sign up for events' });
    }

    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const existingUserEvent = await prisma.userEvent.findUnique({
      where: {
        userId_eventId: { userId: user.id, eventId: Number(eventId) },
      },
    });

    if (existingUserEvent) {
      return res.status(409).json({ message: 'You have already signed up for this event' });
    }

    const userEvent = await prisma.userEvent.create({
      data: {
        userId: user.id,
        eventId: Number(eventId),
      },
    });

    return res.status(201).json({
      message: 'Successfully signed up for the event',
      userEvent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
