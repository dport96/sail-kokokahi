import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { invalidateSettingsCache } from '@/lib/settings';

type SettingsPayload = {
  HOURLY_RATE?: number;
  MEMBERSHIP_BASE_AMOUNT?: number;
  HOURS_REQUIRED?: number;
  TIME_ZONE?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const requester = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!requester || requester.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method === 'GET') {
    try {
      const rows = await prisma.applicationSettings.findMany({
        where: { key: { in: ['HOURLY_RATE', 'MEMBERSHIP_BASE_AMOUNT', 'HOURS_REQUIRED', 'TIME_ZONE'] } },
      });
      const result: any = {};
      rows.forEach((r) => {
        if (r.key === 'TIME_ZONE') {
          result.TIME_ZONE = r.value;
        } else {
          const n = parseFloat(r.value);
          if (!Number.isNaN(n)) result[r.key] = n;
        }
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error('Settings GET failed:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  if (req.method === 'PATCH') {
    const body: SettingsPayload = req.body || {};
    const updates: Array<{ key: string; value: string }> = [];
    ['HOURLY_RATE', 'MEMBERSHIP_BASE_AMOUNT', 'HOURS_REQUIRED'].forEach((k) => {
      const v = (body as any)[k];
      if (typeof v === 'number' && Number.isFinite(v)) {
        updates.push({ key: k, value: String(v) });
      }
    });
    if (typeof body.TIME_ZONE === 'string' && body.TIME_ZONE.trim().length > 0) {
      updates.push({ key: 'TIME_ZONE', value: body.TIME_ZONE.trim() });
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid settings provided' });
    }

    try {
      for (const u of updates) {
        await prisma.applicationSettings.upsert({
          where: { key: u.key },
          update: { value: u.value },
          create: { key: u.key, value: u.value },
        });
      }
      // Invalidate server-side cache so new values apply immediately
      invalidateSettingsCache();
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Settings PATCH failed:', err);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
