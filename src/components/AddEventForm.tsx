'use client';

import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DatePicker from 'react-datepicker';
import swal from 'sweetalert';
import { AddEventSchema } from '@/lib/validationSchemas';
import 'react-datepicker/dist/react-datepicker.css';

const AddEventForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AddEventSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      // Format date and time for API
      const formattedData = {
        ...data,
        date: data.date instanceof Date
          ? data.date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })
          : data.date,
        time: data.time instanceof Date
          ? data.time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
          : data.time,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (result.success) {
        swal('Success', 'Event created successfully!', 'success', {
          timer: 2000,
        });
        reset(); // Clear the form
      } else {
        swal('Error', result.message, 'error');
      }
    } catch (error) {
      swal('Error', 'Failed to create event', 'error');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col>
          <Col>
            <h1 className="fw-bolder pt-3">Add Event</h1>
            <hr />
          </Col>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Title</Form.Label>
                      <input
                        type="text"
                        {...register('title')}
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.title?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Date</Form.Label>
                      <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value as Date}
                            onChange={(date) => field.onChange(date)}
                            dateFormat="MM/dd/yyyy"
                            className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                            placeholderText="Select a date"
                            minDate={new Date()}
                            showPopperArrow={false}
                          />
                        )}
                      />
                      <div className="invalid-feedback">{errors.date?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <input
                    type="text"
                    {...register('description')}
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.description?.message}</div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <input
                    type="text"
                    {...register('location')}
                    className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.location?.message}</div>
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Time</Form.Label>
                      <Controller
                        name="time"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value as Date}
                            onChange={(time) => field.onChange(time)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className={`form-control ${errors.time ? 'is-invalid' : ''}`}
                            placeholderText="Select a time"
                            showPopperArrow={false}
                          />
                        )}
                      />
                      <div className="invalid-feedback">{errors.time?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hours</Form.Label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="6"
                        {...register('hours')}
                        className={`form-control ${errors.hours ? 'is-invalid' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.hours?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label />
                      <div className="form-check">
                        <input
                          type="checkbox"
                          {...register('signupReq')}
                          className="form-check-input"
                          id="signupReq"
                        />
                        <label className="form-check-label" htmlFor="signupReq">
                          Sign up required
                        </label>
                      </div>
                      <div className="invalid-feedback">{errors.signupReq?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="form-group">
                  <Row className="pt-3">
                    <Col>
                      <Button type="submit" variant="primary">
                        Submit
                      </Button>
                    </Col>
                    <Col>
                      <Button type="button" onClick={() => reset()} variant="warning" className="float-right">
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddEventForm;
