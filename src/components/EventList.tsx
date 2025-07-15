'use client';

import { useState, useEffect } from 'react';
import { Button, DropdownButton, Image, Row, Col } from 'react-bootstrap';
import swal from 'sweetalert';
import { deleteEvent } from '@/lib/dbActions'; // Ensure this is client-safe
import React from 'react';
import Modal from '@mui/material/Modal';

export const EventList = ({ events }: { events: any[] }) => {
  const [eventList, setEventList] = useState(events);
  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

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

  return (
    <>
      {sortedEvents.map((event) => (
        <Row key={event.id} className="border p-3">
          <div className="mb-1">
            <h4 style={{ float: 'left' }}>{event.date}</h4>
            <Button
              variant="primary"
              style={{ float: 'right' }}
              onClick={() => {
                const printWindow = window.open('', '', 'height=600,width=800');
                if (printWindow) {
                  const qrImageUrl = event.qr;
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
                          <img src="${qrImageUrl}" alt="QR Code" style="width:400px;height:400px;" />
                        </div>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.onload = () => printWindow.print();
                }
              }}
            >
              Print QR Code
            </Button>
          </div>
          <div>
            <h5 style={{ float: 'left' }}>{event.title}</h5>
            <Button
              variant="danger"
              style={{ float: 'right' }}
              onClick={() => {
                setSelectedEventId(event.id);
                setOpen(true);
              }}
            >
              Delete Event
            </Button>
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
            <Image src={event.qr} alt="Event QR Code" fluid />
          </Col>
        </Row>
      ))}
    </>
  );
};

export default EventList;
