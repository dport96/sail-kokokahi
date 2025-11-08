import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const eventId = Number(id);

  if (Number.isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  // Only allow PATCH for updating events
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    // Only admins allowed
    const role = (session?.user as any)?.randomKey;
    if (role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const {
      title,
      description,
      date,
      location,
      hours,
      time,
      signupReq,
      qr,
      propagateMode, // optional: 'audit' or 'adjust-approved' (currently we implement 'audit')
    } = req.body;

    // Build update data dynamically to avoid overwriting with undefined
    const data: any = {};
    if (typeof title === 'string') data.title = title;
    if (typeof description === 'string') data.description = description;
    if (typeof date === 'string') data.date = date;
    if (typeof location === 'string') data.location = location;
    if (typeof hours === 'number') data.hours = hours;
    if (typeof time === 'string') data.time = time;
    if (typeof signupReq === 'boolean') data.signupReq = signupReq;
    if (typeof qr === 'string') data.qr = qr;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Fetch the original event so we can detect changes (hours delta)
    const originalEvent = await prisma.event.findUnique({ where: { id: eventId } });
    if (!originalEvent) return res.status(404).json({ error: 'Event not found' });

    const updated = await prisma.event.update({ where: { id: eventId }, data });

    // If hours changed and admin requested propagation, perform a safe opt-in routine.
    if (typeof data.hours === 'number' && Number(data.hours) !== Number(originalEvent.hours)) {
      const delta = Number(data.hours) - Number(originalEvent.hours || 0);
      // Only implement audit-style propagation by default: create HoursLog entries
      // for each attended user describing the hours delta. This is non-destructive
      // and provides an audit trail so admins can make manual corrections if desired.
      if (propagateMode === 'audit') {
        // Find all attended userEvent rows for the event
        const userEvents = await prisma.userEvent.findMany({ where: { eventId, attended: true } });
        const operated: any[] = [];

        // Build create operations for the transaction
        const ops = userEvents.map((ue) =>
          prisma.hoursLog.create({
            data: {
              userId: ue.userId,
              action: 'event-hours-audit',
              hours: delta,
              performedBy: (session?.user as any)?.email ?? 'admin',
            },
          })
        );

        if (ops.length > 0) {
          await prisma.$transaction(ops);
        }

        // Return count of audits created for convenience
        return res.status(200).json({ ok: true, event: updated, auditsCreated: ops.length });
      }

      // Implement 'adjust-approved' propagation: update user totals in-place.
      if (propagateMode === 'adjust-approved') {
        // We use an interactive transaction because updating user totals depends on
        // each user's current pending/approved hours. Heuristic used:
        // - If user.pendingHours > 0, assume the event hours are still pending and
        //   adjust pendingHours by delta.
        // - Otherwise, assume the event hours were already approved and adjust approvedHours by delta.
        // This is a best-effort heuristic because the schema does not track per-event approval state.
        const attendedUserEvents = await prisma.userEvent.findMany({ where: { eventId, attended: true } });

        if (attendedUserEvents.length > 0) {
          await prisma.$transaction(async (tx) => {
            for (const ue of attendedUserEvents) {
              const user = await tx.user.findUnique({ where: { id: ue.userId } });
              if (!user) continue;

              // Decide whether to adjust pending or approved
              if (Number(user.pendingHours || 0) > 0) {
                const newPending = Math.max(0, Number(user.pendingHours || 0) + delta);
                await tx.user.update({ where: { id: user.id }, data: { pendingHours: newPending } });
              } else {
                const newApproved = Math.max(0, Number(user.approvedHours || 0) + delta);
                await tx.user.update({ where: { id: user.id }, data: { approvedHours: newApproved } });
              }

              // Create an audit log entry describing the change for traceability
              await tx.hoursLog.create({
                data: {
                  userId: user.id,
                  action: 'event-hours-adjust',
                  hours: delta,
                  performedBy: (session?.user as any)?.email ?? 'admin',
                },
              });
            }
          });
        }

        // Return a helpful response indicating how many user rows were processed
        return res.status(200).json({ ok: true, event: updated, usersProcessed: attendedUserEvents.length });
      }
    }

    return res.status(200).json({ ok: true, event: updated });
  } catch (error) {
    console.error('Failed to update event:', error);
    return res.status(500).json({ error: 'Failed to update event' });
  }
}
