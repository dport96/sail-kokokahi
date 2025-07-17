'use client';

import React, { useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { EventList } from '@/components/EventList';
import EventAttendanceManager from '@/components/EventAttendanceManager';

interface AdminEventsClientProps {
  upcomingEvents: any[];
  pastEvents: any[];
}

const AdminEventsClient: React.FC<AdminEventsClientProps> = ({
  upcomingEvents,
  pastEvents,
}) => {
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAttendanceManager, setShowAttendanceManager] = useState(false);

  const togglePastEvents = () => {
    setShowPastEvents(!showPastEvents);
  };

  const handleManageAttendance = (event: any) => {
    setSelectedEvent(event);
    setShowAttendanceManager(true);
  };

  const handleCloseAttendanceManager = () => {
    setShowAttendanceManager(false);
    setSelectedEvent(null);
  };

  return (
    <div>
      {/* Controls */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">
            {showPastEvents ? (
              <span className="text-muted">
                📅 Past Events
              </span>
            ) : (
              <span className="text-success">
                🗓️ Current & Upcoming Events
              </span>
            )}
            {' '}
            <span className="badge bg-secondary">
              {showPastEvents ? pastEvents.length : upcomingEvents.length}
            </span>
          </h5>
        </div>
        <Button
          variant={showPastEvents ? 'outline-primary' : 'outline-secondary'}
          onClick={togglePastEvents}
          size="sm"
        >
          {showPastEvents ? (
            <>
              ⬆️ Show Current & Upcoming
            </>
          ) : (
            <>
              ⬇️ Show Past Events
            </>
          )}
        </Button>
      </div>

      {/* Events Display */}
      {showPastEvents ? (
        <div>
          {pastEvents.length > 0 ? (
            <EventList
              events={pastEvents}
              onManageAttendance={handleManageAttendance}
              showAttendanceButton
            />
          ) : (
            <Alert variant="info" className="text-center">
              <h6>📅 No Past Events</h6>
              <p className="mb-0">No past events found in the system.</p>
            </Alert>
          )}
        </div>
      ) : (
        <div>
          {upcomingEvents.length > 0 ? (
            <EventList
              events={upcomingEvents}
              onManageAttendance={handleManageAttendance}
              showAttendanceButton={false}
            />
          ) : (
            <Alert variant="warning" className="text-center">
              <h6>🗓️ No Upcoming Events</h6>
              <p className="mb-0">
                No current or upcoming events scheduled.
                {' '}
                <a href="/add-event" className="alert-link">Create a new event</a>
                {' '}
                to get started.
              </p>
            </Alert>
          )}
        </div>
      )}

      {/* Attendance Manager Modal */}
      {selectedEvent && (
        <EventAttendanceManager
          event={selectedEvent}
          isOpen={showAttendanceManager}
          onClose={handleCloseAttendanceManager}
        />
      )}
    </div>
  );
};

export default AdminEventsClient;
