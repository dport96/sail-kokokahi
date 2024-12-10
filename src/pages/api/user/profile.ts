import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the token from the request
  const token = await getToken({ req });

  if (!token) {
    return res.status(401).json({ error: 'You must be signed in to access this endpoint.' });
  }

  // Get the email from the token
  const userEmail = token.email;

  if (!userEmail) {
    return res.status(400).json({ error: 'No email found in session.' });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          approvedHours: true,
          pendingHours: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const { firstName, lastName, phone } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { email: userEmail },
        data: {
          firstName,
          lastName,
          phone,
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          approvedHours: true,
          pendingHours: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
