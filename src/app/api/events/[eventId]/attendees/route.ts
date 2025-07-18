import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  try {
    const eventId = parseInt(params.eventId, 10);

    if (Number.isNaN(eventId)) {
      return NextResponse.json(
        { message: 'Invalid event ID' },
        { status: 400 },
      );
    }

    // Get all attendees for this event
    const attendees = await prisma.userEvent.findMany({
      where: {
        eventId,
        attended: true, // Only get users who are marked as attended
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        User: {
          lastName: 'asc',
        },
      },
    });

    return NextResponse.json(attendees);
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    return NextResponse.json(
      { message: 'Failed to fetch event attendees' },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } },
) {
  try {
    const eventId = parseInt(params.eventId, 10);
    const { userId, attended = true } = await req.json();

    if (Number.isNaN(eventId) || !userId) {
      return NextResponse.json(
        { message: 'Invalid event ID or user ID' },
        { status: 400 },
      );
    }

    // Check if the user is already associated with this event
    const existingAttendee = await prisma.userEvent.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingAttendee) {
      return NextResponse.json(
        { message: 'User is already associated with this event' },
        { status: 400 },
      );
    }

    // Get event details to know how many hours to add
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { hours: true },
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 },
      );
    }

    // Get current user to update pending hours
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { pendingHours: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 },
      );
    }

    // Use a transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Add user to event
      const newAttendee = await tx.userEvent.create({
        data: {
          userId,
          eventId,
          attended,
        },
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Update user's pending hours
      await tx.user.update({
        where: { id: userId },
        data: {
          pendingHours: currentUser.pendingHours + event.hours,
        },
      });

      return newAttendee;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error adding user to event:', error);
    return NextResponse.json(
      { message: 'Failed to add user to event' },
      { status: 500 },
    );
  }
}
