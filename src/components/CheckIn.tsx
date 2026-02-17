'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Col, DropdownButton, Row, Container } from 'react-bootstrap';
import swal from 'sweetalert';
import { normalizeEventDate } from '@/lib/date';

interface Event {
  id: number;
  date: string;
  title: string;
  time: string;
  hours: number;
  description: string;
}

interface CheckInProps {
  event: Event;
  isAlreadyCheckedIn: boolean;
  timeZone?: string;
}

export default function CheckInComponent({ event, isAlreadyCheckedIn, timeZone = 'UTC' }: CheckInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkedInStatus, setCheckedInStatus] = useState(isAlreadyCheckedIn);
  const [statusLoading, setStatusLoading] = useState(true);
  const [isEventToday, setIsEventToday] = useState(true);

  // Function to check if event is today (using the configured timezone)
  const checkIfEventToday = useCallback(() => {
    // Parse event date (MM/DD/YYYY format) with zero-padded components
    const normalizedEventDate = normalizeEventDate(event.date);
    if (!normalizedEventDate) {
      return false;
    }

    const [year, month, day] = normalizedEventDate.split('-');
    const eventDate = new Date(Number(year), Number(month) - 1, Number(day));
    
    // Get today's date in the configured timezone
    const now = new Date();
    const todayFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    const todayParts = todayFormatter.formatToParts(now);
    const todayMap = new Map(todayParts.map(part => [part.type, part.value]));
    const todayYear = Number(todayMap.get('year'));
    const todayMonth = Number(todayMap.get('month'));
    const todayDay = Number(todayMap.get('day'));
    const today = new Date(todayYear, todayMonth - 1, todayDay);
    
    // Set time to midnight for accurate date comparison
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return eventDate.getTime() === today.getTime();
  }, [event.date, timeZone]);

  // Function to check current check-in status
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/check-status?eventId=${event.id}`);
      const result = await response.json();

      if (response.ok) {
        setCheckedInStatus(result.isCheckedIn);
      } else {
        console.error('Failed to check status:', result.message);
        // Fall back to the server-side prop
        setCheckedInStatus(isAlreadyCheckedIn);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      // Fall back to the server-side prop
      setCheckedInStatus(isAlreadyCheckedIn);
    } finally {
      setStatusLoading(false);
    }
  }, [event.id, isAlreadyCheckedIn]);

  // Check status when component mounts
  useEffect(() => {
    checkStatus();
    setIsEventToday(checkIfEventToday());
  }, [checkStatus, checkIfEventToday]);

  const handleCheckIn = async (eventId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const result = await response.json();

      if (response.ok) {
        swal('Success', 'Successfully checked in!', 'success');
        // Update the status immediately after successful check-in
        setCheckedInStatus(true);
      } else {
        throw new Error(result.message || 'Check-in failed');
      }
    } catch (error) {
      console.error(error);
      swal('Error', error instanceof Error ? error.message : 'An error occurred during check-in', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <div className="mb-3">
            <h1 className="fw-bolder pt-3">Event Check In</h1>
            <Row className="border p-3">
              <h4>{event.date}</h4>
              <h5>{event.title}</h5>
              <Col>
                <DropdownButton title="Information" variant="light" className="mb-2">
                  <div className="p-3">
                    <p>
                      Time:
                      {event.time}
                    </p>
                    <p>
                      Potential Hours:
                      {event.hours}
                    </p>
                    <p>
                      Description:
                      {event.description}
                    </p>
                  </div>
                </DropdownButton>
                {statusLoading && (
                  <Button variant="secondary" disabled className="mb-2">
                    Checking status...
                  </Button>
                )}
                {!statusLoading && checkedInStatus && (
                  <div>
                    <Button
                      variant="success"
                      disabled
                      className="mb-2"
                    >
                      ✓ Already Checked In
                    </Button>
                    <p className="text-success small">
                      You have already checked in for this event.
                    </p>
                  </div>
                )}
                {!statusLoading && !checkedInStatus && !isEventToday && (
                  <div>
                    <Button
                      variant="danger"
                      disabled
                      className="mb-2"
                    >
                      Check-in Unavailable
                    </Button>
                    <p className="text-danger small">
                      Check-in is only allowed on the day of the event ({event.date}).
                    </p>
                  </div>
                )}
                {!statusLoading && !checkedInStatus && isEventToday && (
                  <Button
                    onClick={() => handleCheckIn(event.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Checking in...' : 'Check In'}
                  </Button>
                )}
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
