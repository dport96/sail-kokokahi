import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

export async function GET(req: NextRequest, context: any) {
  const paramsSource = context?.params;
  const params = typeof paramsSource?.then === 'function' ? await paramsSource : paramsSource;
  try {
    const eventId = parseInt(params.eventId, 10);
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    if (Number.isNaN(eventId)) {
      return NextResponse.json(
        { message: 'Invalid event ID' },
        { status: 400 },
      );
    }

    // Get attendees for this event based on query parameter
    const whereClause = includeAll
      ? { eventId } // Get all users signed up for the event
      : { eventId, attended: true }; // Only get users who are marked as attended

    const attendees = await prisma.userEvent.findMany({
      where: whereClause,
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

export async function POST(req: NextRequest, context: any) {
  const paramsSource = context?.params;
  const params = typeof paramsSource?.then === 'function' ? await paramsSource : paramsSource;
  try {
    const eventId = parseInt(params.eventId, 10);
    const { userId, attended = false, notes } = await req.json(); // Default to false (registered, not attended)

    if (Number.isNaN(eventId) || !userId) {
      return NextResponse.json(
        { message: 'Invalid event ID or user ID' },
        { status: 400 },
      );
    }

    if (notes !== undefined && typeof notes !== 'string') {
      return NextResponse.json(
        { message: 'Notes must be a string' },
        { status: 400 },
      );
    }

    const normalizedNotes = typeof notes === 'string' ? notes.trim() : '';
    if (normalizedNotes.length > 1000) {
      return NextResponse.json(
        { message: 'Notes must be 1000 characters or less' },
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
    };

    // Create UserEvent record and update pending hours in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.userEvent.create({
        data: {
          userId,
          eventId,
          attended,
          notes: normalizedNotes || null,
        },
      });

      // Any new attendee association should contribute event hours to pending.
      // Approval moves pending to approved in a separate admin action.
      await tx.user.update({
        where: { id: userId },
        data: {
          pendingHours: {
            increment: event.hours,
          },
        },
      });
    });

    return NextResponse.json({
      message: 'User successfully associated with event',
    });
  } catch (error) {
    console.error('Error associating user with event:', error);
    return NextResponse.json(
      { message: 'Failed to associate user with event' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, context: any) {
  const paramsSource = context?.params;
  const params = typeof paramsSource?.then === 'function' ? await paramsSource : paramsSource;
  try {
    const eventId = parseInt(params.eventId, 10);
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get('userId') || '', 10);

    if (Number.isNaN(eventId) || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid event ID or user ID' },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);

    const sessionUserId = Number(session?.user?.id);

    if (!session || (sessionUserId !== userId && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the userEvent to get the attended status before deleting
    const userEvent = await prisma.userEvent.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      select: { attended: true },
    });

    if (!userEvent) {
      return NextResponse.json(
        { message: 'User not signed up for this event' },
        { status: 404 },
      );
    }

    // Get event details to know how many hours to deduct
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

    // Delete UserEvent record and update pending hours in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.userEvent.delete({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });

      if (userEvent.attended === false) {
        // Only deduct hours from pending if they were just signed up (not attended)
        await tx.user.update({
          where: { id: userId },
          data: {
            pendingHours: {
              decrement: event.hours,
            },
          },
        });
      }
    });

    return NextResponse.json({ message: 'User successfully unregistered from event' });
  } catch (error) {
    console.error('Error unregistering user from event:', error);
    return NextResponse.json(
      { message: 'Failed to unregister user from event' },
      { status: 500 },
    );
  }
}
