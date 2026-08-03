import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generateEventPin } from '@/lib/eventPin';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        title,
        description,
        date,
        location,
        hours,
        time,
        signupReq,
        pin: requestedPin,
      } = req.body;

      const trimmedPin = typeof requestedPin === 'string' ? requestedPin.trim() : '';
      let pin: string | null = null;

      if (trimmedPin !== '') {
        const normalizedPin = trimmedPin.toLowerCase();
        if (normalizedPin === 'auto') {
          pin = generateEventPin();
        } else if (/^\d{4}$/.test(trimmedPin)) {
          pin = trimmedPin;
        } else {
          return res.status(400).json({ success: false, message: 'PIN must be blank, "auto", or exactly 4 digits.' });
        }
      }

      // Save the event to the database
      const event = await prisma.event.create({
        data: {
          title,
          description,
          date,
          location,
          hours,
          time,
          signupReq,
          pin,
        },
      });
      return res.status(200).json({ success: true, event });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to create event.' });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }
}
