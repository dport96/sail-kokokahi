import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    try {
      // Extract userId and emailNotifications from the request body
      const { userId, emailNotifications } = req.body;

      // Validate inputs
      if (!userId || emailNotifications === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Update the user's emailNotifications field in the database
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId, 10) },
        data: {
          emailNotifications,
        },
      });

      // Respond with the updated user
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user notifications:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
