import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password, firstName, lastName, reminders } = req.body;

    // Debug: Log the incoming request body
    console.log('Incoming Request Body:', req.body);

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Hash the password
      const hashedPassword = await hash(password, 10);

      // Create a new user in the database
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          reminders: reminders || false, // Default to false if not provided
        },
      });

      // Respond with the new user data
      return res.status(201).json(newUser);
    } catch (error) {
      // Debug: Log the error
      console.error('Error registering user:', error);

      // Handle unique constraint violation
      if ((error as any).code === 'P2002') {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // General error response
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
