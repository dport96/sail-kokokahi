// pages/_app.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import '../app/globals.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Providers from '../app/providers';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Import Bootstrap JS dynamically on the client side
    const loadBootstrap = async () => {
      try {
        await import('bootstrap/dist/js/bootstrap.bundle.min');
      } catch (err) {
        console.error('Error loading Bootstrap:', err);
      }
    };

    loadBootstrap();
  }, []);

  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}

export default MyApp;
