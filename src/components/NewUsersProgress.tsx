'use client';

import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { HOURS_REQUIRED } from '@/lib/constants';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  approvedHours: number;
  pendingHours: number;
  createdAt: Date;
}

interface NewUsersProgressProps {
  users: User[];
}

const NewUsersProgress: React.FC<NewUsersProgressProps> = ({ users }) => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const newUsers = users.filter(user => new Date(user.createdAt) >= oneYearAgo);

  const getProgressBarVariant = (approvedHours: number, percentage: number): string => {
    if (approvedHours >= HOURS_REQUIRED) return 'success';
    if (percentage >= 50) return 'info';
    return 'warning';
  };

  return (
    <>
      {newUsers.map(user => {
        const { approvedHours, pendingHours } = user;
        const progressPercentage = Math.min((approvedHours / HOURS_REQUIRED) * 100, 100);
        const registrationDate = new Date(user.createdAt).toLocaleDateString();

        return (
          <div key={user.id} className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span>
                {user.firstName}
                {' '}
                {user.lastName}
              </span>
              <small className="text-muted">
                Registered:
                {' '}
                {registrationDate}
              </small>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <ProgressBar
                now={progressPercentage}
                label={`${approvedHours} hours`}
                variant={getProgressBarVariant(approvedHours, progressPercentage)}
                className="w-75"
              />
              <span className="ms-2">
                {progressPercentage > 100 ? '100+' : progressPercentage.toFixed(1)}
                %
              </span>
            </div>
            <small className="text-muted">
              Approved:
              {' '}
              {approvedHours}
              {' '}
              hrs | Pending:
              {' '}
              {pendingHours}
              {' '}
              hrs
              {approvedHours >= HOURS_REQUIRED && ' (Complete)'}
            </small>
            <hr />
          </div>
        );
      })}
      {newUsers.length === 0 && (
        <p className="text-center text-muted">
          No users registered within the last year
        </p>
      )}
    </>
  );
};

export default NewUsersProgress;
