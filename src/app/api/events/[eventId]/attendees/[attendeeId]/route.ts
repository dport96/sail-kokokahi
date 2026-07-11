/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function PATCH(req: NextRequest, context: any) {
  // Normalize params: Next.js may provide params as an object or a Promise depending on typings/runtime
  // Ensure we await if it's a Promise so we always have { eventId, attendeeId }
  const paramsSource = context?.params;
  const params = typeof paramsSource?.then === 'function' ? await paramsSource : paramsSource;
  try {
    const eventId = parseInt(params.eventId, 10);
    const attendeeId = parseInt(params.attendeeId, 10);
    const { attended, notes } = await req.json();

    if (Number.isNaN(eventId) || Number.isNaN(attendeeId)) {
      return NextResponse.json(
        { message: 'Invalid event ID or attendee ID' },
        { status: 400 },
      );
    }

    const hasAttendedUpdate = typeof attended === 'boolean';
    const hasNotesUpdate = notes !== undefined;

    if (!hasAttendedUpdate && !hasNotesUpdate) {
      return NextResponse.json(
        { message: 'At least one field must be provided for update' },
        { status: 400 },
      );
    }

    if (hasNotesUpdate && typeof notes !== 'string') {
      return NextResponse.json(
        { message: 'Notes must be a string' },
        { status: 400 },
      );
    }

    if (hasAttendedUpdate && typeof attended !== 'boolean') {
      return NextResponse.json(
        { message: 'Attended status must be a boolean' },
        { status: 400 },
      );
    }

    const normalizedNotes = typeof notes === 'string' ? notes.trim() : undefined;

    if (normalizedNotes !== undefined && normalizedNotes.length > 1000) {
      return NextResponse.json(
        { message: 'Notes must be 1000 characters or less' },
        { status: 400 },
      );
    }

    // First verify the attendee belongs to this event
    const attendee = await prisma.userEvent.findUnique({
      where: {
        id: attendeeId,
      },
      include: {
        User: {
          select: {
            pendingHours: true,
            approvedHours: true,
          },
        },
      },
    });

    if (!attendee) {
      return NextResponse.json(
        { message: 'Attendee not found' },
        { status: 404 },
      );
    }

    if (attendee.eventId !== eventId) {
      return NextResponse.json(
        { message: 'Attendee does not belong to this event' },
        { status: 400 },
      );
    }

    // Get event details to know how many hours to add/subtract
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

    // Use a transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Update the attendee's attended status
      const updateData: { attended?: boolean; notes?: string | null } = {};

      if (hasAttendedUpdate) {
        updateData.attended = attended;
      }

      if (hasNotesUpdate) {
        updateData.notes = normalizedNotes || null;
      }

      if (Object.keys(updateData).length > 0) {
        await tx.userEvent.update({
          where: {
            id: attendeeId,
          },
          data: updateData,
        });
      }

      // Update user's hours only when attendance changes.
      if (hasAttendedUpdate && attended && !attendee.attended) {
        // User is being marked as attended - add pending hours
        await tx.user.update({
          where: { id: attendee.userId },
          data: {
            pendingHours: attendee.User.pendingHours + event.hours,
          },
        });
      } else if (hasAttendedUpdate && !attended && attendee.attended) {
        // User is being marked as not attended - reverse only pending event hours.
        // Never touch approved hours here because per-event approval attribution is not tracked.
        const currentPendingHours = attendee.User.pendingHours;
        const eventHours = event.hours;

        await tx.user.update({
          where: { id: attendee.userId },
          data: {
            pendingHours: Math.max(0, currentPendingHours - eventHours),
          },
        });
      }
    });

    return NextResponse.json(
      { message: 'Attendance status updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating attendance status:', error);
    return NextResponse.json(
      { message: 'Failed to update attendance status' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, context: any) {
  const paramsSource = context?.params;
  const params = typeof paramsSource?.then === 'function' ? await paramsSource : paramsSource;
  try {
    const eventId = parseInt(params.eventId, 10);
    const attendeeId = parseInt(params.attendeeId, 10);

    if (Number.isNaN(eventId) || Number.isNaN(attendeeId)) {
      return NextResponse.json(
        { message: 'Invalid event ID or attendee ID' },
        { status: 400 },
      );
    }

    // Get the current session to know who performed the action
    const session = await getServerSession();
    const performedBy = session?.user?.email || 'Unknown Admin';

    // First verify the attendee belongs to this event
    const attendee = await prisma.userEvent.findUnique({
      where: {
        id: attendeeId,
      },
      include: {
        User: {
          select: {
            pendingHours: true,
            approvedHours: true,
          },
        },
      },
    });

    if (!attendee) {
      return NextResponse.json(
        { message: 'Attendee not found' },
        { status: 404 },
      );
    }

    if (attendee.eventId !== eventId) {
      return NextResponse.json(
        { message: 'Attendee does not belong to this event' },
        { status: 400 },
      );
    }

    // Get event details to know how many hours to subtract and event title
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { hours: true, title: true },
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 },
      );
    }

    // Use a transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Delete the attendee record
      await tx.userEvent.delete({
        where: {
          id: attendeeId,
        },
      });

      // Update user's hours by reversing pending event hours only.
      const currentPendingHours = attendee.User.pendingHours;
      const eventHours = event.hours;
      const nextPendingHours = Math.max(0, currentPendingHours - eventHours);
      const hoursSubtracted = currentPendingHours - nextPendingHours;

      await tx.user.update({
        where: { id: attendee.userId },
        data: {
          pendingHours: nextPendingHours,
        },
      });

      // Log the removal in HoursLog
      await tx.hoursLog.create({
        data: {
          userId: attendee.userId,
          action: `Removed from event: ${event.title}`,
          hours: -hoursSubtracted,
          performedBy,
        },
      });
    });

    return NextResponse.json(
      { message: 'User removed from event successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error removing user from event:', error);
    return NextResponse.json(
      { message: 'Failed to remove user from event' },
      { status: 500 },
    );
  }
}
