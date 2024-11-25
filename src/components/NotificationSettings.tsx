'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Notifications {
  emailNotifications: boolean;
  reminders: boolean;
  billing: boolean;
}

const NotificationSettings: React.FC = () => {
  const { data: session } = useSession(); // Use NextAuth to get the current user session
  const userEmail = session?.user?.email; // Get the email of the logged-in user

  const [notifications, setNotifications] = useState<Notifications>({
    emailNotifications: false,
    reminders: false,
    billing: false,
  });

  useEffect(() => {
    if (userEmail) {
      const fetchNotifications = async (): Promise<void> => {
        try {
          const res = await fetch(`/api/user/notifications?email=${userEmail}`);
          if (res.ok) {
            const data = await res.json();
            console.log('Fetched notifications:', data);
            setNotifications(data);
          } else {
            console.error(`Failed to fetch notifications. Status: ${res.status}`);
          }
        } catch (err) {
          console.error('Error fetching notifications:', err);
        }
      };

      fetchNotifications();
    } else {
      console.error('No user email found in session');
    }
  }, [userEmail]); // Trigger fetch whenever the userEmail changes

  const handleToggle = async (field: keyof Notifications): Promise<void> => {
    const updated = { ...notifications, [field]: !notifications[field] };
    setNotifications(updated);

    if (userEmail) {
      try {
        const res = await fetch('/api/user/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            emailNotifications: updated.emailNotifications,
            reminders: updated.reminders,
            billing: updated.billing,
          }),
        });

        if (res.ok) {
          console.log(`Successfully updated ${field}`);
        } else {
          console.error(`Failed to update notifications. Status: ${res.status}`);
        }
      } catch (err) {
        console.error(`Error updating ${field} notification:`, err);
      }
    } else {
      console.error('No user email found in session for update');
    }
  };

  return (
    <div className="mt-3">
      <h4>Notification Preferences</h4>
      <div className="form-check">
        <input
          type="checkbox"
          id="email-notifications"
          className="form-check-input"
          checked={notifications.emailNotifications}
          onChange={() => handleToggle('emailNotifications')}
        />
        <label htmlFor="email-notifications" className="form-check-label">
          Email Notifications
        </label>
      </div>
      <div className="form-check">
        <input
          type="checkbox"
          id="event-reminders"
          className="form-check-input"
          checked={notifications.reminders}
          onChange={() => handleToggle('reminders')}
        />
        <label htmlFor="event-reminders" className="form-check-label">
          Event Reminders
        </label>
      </div>
      <div className="form-check">
        <input
          type="checkbox"
          id="billing-alerts"
          className="form-check-input"
          checked={notifications.billing}
          onChange={() => handleToggle('billing')}
        />
        <label htmlFor="billing-alerts" className="form-check-label">
          Billing Alerts
        </label>
      </div>
    </div>
  );
};

export default NotificationSettings;
