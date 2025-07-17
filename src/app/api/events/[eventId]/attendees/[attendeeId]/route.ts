import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string; attendeeId: string } },
) {
  try {
    const eventId = parseInt(params.eventId, 10);
    const attendeeId = parseInt(params.attendeeId, 10);

    if (Number.isNaN(eventId) || Number.isNaN(attendeeId)) {
      return NextResponse.json(
        { message: 'Invalid event ID or attendee ID' },
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

    // Get event details to know how many hours to subtract
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
      // Delete the attendee record
      await tx.userEvent.delete({
        where: {
          id: attendeeId,
        },
      });

      // Update user's hours (subtract the event hours)
      // First, try to subtract from pending hours
      const currentPendingHours = attendee.User.pendingHours;
      const eventHours = event.hours;

      if (currentPendingHours >= eventHours) {
        // If user has enough pending hours, subtract from pending hours
        await tx.user.update({
          where: { id: attendee.userId },
          data: {
            pendingHours: currentPendingHours - eventHours,
          },
        });
      } else {
        // If not enough pending hours, subtract from pending first, then from approved
        const remainingToSubtract = eventHours - currentPendingHours;
        
        // Get current approved hours
        const currentUser = await tx.user.findUnique({
          where: { id: attendee.userId },
          select: { approvedHours: true },
        });

        if (currentUser) {
          await tx.user.update({
            where: { id: attendee.userId },
            data: {
              pendingHours: 0, // Set pending hours to 0
              approvedHours: Math.max(0, currentUser.approvedHours - remainingToSubtract),
            },
          });
        }
      }
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
