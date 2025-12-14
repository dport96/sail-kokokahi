import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

function execPromise(cmd: string) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) {
        const e = new Error(`Command failed: ${err.message || String(err)}`);
        // @ts-ignore
        e.stderr = stderr;
        reject(e);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { filename } = req.body || {};
  if (!filename || typeof filename !== 'string') return res.status(400).json({ error: 'Missing filename' });

  const backupsDir = path.join(process.cwd(), 'backups');
  const filePath = path.join(backupsDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Backup file not found' });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(500).json({ error: 'DATABASE_URL not configured' });

  try {
    // Use pg_restore to restore the custom-format dump
    const exportCmd = `export DATABASE_URL='${databaseUrl}'`;
    const restoreCmd = `pg_restore --clean --no-owner -d "$DATABASE_URL" "${filePath}"`;
    const cmd = `${exportCmd} && ${restoreCmd}`;
    await execPromise(cmd);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Restore failed:', error);
    return res.status(500).json({ error: 'Restore failed' });
  }
}
