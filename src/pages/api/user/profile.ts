import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { email, firstName, lastName, phone, cardNumber, cardExpiry, cardCVV } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ error: `No user found with email: ${email}` });
      }

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          phone: phone || user.phone,
          cardNumber: cardNumber || user.cardNumber,
          cardExpiry: cardExpiry || user.cardExpiry,
          cardCVV: cardCVV || user.cardCVV,
        },
      });

      return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
