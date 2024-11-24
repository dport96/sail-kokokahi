import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { email, name, phone } = req.body;

    // Validate required fields
    if (!email) {
      console.log('Email is missing in the request body.');
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      console.log(`Searching for user with email: ${email}`);

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.log(`No user found with email: ${email}`);
        return res.status(404).json({ error: `No user found with email: ${email}` });
      }

      console.log('User found:', user);

      // Update the user's information
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          ...(name && { firstName: name }),
          ...(phone && { phone }),
        },
      });

      console.log('User updated successfully:', updatedUser);
      return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: 'Internal server error', details: errorMessage });
    }
  }

  console.log(`Invalid method: ${req.method}`);
  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
