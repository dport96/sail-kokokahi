import ChangePasswordClient from './ChangePasswordClient';

export const dynamic = 'force-dynamic';

/** Server wrapper page: forces dynamic rendering and renders the client change-password component. */
export default function ChangePasswordPage() {
  return <ChangePasswordClient />;
}
