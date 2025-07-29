'use client';

import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import SortableTable from '@/components/SortableTable';
import EventProgressBar from '@/components/EventProgressBar';

const EventsAnalytics = ({ events }: { events: any[] }) => {
  const [sortKey, setSortKey] = useState('eventName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    setSortKey(key);
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (sortOrder === 'asc') return a[sortKey] > b[sortKey] ? 1 : -1;
    return a[sortKey] < b[sortKey] ? 1 : -1;
  });

  return (
    <Container>
      <h1 className="fw-bolder pt-3">Event Analytics</h1>
      <hr />
      <SortableTable
        data={sortedEvents}
        columns={[
          { key: 'eventName', label: 'Event Name' },
          { key: 'signupCount', label: 'Member Signups' },
          { key: 'attendanceCount', label: 'Member Attendance' },
          { key: 'status', label: 'Status' },
        ]}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        renderRow={(event) => (
          <tr key={event.id}>
            <td>
              <div>
                <div className="fw-bold">{event.eventName}</div>
                <div className="text-muted small">{event.eventDate}</div>
              </div>
            </td>
            <td>
              <EventProgressBar
                value={event.signupCount}
                total={event.totalUsers}
                label={`Member Signups (${event.signupCount} of ${event.totalUsers} total members)`}
              />
            </td>
            <td>
              <EventProgressBar
                value={event.attendanceCount}
                total={event.totalUsers}
                label={`Members who Attended (${event.attendanceCount} of ${event.totalUsers} total members)`}
              />
            </td>
            <td>
              {event.isUserSignedUp && (
                <span className="badge bg-success">Signed Up</span>
              )}
            </td>
          </tr>
        )}
      />
    </Container>
  );
};

export default EventsAnalytics;
