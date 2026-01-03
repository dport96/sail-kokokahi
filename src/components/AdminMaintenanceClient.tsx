'use client';

import React, { useState, useRef } from 'react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminMaintenanceClient: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    try {
      setLoading(true);
      toast.info('Creating backup...');
      
      const res = await fetch('/api/admin/backup');
      if (!res.ok) throw new Error('Backup failed');
      
      // Download the file
      const blob = await res.blob();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `sail-kokokahi-backup-${timestamp}.json`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Backup downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Backup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        toast.error('Please select a valid JSON backup file');
        return;
      }
      setSelectedFile(file);
      setShowRestoreConfirm(true);
      setRestoreConfirmText('');
    }
  };

  const doRestore = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      toast.info('Restoring backup...');
      
      const text = await selectedFile.text();
      const backup = JSON.parse(text);
      
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Restore failed');
      }
      
      const result = await res.json();
      toast.success(`Restore completed: ${result.restored.users} users, ${result.restored.events} events`);
      
      setShowRestoreConfirm(false);
      setSelectedFile(null);
      setRestoreConfirmText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Restore failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className="fw-bolder pt-3">Admin Maintenance</h1>
      <p className="text-muted">Export database to JSON file or restore from a backup file.</p>

      <Row className="mb-4">
        <Col md={6}>
          <div className="border rounded p-3">
            <h5>Create Backup</h5>
            <p className="small text-muted">Export all database data to a JSON file</p>
            <Button variant="primary" onClick={handleBackup} disabled={loading}>
              Download Backup
            </Button>
          </div>
        </Col>
        
        <Col md={6}>
          <div className="border rounded p-3">
            <h5>Restore Backup</h5>
            <p className="small text-muted">Upload a backup file to restore</p>
            <Form.Group>
              <Form.Control
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={loading}
              />
            </Form.Group>
          </div>
        </Col>
      </Row>

      {showRestoreConfirm && selectedFile && (
        <div className="mt-3 p-3 border border-danger rounded bg-light">
          <h5 className="text-danger">⚠️ Confirm Restore</h5>
          <p className="small text-muted">
            You are about to restore from
            {' '}
            <strong>{selectedFile.name}</strong>
            .
            {' '}
            <span className="text-danger fw-bold">This will DELETE ALL current data and replace it with the backup.</span>
          </p>
          <p className="small">
            Type
            {' '}
            <strong>RESTORE</strong>
            {' '}
            below to confirm:
          </p>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              value={restoreConfirmText}
              onChange={(e) => setRestoreConfirmText(e.target.value)}
              placeholder="Type RESTORE to confirm"
              disabled={loading}
            />
            <Button
              variant="danger"
              disabled={restoreConfirmText !== 'RESTORE' || loading}
              onClick={doRestore}
            >
              {loading ? 'Restoring...' : 'Confirm Restore'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowRestoreConfirm(false);
                setSelectedFile(null);
                setRestoreConfirmText('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <ToastContainer />
    </Container>
  );
};

export default AdminMaintenanceClient;
