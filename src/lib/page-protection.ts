import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';

/**
 * Redirects to the login page if the user is not logged in.
 */
export const loggedInProtectedPage = (
  session: { user: { email: string; id: string; randomKey: string } } | null,
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
export const adminProtectedPage = (session: { user: { email: string; id: string; randomKey: string } } | null) => {
  loggedInProtectedPage(session);
  if (session && session.user.randomKey !== Role.ADMIN) {
    redirect('/not-authorized');
  }
};

export const memberProtectedPage = (session: { user: { email: string; id: string; randomKey: string } } | null) => {
  loggedInProtectedPage(session);
  if (session && session.user.randomKey !== Role.USER) {
    redirect('/not-authorized');
  }
};
