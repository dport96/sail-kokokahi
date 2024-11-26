import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Incoming request:', req.method);
  console.log('Request query:', req.query);
  console.log('Request body:', req.body);

  if (req.method === 'GET') {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      console.error('Email is required as a query parameter');
      return res.status(400).json({ error: 'Email is required as a query parameter' });
    }

    try {
      console.log(`Fetching notifications for email: ${email}`);
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          emailNotifications: true,
          reminders: true,
          billings: {
            select: {
              id: true,
              amount: true,
              description: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        console.error(`User not found for email: ${email}`);
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`Notifications fetched successfully for email: ${email}`, user);
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    const { email: bodyEmail, emailNotifications, reminders } = req.body;

    if (!bodyEmail || emailNotifications === undefined || reminders === undefined) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
      console.log(`Updating notifications for email: ${bodyEmail}`);
      const updatedUser = await prisma.user.update({
        where: { email: bodyEmail },
        data: {
          emailNotifications,
          reminders,
        },
      });

      console.log(`Notifications updated successfully for email: ${bodyEmail}`, updatedUser);
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating notifications:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  console.error(`Method ${req.method} not allowed`);
  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
