'use client';

import { useState } from 'react';
import { Button, DropdownButton, Image, Row, Col } from 'react-bootstrap';
import swal from 'sweetalert';
import { deleteEvent } from '@/lib/dbActions'; // Ensure this is client-safe

export const EventList = ({ events }: { events: any[] }) => {
  const [eventList] = useState(events);

  const handleDelete = async (id: number) => {
    try {
      await deleteEvent(id);
      swal('Success', 'Your event has been deleted', 'success', { timer: 2000 });
    } catch (error) {
      swal('Error', 'Failed to delete event', 'error');
    }
  };

  return (
    <>
      {eventList.map((event) => (
        <Row key={event.id} className="border p-3">
          <h4>{event.date}</h4>
          <div>
            <h5 style={{ float: 'left' }}>{event.title}</h5>
            <Button
              variant="danger"
              style={{ float: 'right' }}
              onClick={() => handleDelete(event.id)}
            >
              Delete Event
            </Button>
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
