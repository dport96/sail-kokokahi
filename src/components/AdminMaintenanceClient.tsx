'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminMaintenanceClient: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showNewYearConfirm, setShowNewYearConfirm] = useState(false);
  const [newYearConfirmText, setNewYearConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number>(20);
  const [membershipBase, setMembershipBase] = useState<number>(120);
  const [hoursRequired, setHoursRequired] = useState<number>(6);
  const [timeZone, setTimeZone] = useState<string>('Pacific/Honolulu');

  // Common time zones (IANA)
  const COMMON_TIME_ZONES: Array<{ label: string; value: string }> = [
    { label: 'Pacific/Honolulu (Hawaii)', value: 'Pacific/Honolulu' },
    { label: 'America/Anchorage (Alaska)', value: 'America/Anchorage' },
    { label: 'America/Los_Angeles (Pacific)', value: 'America/Los_Angeles' },
    { label: 'America/Denver (Mountain)', value: 'America/Denver' },
    { label: 'America/Chicago (Central)', value: 'America/Chicago' },
    { label: 'America/New_York (Eastern)', value: 'America/New_York' },
    { label: 'UTC', value: 'UTC' },
  ];

  const timeZoneOptions = useMemo(() => {
    const hasCurrent = COMMON_TIME_ZONES.some((tz) => tz.value === timeZone);
    return hasCurrent
      ? COMMON_TIME_ZONES
      : [...COMMON_TIME_ZONES, { label: `${timeZone} (custom)`, value: timeZone }];
  }, [timeZone]);

  // Load application settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const resp = await fetch('/api/admin/settings');
        if (!resp.ok) throw new Error('Failed to fetch settings');
        const data = await resp.json();
        if (typeof data.HOURLY_RATE === 'number') setHourlyRate(data.HOURLY_RATE);
        if (typeof data.MEMBERSHIP_BASE_AMOUNT === 'number') setMembershipBase(data.MEMBERSHIP_BASE_AMOUNT);
        if (typeof data.HOURS_REQUIRED === 'number') setHoursRequired(data.HOURS_REQUIRED);
        if (typeof data.TIME_ZONE === 'string') setTimeZone(data.TIME_ZONE);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load settings');
      } finally {
        setSettingsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setSettingsLoading(true);
      const payload = {
        HOURLY_RATE: hourlyRate,
        MEMBERSHIP_BASE_AMOUNT: membershipBase,
        HOURS_REQUIRED: hoursRequired,
        TIME_ZONE: timeZone,
      };
      const resp = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('Failed to save settings');
      toast.success('Settings saved');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save settings');
    } finally {
      setSettingsLoading(false);
    }
  };

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

  const handleStartNewYear = async () => {
    try {
      setLoading(true);
      toast.info('Starting new year...');

      const res = await fetch('/api/admin/start-new-year', { method: 'POST' });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Failed to start new year');
      }

      const result = await res.json();
      toast.success(
        `New year started! Cleared: ${result.cleared.events} events, ${result.cleared.userEvents} user-event records, ${result.cleared.hoursLogs} logs, reset ${result.cleared.usersReset} members`,
      );

      setShowNewYearConfirm(false);
      setNewYearConfirmText('');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to start new year');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className="fw-bolder pt-3">Admin Maintenance</h1>
      <p className="text-muted">Export database to JSON file, restore from a backup, or start a new year.</p>

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

      <Row className="mb-4">
        <Col md={12}>
          <div className="border border-danger rounded p-3 bg-light">
            <h5 className="text-danger">⚠️ Start New Year</h5>
            <p className="small text-muted">
              Clear all events, member event credits, and logs to begin a fresh year.
            </p>
            <Button
              variant="danger"
              onClick={() => setShowNewYearConfirm(true)}
              disabled={loading}
            >
              Start New Year
            </Button>
          </div>
        </Col>
      </Row>

      {/* Application Settings */}
      <Row className="mb-4">
        <Col md={12}>
          <div className="border rounded p-3">
            <h5>Application Settings</h5>
            <p className="small text-muted">Manage membership calculation values and time zone</p>
            <Row className="g-3">
              <Col sm={4}>
                <Form.Label htmlFor="hourlyRate">Hourly Rate ($/hr)</Form.Label>
                <Form.Control
                  id="hourlyRate"
                  type="number"
                  min={0}
                  step={1}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  disabled={settingsLoading}
                />
              </Col>
              <Col sm={4}>
                <Form.Label htmlFor="membershipBase">Membership Base ($)</Form.Label>
                <Form.Control
                  id="membershipBase"
                  type="number"
                  min={0}
                  step={1}
                  value={membershipBase}
                  onChange={(e) => setMembershipBase(Number(e.target.value))}
                  disabled={settingsLoading}
                />
              </Col>
              <Col sm={4}>
                <Form.Label htmlFor="hoursRequired">Hours Required</Form.Label>
                <Form.Control
                  id="hoursRequired"
                  type="number"
                  min={0}
                  step={1}
                  value={hoursRequired}
                  onChange={(e) => setHoursRequired(Number(e.target.value))}
                  disabled={settingsLoading}
                />
              </Col>
              <Col sm={8}>
                <Form.Label htmlFor="timeZone">Time Zone</Form.Label>
                <Form.Select
                  id="timeZone"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  disabled={settingsLoading}
                >
                  {timeZoneOptions.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <div className="mt-3">
              <Button variant="primary" onClick={saveSettings} disabled={settingsLoading}>
                {settingsLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
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

      {showNewYearConfirm && (
        <div className="mt-3 p-3 border border-danger rounded bg-light">
          <h5 className="text-danger">⚠️ Confirm Start New Year</h5>
          <p className="small text-danger fw-bold">
            This will permanently delete:
          </p>
          <ul className="small text-danger">
            <li>All events</li>
            <li>All user-event associations</li>
            <li>All hours logs</li>
            <li>Reset all member approved and pending hours to 0</li>
          </ul>
          <p className="small">
            Type
            {' '}
            <strong>START NEW YEAR</strong>
            {' '}
            below to confirm:
          </p>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              value={newYearConfirmText}
              onChange={(e) => setNewYearConfirmText(e.target.value)}
              placeholder="Type START NEW YEAR to confirm"
              disabled={loading}
            />
            <Button
              variant="danger"
              disabled={newYearConfirmText !== 'START NEW YEAR' || loading}
              onClick={handleStartNewYear}
            >
              {loading ? 'Starting...' : 'Confirm'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowNewYearConfirm(false);
                setNewYearConfirmText('');
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
