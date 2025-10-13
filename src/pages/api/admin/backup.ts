import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

function execPromise(cmd: string) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) {
        const e = new Error(`Command failed: ${err.message || String(err)}`);
        // attach stderr for debugging
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

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return res.status(500).json({ error: 'DATABASE_URL not configured' });

  try {
    const backupsDir = path.join(process.cwd(), 'backups');
    fs.mkdirSync(backupsDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.dump`;
    const outPath = path.join(backupsDir, filename);

    // Use pg_dump to create a custom-format compressed dump
    const cmd = `pg_dump "$DATABASE_URL" -Fc -f "${outPath}"`;

    // Run with DATABASE_URL exported so pg_dump picks it up
    const fullCmd = `export DATABASE_URL='${databaseUrl}' && ${cmd}`;
    await execPromise(fullCmd);

    return res.status(200).json({ filename, timestamp });
  } catch (error) {
    console.error('Backup failed:', error);
    return res.status(500).json({ error: 'Backup failed' });
  }
}
