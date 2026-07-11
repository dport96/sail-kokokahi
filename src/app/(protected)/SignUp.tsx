'use client';

import { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import swal from 'sweetalert';

interface Event {
  id: number;
  date: string;
  title: string;
  time: string;
  signupReq: boolean;
  hours: number;
  description: string;
  isSignedUp?: boolean;
  isCheckedIn?: boolean;
  signupNotes?: string | null;
}

interface EventsSignUpProps {
  events: Event[];
  timeZone?: string;
}

const SignUp = ({ events, timeZone = 'UTC' }: EventsSignUpProps) => {
  const [eventList, setEventList] = useState<Event[]>(events);
  const [signupNotes, setSignupNotes] = useState<Record<number, string>>({});
  const { data: session } = useSession();
  const router = useRouter();

  const isCheckInOpen = (event: Event) => {
    const dateParts = event.date.trim().split('/').map(Number);
    if (dateParts.length !== 3 || dateParts.some(Number.isNaN)) {
      return false;
    }

    const [eventMonth, eventDay, eventYear] = dateParts;

    const todayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const todayParts = todayFormatter.formatToParts(new Date());
    const todayMap = new Map(todayParts.map((part) => [part.type, part.value]));

    const todayYear = Number(todayMap.get('year'));
    const todayMonth = Number(todayMap.get('month'));
    const todayDay = Number(todayMap.get('day'));

    if (todayYear !== eventYear || todayMonth !== eventMonth || todayDay !== eventDay) {
      return false;
    }

    const parsedTime = event.time.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (!parsedTime) {
      return false;
    }

    let eventHour = Number(parsedTime[1]);
    const eventMinute = Number(parsedTime[2]);
    const meridiem = parsedTime[3].toUpperCase();

    if (meridiem === 'PM' && eventHour !== 12) eventHour += 12;
    if (meridiem === 'AM' && eventHour === 12) eventHour = 0;

    const nowFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const nowParts = nowFormatter.formatToParts(new Date());
    const nowMap = new Map(nowParts.map((part) => [part.type, part.value]));
    const nowHour = Number(nowMap.get('hour'));
    const nowMinute = Number(nowMap.get('minute'));

    const eventTotalMinutes = (eventHour * 60) + eventMinute;
    const nowTotalMinutes = (nowHour * 60) + nowMinute;

    return nowTotalMinutes >= eventTotalMinutes;
  };

  const handleSignUp = async (eventId: number, notes: string) => {
    try {
      const response = await fetch('/api/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, notes }),
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.message || 'Failed to sign up for the event');
      }

      const result = await response.json().catch(() => ({}));

      setEventList((prevEvents) => prevEvents.map((event) => (
        event.id === eventId
          ? {
            ...event,
            isSignedUp: true,
            signupNotes: result?.userEvent?.notes ?? (notes.trim() || null),
          }
          : event
      )));
      setSignupNotes((prev) => ({ ...prev, [eventId]: '' }));
      swal('Successfully signed up for the event');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up for the event';
      swal(errorMessage);
    }
  };

  const handleUnregister = async (eventId: number) => {
    if (!session?.user?.id) {
      swal('Please sign in again to unregister from the event');
      return;
    }

    try {
      const response = await fetch(
        `/api/events/${eventId}/attendees?userId=${Number(session.user.id)}`,
        { method: 'DELETE' },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Failed to unregister from the event');
      }

      setEventList((prevEvents) => prevEvents.map((event) => (
        event.id === eventId
          ? { ...event, isSignedUp: false, signupNotes: null }
          : event
      )));
      swal('Successfully unregistered from the event');
    } catch (error) {
      console.error(error);
      swal('Failed to unregister from the event');
    }
  };

  // Helper function to parse MM/DD/YYYY date format
  const formatToday = () => {
    const now = new Date();
    const todayFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const todayParts = todayFormatter.formatToParts(now);
    const todayMap = new Map(todayParts.map((part) => [part.type, part.value]));
    return `${todayMap.get('month')}/${todayMap.get('day')}/${todayMap.get('year')}`;
  };

  useEffect(() => {
    setEventList(events);
  }, [events]);

  const visibleEvents = eventList.filter((event) => {
    const today = formatToday();
    return event.date.trim() >= today;
  });

  const sortedEvents = [...visibleEvents].sort((a, b) => {
    return a.date.localeCompare(b.date);
  });
  return (
    <div className="mb-3">
      <h1 className="fw-bolder pt-3">EVENTS</h1>
      <h6>To check into an event scan the QR code at the event, open up the link, login and click Check In</h6>
      <hr />
      {sortedEvents.map((event) => (
        <Row key={event.id} className="border p-3">
          <h4>{event.date}</h4>
          <h5>{event.title}</h5>
          <Col>

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
            {event.signupReq && (
              event.isSignedUp ? (
                <>
                  <Button variant="danger" onClick={() => handleUnregister(event.id)}>
                    Unregister
                  </Button>
                  {event.signupNotes && (
                    <div className="mt-2 text-muted">
                      {event.signupNotes}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Button onClick={() => handleSignUp(event.id, signupNotes[event.id] || '')}>Sign Up</Button>
                  <Form.Group className="mt-2" controlId={`signup-notes-${event.id}`}>
                    <Form.Label className="mb-1">Additional notes (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      maxLength={1000}
                      value={signupNotes[event.id] || ''}
                      onChange={(e) => setSignupNotes((prev) => ({
                        ...prev,
                        [event.id]: e.target.value,
                      }))}
                      placeholder="Add any details the organizers should know"
                    />
                  </Form.Group>
                </>
              )
            )}
            {event.isCheckedIn ? (
              <Button className="ms-2" variant="success" disabled>
                Checked In
              </Button>
            ) : (
              isCheckInOpen(event) && (
                <Button
                  className="ms-2"
                  variant="primary"
                  onClick={() => router.push(`/event-check-in/${event.id}`)}
                >
                  Check In
                </Button>
              )
            )}
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default SignUp;
