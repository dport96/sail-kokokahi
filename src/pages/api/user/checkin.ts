import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Fetch the event details
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      select: { hours: true, date: true },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if the event date is today
    /* const eventDate = new Date(event.date);
    const today = new Date();
    if (eventDate.toDateString() !== today.toDateString()) {
      return res.status(400).json({
        success: false,
        message: 'You can only check in on the day of the event',
      });
    } */

    // Increment the user's pending hours by the event's hours
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pendingHours: { increment: event.hours },
        status: 'pending', // Assuming status should be 'pending' during check-in
      },
    });

    // Create a check-in record in the hours log
    await prisma.hoursLog.create({
      data: {
        userId: user.id,
        action: 'check-in',
        hours: event.hours,
        performedBy: user.email,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully checked in',
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during check-in',
    });
  }
}
