import authOptions from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function EventRedirectPage(
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const targetPath = `/member-event-sign-up?focusEventId=${encodeURIComponent(eventId)}`;

  const session = await getServerSession(authOptions);

  if (!session) {
    const base = process.env.NEXTAUTH_URL ?? '';
    const callback = `${base}${targetPath}`;
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callback)}`);
  }

  redirect(targetPath);
}
