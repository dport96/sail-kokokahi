import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const hashedPassword = await hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone: phone || null,
          status: 'pending',
          role: 'USER',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          role: true,
        },
      });

      return res.status(201).json(newUser);
    } catch (error) {
      console.error('Error registering user:', error);

      if ((error as any).code === 'P2002') {
        return res.status(409).json({ error: 'Email already exists' });
      }

      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
