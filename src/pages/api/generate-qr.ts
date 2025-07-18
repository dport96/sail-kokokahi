import { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return res.status(200).json({ qrCode: qrCodeDataUrl });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return res.status(500).json({ error: 'Failed to generate QR code' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
