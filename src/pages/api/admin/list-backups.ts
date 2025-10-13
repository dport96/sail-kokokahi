import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const backupsDir = path.join(process.cwd(), 'backups');
    await fs.mkdir(backupsDir, { recursive: true });
    const files = await fs.readdir(backupsDir);
    const backups = files
      .filter((f) => f.endsWith('.dump') || f.endsWith('.sql') || f.endsWith('.sql.gz'))
      .map((filename) => ({
        filename,
        timestamp: filename.split('_')[1] || filename,
      }))
      .sort((a, b) => (a.filename < b.filename ? 1 : -1));

    return res.status(200).json(backups);
  } catch (error) {
    console.error('Failed to list backups:', error);
    return res.status(500).json({ error: 'Failed to list backups' });
  }
}
