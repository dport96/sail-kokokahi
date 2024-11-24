export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  emailNotifications: boolean;
  reminders: boolean;
  billingNotifications: boolean;
}

export interface UpdateProfileRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdateNotificationsRequest {
  id: number;
  emailNotifications: boolean;
  reminders: boolean;
  billingNotifications: boolean;
}
