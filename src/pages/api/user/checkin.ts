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

    // Check if the user is already signed up for the event
    let userEvent = await prisma.userEvent.findUnique({
      where: {
        userId_eventId: { userId: user.id, eventId: Number(eventId) },
      },
    });

    if (!userEvent) {
      // If not signed up, create the sign-up and set 'attended' to false initially
      userEvent = await prisma.userEvent.create({
        data: {
          userId: user.id,
          eventId: Number(eventId),
        },
      });
    } else if (userEvent.attended) {
      // If user is already checked in (attended = true), prevent duplicate check-in
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for this event',
      });
    }

    // Set the 'attended' field to true for the check-in
    await prisma.userEvent.update({
      where: { id: userEvent.id },
      data: { attended: true },
    });

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
