'use client';

import { useState } from 'react';
import { Button, DropdownButton, Image, Row, Col } from 'react-bootstrap';
import swal from 'sweetalert';
import { deleteEvent } from '@/lib/dbActions'; // Ensure this is client-safe
import React from 'react';
import Modal from '@mui/material/Modal';

export const EventList = ({ events }: { events: any[] }) => {
  const [eventList, setEventList] = useState(events);
  const [open, setOpen] = React.useState(false);

  const handleDelete = async (id: number) => {
    console.log(`Deleting event with ID: ${id}`);
    try {
      await deleteEvent(id);
      setEventList((prev) => prev.filter((event) => event.id !== id));
      swal('Success', 'Your event has been deleted', 'success', { timer: 2000 });
    } catch (error) {
      console.error('Delete event error:', error);
      swal('Error', 'Failed to delete event', 'error');
    }
  };

  const handlePrint = (event: any) => {
    const printWindow = window.open('', '', 'height=600,width=800');

    // Check if printWindow is not null
    if (printWindow) {
      const qrImageUrl = event.qr;

      // Set up the content to be printed using template literals
      printWindow.document.write('<html><head><title>Print QR Code</title>');
      // Include CSS to center the content
      printWindow.document.write(`
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .content {
            text-align: center;
          }
          img {
            width: 400px;
            height: 400px;
          }
        </style>
      `);
      printWindow.document.write('</head><body>');
      printWindow.document.write(`
        <div class="content">
          <h3>QR Code for Event: ${event.title}</h3>
          <img src="${qrImageUrl}" alt="QR Code"/>
        </div>
      `);
      printWindow.document.write('</body></html>');

      // Wait for the content to be fully loaded and then trigger the print
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      console.error('Failed to open print window');
    }
  };

  return (
    <>
      {eventList.map((event) => (
        <Row key={event.id} className="border p-3">
          <div className="mb-1">
            <h4 style={{ float: 'left' }}>{event.date}</h4>
            <Button
              variant="primary"
              style={{ float: 'right' }}
              onClick={() => handlePrint(event)}
            >
              Print QR Code
            </Button>
          </div>
          <div>
            <h5 style={{ float: 'left' }}>{event.title}</h5>
            <Button
              variant="danger"
              style={{ float: 'right' }}
              onClick={() => setOpen(true)}
            >
              Delete Event
            </Button>
            <Modal open={open} onClose={() => setOpen(false)}>
              <div style={{
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
                  Are you sure you want to delete this event? This action is not reversable.
                </p>
                <div className="d-flex flex-column align-items-center mt-4">
                  <Button
                    variant="danger"
                    style={{ float: 'right' }}
                    onClick={() => handleDelete(event.id)}
                  >
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
                <br />
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
