import SignInClient from './SignInClient';

export const dynamic = 'force-dynamic';

/** Server wrapper page: forces dynamic rendering and renders the client sign-in component. */
export default function SignInPage() {
  return <SignInClient />;
}
