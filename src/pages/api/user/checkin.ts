import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { getTimeZone } from '@/lib/settings';
import { normalizeEventDate } from '@/lib/date';

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

    // Do not allow admins or non-user roles to check in
    if (user.role !== Role.USER) {
      return res.status(403).json({ success: false, message: 'Admins and staff cannot check in for events' });
    }

    // Fetch the event details
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      select: { hours: true, date: true, title: true },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Validate that check-in is only allowed on the day of the event
    const timeZone = await getTimeZone();
    
    // Get today's date in the event timezone
    const todayFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    const todayParts = todayFormatter.formatToParts(new Date());
    const todayMap = new Map(todayParts.map(part => [part.type, part.value]));
    const todayDate = `${todayMap.get('year')}-${todayMap.get('month')}-${todayMap.get('day')}`;

    // Parse event date from MM/DD/YYYY format to YYYY-MM-DD (zero-padded)
    const eventDate = normalizeEventDate(event.date);

    if (!eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event date format',
      });
    }

    // Check if today matches the event date
    if (todayDate !== eventDate) {
      const eventDateObj = new Date(eventDate);
      const today = new Date(`${todayDate}`);
      
      let message = 'Check-in is only allowed on the day of the event. ';
      if (eventDateObj > today) {
        message += `This event is on ${event.date} and has not started yet.`;
      } else {
        message += `This event was on ${event.date} and has already passed.`;
      }
      
      return res.status(400).json({
        success: false,
        message,
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
        action: `Check-in for event: ${event.title}`,
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
