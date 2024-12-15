import React from 'react';
import { ProgressBar, Row, Col } from 'react-bootstrap';

const EventProgressBar = ({
  value,
  total,
  label,
}: {
  value: number;
  total: number;
  label: string;
}) => {
  const percentage = ((value / total) * 100).toFixed(2);

  return (
    <Row className="mb-2">
      <Col xs={12}>
        <div className="mb-1">{label}</div>
        <ProgressBar now={parseFloat(percentage)} label={`${percentage}%`} />
        <small className="text-muted">{`${value} / ${total}`}</small>
      </Col>
    </Row>
  );
};

export default EventProgressBar;
