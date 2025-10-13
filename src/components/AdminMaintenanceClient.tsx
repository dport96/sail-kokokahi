'use client';

import React, { useEffect, useState } from 'react';
import { Button, Container, ListGroup, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface BackupItem {
  timestamp: string;
  filename: string;
}

const AdminMaintenanceClient: React.FC = () => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<string | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/list-backups');
      if (!res.ok) throw new Error('Failed to list backups');
      const data = await res.json();
      setBackups(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch backup list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleBackup = async () => {
    try {
      toast.info('Starting backup...');
      const res = await fetch('/api/admin/backup', { method: 'POST' });
      if (!res.ok) throw new Error('Backup failed');
      toast.success('Backup created');
      fetchBackups();
    } catch (err) {
      console.error(err);
      toast.error('Backup failed');
    }
  };

  const handleRestore = async (filename: string) => {
    // Step 1: request user to confirm in the UI
    setPendingRestore(filename);
    setRestoreConfirmText('');
  };

  const doRestore = async (filename: string) => {
    try {
      toast.info('Starting restore...');
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      if (!res.ok) throw new Error('Restore failed');
      toast.success('Restore completed');
      setPendingRestore(null);
    } catch (err) {
      console.error(err);
      toast.error('Restore failed');
    }
  };

  return (
    <Container>
      <h1 className="fw-bolder pt-3">Admin Maintenance</h1>
      <p className="text-muted">Backup and restore the database. Backups are timestamped and stored on the server.</p>

      <Row className="mb-3">
        <Col>
          <Button variant="primary" onClick={handleBackup} disabled={loading}>Create Backup</Button>
        </Col>
      </Row>

      <ListGroup>
        {backups.map((b) => (
          <ListGroup.Item key={b.filename} className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{b.timestamp}</strong>
              <div className="text-muted small">{b.filename}</div>
            </div>
            <div>
              <Button variant="danger" size="sm" onClick={() => handleRestore(b.filename)}>Restore</Button>
            </div>
          </ListGroup.Item>
        ))}
        {backups.length === 0 && <ListGroup.Item>No backups found</ListGroup.Item>}
      </ListGroup>

      {pendingRestore && (
        <div className="mt-3 p-3 border rounded">
          <h5>Confirm restore</h5>
          <p className="small text-muted">
            Type
            {' '}
            <strong>
              RESTORE
            </strong>
            {' '}
            in the box below and click Confirm to restore from
            {' '}
            <em>
              {pendingRestore}
            </em>
            .
            {' '}
            This will replace the current database.
          </p>
          <div className="d-flex gap-2">
            <input
              type="text"
              value={restoreConfirmText}
              onChange={(e) => setRestoreConfirmText(e.target.value)}
              placeholder="Type RESTORE to confirm"
              className="form-control"
            />
            <Button
              variant="danger"
              disabled={restoreConfirmText !== 'RESTORE'}
              onClick={() => doRestore(pendingRestore)}
            >
              Confirm Restore
            </Button>
            <Button variant="secondary" onClick={() => setPendingRestore(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <ToastContainer />
    </Container>
  );
};

export default AdminMaintenanceClient;
