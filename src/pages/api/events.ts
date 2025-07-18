import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { title, description, date, location, hours, time, signupReq } = req.body;

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
