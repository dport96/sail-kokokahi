/* eslint-disable react/require-default-props */

'use client';

import { useState, useEffect } from 'react';
import { Button, DropdownButton, Row, Col } from 'react-bootstrap';
import swal from 'sweetalert';
import { deleteEvent } from '@/lib/dbActions'; // Ensure this is client-safe
import React from 'react';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import Modal from '@mui/material/Modal';
import { RuntimeQRCode } from './RuntimeQRCode';

export const EventList = ({
  events,
  onManageAttendance,
  onManageSignup,
  showAttendanceButton = false,
  showSignupButton = false,
}: {
  events: any[];
  onManageAttendance?: (event: any) => void;
  onManageSignup?: (event: any) => void;
  showAttendanceButton?: boolean;
  showSignupButton?: boolean;
}) => {
  const [eventList, setEventList] = useState(events);
  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const { data: session } = useSession();

  // Update local state when props change
  useEffect(() => {
    setEventList(events);
  }, [events]);

  const handleDelete = async () => {
    if (selectedEventId === null) return;
    console.log(`Deleting event with ID: ${selectedEventId}`);
    try {
      await deleteEvent(selectedEventId);
      setEventList((prev) => prev.filter((event) => event.id !== selectedEventId));
      swal('Success', 'Your event has been deleted', 'success', { timer: 2000 });
      setSelectedEventId(null); // Reset selected ID
      setOpen(false); // Close modal
    } catch (error) {
      console.error('Delete event error:', error);
      swal('Error', 'Failed to delete event', 'error');
    }
  };

  const sortedEvents = eventList.sort((a, b) => {
    // Parse MM/DD/YYYY format properly
    const parseEventDate = (dateString: string) => {
      const [month, day, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day);
    };

    const dateA = parseEventDate(a.date).getTime();
    const dateB = parseEventDate(b.date).getTime();
    return dateA - dateB;
  });

  // Function to get QR URL (moved from hook since we need it in callbacks)
  const getQRUrl = (event: any) => {
    const eventIdentifier = `EVENT-${event.date.replace(/\//g, '')}-${event.title.trim().replace(/\s+/g, '-')}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    return `${baseUrl}/event-check-in/${eventIdentifier}`;
  };

  return (
    <>
      {sortedEvents.map((event) => (
        <Row key={event.id} className="border p-3">
          <div className="mb-1">
            <h4 style={{ float: 'left' }}>{event.date}</h4>
            <Button
              variant="primary"
              style={{ float: 'right' }}
              onClick={async () => {
                const qrUrl = getQRUrl(event);
                try {
                  // Generate QR code via API
                  const response = await fetch(`/api/generate-qr?url=${encodeURIComponent(qrUrl)}`);
                  const data = await response.json();

                  if (data.qrCode) {
                    const printWindow = window.open('', '', 'height=600,width=800');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Print QR Code</title>
                            <style>
                              body {
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                                height: 100%;
                                margin: 0;
                              }
                              h3 {
                                text-align: center;
                              }
                              img {
                                display: block;
                                margin: 20px auto;
                              }
                            </style>
                          </head>
                          <body>
                            <div>
                              <h3>QR Code for Event: ${event.title}</h3>
                              <p><strong>URL:</strong> ${qrUrl}</p>
                              <img src="${data.qrCode}" alt="QR Code" style="width:400px;height:400px;" />
                            </div>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.onload = () => printWindow.print();
                    }
                  }
                } catch (error) {
                  console.error('Error generating QR for print:', error);
                }
              }}
            >
              Print QR Code
            </Button>
          </div>
          <div>
            <h5 style={{ float: 'left' }}>{event.title}</h5>
            <div style={{ float: 'right' }}>
              <Button
                variant="outline-success"
                size="sm"
                className="me-2"
                onClick={() => {
                  // Create URL with event data for duplication
                  const params = new URLSearchParams({
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    hours: event.hours.toString(),
                    time: event.time,
                    signupReq: event.signupReq.toString(),
                  });
                  window.location.href = `/add-event?duplicate=true&${params.toString()}`;
                }}
                title="Duplicate this event"
              >
                📋 Duplicate
              </Button>
              {showAttendanceButton && onManageAttendance && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => onManageAttendance(event)}
                  disabled={(() => {
                    const currentRole = (session?.user as any)?.role;
                    return currentRole && currentRole !== Role.USER;
                  })()}
                  title="Manage event attendance"
                >
                  👥 Attendance
                </Button>
              )}
              {showSignupButton && event.signupReq && onManageSignup && (
                <Button
                  variant="outline-success"
                  size="sm"
                  className="me-2"
                  onClick={() => onManageSignup(event)}
                  disabled={(() => {
                    const currentRole = (session?.user as any)?.role;
                    return currentRole && currentRole !== Role.USER;
                  })()}
                  title="Manage event signups"
                >
                  📝 Signup
                </Button>
              )}
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => {
                  setSelectedEventId(event.id);
                  setOpen(true);
                }}
                title="Delete this event"
              >
                🗑️ Delete
              </Button>
            </div>
            <Modal open={open} onClose={() => setOpen(false)}>
              <div
                style={{
                  borderRadius: '15px',
                  textAlign: 'justify',
                  background: 'white',
                  padding: '20px',
                  margin: '10% auto',
                  width: '50%',
                  height: 'auto',
                }}
              >
                <h1 className="fw-bold">Delete Event</h1>
                <hr />
                <p className="text-center">
                  Are you sure you want to delete this event? This action is not reversible.
                </p>
                <div className="d-flex flex-column align-items-center mt-4">
                  <Button variant="danger" onClick={handleDelete}>
                    Delete Event
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
          <Col>
            <DropdownButton title="Information" variant="light">
              <p className="p-1">
                Time:
                {' '}
                {event.time}
                <br />
                Potential Hours:
                {' '}
                {event.hours}
                <br />
                Description:
                {' '}
                {event.description}
              </p>
            </DropdownButton>
            <div className="mt-2 mb-2">
              <small className="text-muted">
                <strong>QR URL:</strong>
                {' '}
                {getQRUrl(event)}
              </small>
            </div>
            <RuntimeQRCode event={event} fluid />
          </Col>
        </Row>
      ))}
    </>
  );
};

export default EventList;
