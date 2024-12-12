'use client';

import React from 'react';
import { ProgressBar } from 'react-bootstrap';

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

  const getProgressBarVariant = (totalHours: number, percentage: number): string => {
    if (totalHours >= 6) return 'success';
    if (percentage >= 50) return 'info';
    return 'warning';
  };

  return (
    <>
      {newUsers.map(user => {
        const totalHours = user.approvedHours + user.pendingHours;
        const progressPercentage = Math.min((totalHours / 6) * 100, 100);
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
                label={`${totalHours} hours`}
                variant={getProgressBarVariant(totalHours, progressPercentage)}
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
              {user.approvedHours}
              {' '}
              hrs | Pending:
              {' '}
              {user.pendingHours}
              {' '}
              hrs
              {totalHours >= 6}
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
