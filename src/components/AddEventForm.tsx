'use client';

import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { addEvent } from '@/lib/dbActions';
import { AddEventSchema } from '@/lib/validationSchemas';

const onSubmit = async (data: {
  title: string;
  description: string;
  date: string;
  location: string;
  hours: number;
  time: string;
}) => {
  // console.log(`onSubmit data: ${JSON.stringify(data, null, 2)}`);
  await addEvent(data);
  swal('Success', 'Your event has been added', 'success', {
    timer: 2000,
  });
};

const AddEventForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AddEventSchema),
  });

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
                      <Form.Label>Date (Enter in MM/DD format)</Form.Label>
                      <input
                        type="text"
                        {...register('date')}
                        className={`form-control ${errors.date ? 'is-invalid' : ''}`}
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
                      <Form.Label>Time (Enter in HH:MM[AM/PM] format)</Form.Label>
                      <input
                        type="text"
                        {...register('time')}
                        className={`form-control ${errors.time ? 'is-invalid' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.time?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Hours</Form.Label>
                      <input
                        type="number"
                        {...register('hours')}
                        className={`form-control ${errors.hours ? 'is-invalid' : ''}`}
                      />
                      <div className="invalid-feedback">{errors.hours?.message}</div>
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
