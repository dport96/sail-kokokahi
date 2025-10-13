/* eslint-disable no-nested-ternary, react/jsx-one-expression-per-line */
/* eslint-disable react/jsx-closing-tag-location, react/jsx-indent */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Button, Modal, Table, Alert, Form, Row, Col } from 'react-bootstrap';
import swal from 'sweetalert';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface EventAttendee {
  id: number;
  userId: number;
  eventId: number;
  attended: boolean;
  User: User;
}

interface Event {
  id: number;
  title: string;
  date: string;
  hours: number;
}

interface EventAttendanceManagerProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  mode: 'attendance' | 'signup'; // Make mode required
}

const EventAttendanceManager: React.FC<EventAttendanceManagerProps> = ({
  event,
  isOpen,
  onClose,
  mode,
}) => {
  const router = useRouter();
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const fetchEventAttendees = useCallback(async () => {
    try {
      setLoading(true);
      // For signup mode, get all signed up users; for attendance mode, get only attended users
      const queryParam = mode === 'signup' ? '?includeAll=true' : '';
      const response = await fetch(`/api/events/${event.id}/attendees${queryParam}`);
      if (response.ok) {
        const data = await response.json();
        setAttendees(data);
      } else {
        console.error('Failed to fetch attendees');
      }
    } catch (error) {
      console.error('Error fetching attendees:', error);
    } finally {
      setLoading(false);
    }
  }, [event.id, mode]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  // Helper to determine current session user's role
  const sessionUserRole = (session?.user as any)?.role as Role | undefined;
  const sessionUserIsNotRegular = !!sessionUserRole && sessionUserRole !== Role.USER;

  // Fetch event attendees and all users when modal opens
  useEffect(() => {
    if (isOpen && event.id) {
      fetchEventAttendees();
      fetchAllUsers();
    }
  }, [isOpen, event.id, fetchEventAttendees, fetchAllUsers]);

  const addUserToEvent = async () => {
    if (!selectedUserId) {
      swal('Error', 'Please select a user to add', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/events/${event.id}/attendees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(selectedUserId, 10),
          attended: mode === 'attendance', // Only mark as attended if in attendance mode
        }),
      });

      if (response.ok) {
        swal('Success', `User ${mode === 'signup' ? 'signed up for' : 'added to'} event successfully`, 'success');
        setSelectedUserId('');
        fetchEventAttendees();
        // Refresh the page to get updated data from server
        setTimeout(() => router.refresh(), 1000);
      } else {
        const error = await response.json();
        swal('Error', error.message || 'Failed to add user to event', 'error');
      }
    } catch (error) {
      console.error('Error adding user to event:', error);
      swal('Error', 'Failed to add user to event', 'error');
    }
  };

  const toggleAttendance = async (attendeeId: number, currentAttended: boolean, userName: string) => {
    const action = currentAttended ? 'mark as registered' : 'mark as attended';
    const confirm = await swal({
      title: 'Change Attendance Status',
      text: `Are you sure you want to ${action} for ${userName}?`,
      icon: 'question',
      buttons: ['Cancel', 'Confirm'],
    });

    if (confirm) {
      try {
        const response = await fetch(`/api/events/${event.id}/attendees/${attendeeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attended: !currentAttended,
          }),
        });

        if (response.ok) {
          swal('Success', `User ${!currentAttended ? 'marked as attended' : 'marked as registered'}`, 'success');
          fetchEventAttendees();
          // Refresh the page to get updated data from server
          setTimeout(() => router.refresh(), 1000);
        } else {
          const error = await response.json();
          swal('Error', error.message || 'Failed to update attendance status', 'error');
        }
      } catch (error) {
        console.error('Error updating attendance status:', error);
        swal('Error', 'Failed to update attendance status', 'error');
      }
    }
  };

  const removeUserFromEvent = async (attendeeId: number, userName: string) => {
    const confirm = await swal({
      title: 'Remove User',
      text: `Are you sure you want to remove ${userName} from this event?`,
      icon: 'warning',
      buttons: ['Cancel', 'Remove'],
      dangerMode: true,
    });

    if (confirm) {
      try {
        const response = await fetch(`/api/events/${event.id}/attendees/${attendeeId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          swal('Success', 'User removed from event successfully', 'success');
          fetchEventAttendees();
          // Refresh the page to get updated data from server
          setTimeout(() => router.refresh(), 1000);
        } else {
          swal('Error', 'Failed to remove user from event', 'error');
        }
      } catch (error) {
        console.error('Error removing user from event:', error);
        swal('Error', 'Failed to remove user from event', 'error');
      }
    }
  };

  // Filter out users who are already attendees
  const availableUsers = allUsers.filter(
    user => !attendees.some(attendee => attendee.userId === user.id),
  );

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'signup' ? 'Manage Event Signups' : 'Manage Attendance'} -
          {' '}
          {event.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <strong>Event:</strong>
          {' '}
          {event.title}
          <br />
          <strong>Date:</strong>
          {' '}
          {event.date}
          <br />
          <strong>Hours:</strong>
          {' '}
          {event.hours}
        </div>

        {/* Add User Section */}
        <div className="mb-4">
          <h6>{mode === 'signup' ? 'Add User to Event Signup' : 'Add User to Event'}</h6>
          <Row>
            <Col md={8}>
              <Form.Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user to add...</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Button
                variant="success"
                onClick={addUserToEvent}
                disabled={!selectedUserId || sessionUserIsNotRegular}
                title={sessionUserIsNotRegular ? 'Admins cannot add users to events' : undefined}
              >
                Add User
              </Button>
            </Col>
          </Row>
        </div>

        {/* Attendees List */}
        <div>
          <h6>
            {mode === 'signup' ? 'Event Signups' : 'Event Attendees'}
            {' '}
            (
            {attendees.length}
            )
          </h6>
          {loading ? (
            <Alert variant="info">Loading attendees...</Alert>
          ) : attendees.length === 0 ? (
            <Alert variant="warning">No attendees found for this event.</Alert>
          ) : (
            <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      {mode === 'signup' && <th>Attended</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map(attendee => (
                      <tr key={attendee.id}>
                        <td>
                          {attendee.User.firstName}
                          {' '}
                          {attendee.User.lastName}
                        </td>
                        <td>{attendee.User.email}</td>
                        <td>
                          <span className={`badge ${attendee.attended ? 'bg-success' : 'bg-warning'}`}>
                            {attendee.attended ? 'Attended' : 'Registered'}
                          </span>
                        </td>
                        {mode === 'signup' && (
                          <td>
                            <label htmlFor={`attendance-${attendee.id}`} className="visually-hidden">
                              Mark {attendee.User.firstName} {attendee.User.lastName} as attended
                            </label>
                            <input
                              id={`attendance-${attendee.id}`}
                              type="checkbox"
                              checked={attendee.attended}
                              onChange={() => toggleAttendance(
                                attendee.id,
                                attendee.attended,
                                `${attendee.User.firstName} ${attendee.User.lastName}`,
                              )}
                              className="form-check-input"
                            />
                          </td>
                        )}
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeUserFromEvent(
                              attendee.id,
                              `${attendee.User.firstName} ${attendee.User.lastName}`,
                            )}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}              </tbody>
            </Table>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EventAttendanceManager;
