// pages/_app.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';

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

  return <Component {...pageProps} />;
}

export default MyApp;
