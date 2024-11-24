import React, { useState, useEffect } from 'react';

interface Notifications {
  email: boolean;
  reminders: boolean;
  billing: boolean;
}

const NotificationSettings: React.FC = () => {
  const [notifications, setNotifications] = useState<Notifications>({
    email: false,
    reminders: false,
    billing: false,
  });

  useEffect(() => {
    const fetchNotifications = async (): Promise<void> => {
      try {
        const res = await fetch('/api/user/notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, []);

  const handleToggle = async (field: keyof Notifications): Promise<void> => {
    const updated = { ...notifications, [field]: !notifications[field] };
    setNotifications(updated);

    try {
      await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Error updating notifications:', err);
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
          checked={notifications.email}
          onChange={() => handleToggle('email')}
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
