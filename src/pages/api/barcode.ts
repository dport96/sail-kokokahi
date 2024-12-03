import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { data } = req.body;

    if (!data) {
      res.status(400).json({ error: 'Data is required to generate a barcode.' });
      return;
    }

    try {
      const newBarcode = await prisma.barcode.create({
        data: { data },
      });
      res.status(201).json(newBarcode);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to save barcode data.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
