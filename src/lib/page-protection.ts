import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';

/**
 * Session type with mustChangePassword flag
 */
export type ProtectedSession = {
  user: {
    email: string;
    id: string;
    randomKey: string;
    mustChangePassword?: boolean;
  };
};

/**
 * Checks if user must change their password and redirects to change-password page if needed.
 * Returns true if redirected, false otherwise.
 */
export const checkMustChangePassword = (
  session: ProtectedSession | null,
  currentPath: string,
): boolean => {
  if (session?.user?.mustChangePassword) {
    // Redirect to change password with the current path as callbackUrl
    // so they return to the intended page after changing their password
    redirect(`/auth/change-password?callbackUrl=${encodeURIComponent(currentPath)}`);
  }
  return false;
};

/**
 * Redirects to the login page if the user is not logged in.
 */
export const loggedInProtectedPage = (
  session: ProtectedSession | null,
  callbackUrl?: string,
) => {
  if (!session) {
    if (callbackUrl) {
      redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    redirect('/auth/signin');
  }
};

/**
 * Redirects to the login page if the user is not logged in.
 * Redirects to the not-authorized page if the user is not an admin.
 */
export const adminProtectedPage = (session: ProtectedSession | null) => {
  loggedInProtectedPage(session);
  if (session && session.user.randomKey !== Role.ADMIN) {
    redirect('/not-authorized');
  }
};

export const memberProtectedPage = (session: ProtectedSession | null) => {
  loggedInProtectedPage(session);
  if (session && session.user.randomKey !== Role.USER) {
    redirect('/not-authorized');
  }
};
