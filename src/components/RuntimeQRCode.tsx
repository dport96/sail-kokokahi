/* eslint-disable react/require-default-props */

'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Image } from 'react-bootstrap';

interface RuntimeQRCodeProps {
  event: {
    id: number;
    title: string;
    date: string;
  };
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  fluid?: boolean;
}

export const RuntimeQRCode = ({
  event,
  alt = 'Event QR Code',
  style,
  className,
  fluid = false,
}: RuntimeQRCodeProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to get the QR URL for the event
  const getQRUrl = (eventData: { title: string; date: string }) => {
    const datePart = eventData.date.replace(/\//g, '');
    const titlePart = eventData.title.trim().replace(/\s+/g, '-');
    const eventIdentifier = `EVENT-${datePart}-${titlePart}`;
    // Use NEXT_PUBLIC_APP_URL first, then fallback to window.location.origin
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    );
    return `${baseUrl}/event-check-in/${eventIdentifier}`;
  };

  // Generate QR code when component mounts or event changes
  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        const qrUrl = getQRUrl(event);
        const dataUrl = await QRCode.toDataURL(qrUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
        setQrDataUrl(null);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [event]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading QR Code...</span>
        </div>
      </div>
    );
  }

  if (!qrDataUrl) {
    return (
      <div className="alert alert-warning" role="alert">
        Failed to generate QR code
      </div>
    );
  }

  return (
    <Image
      src={qrDataUrl}
      alt={alt}
      style={style}
      className={className}
      fluid={fluid}
    />
  );
};

// Hook to get the QR URL (useful for displaying the URL text)
export const useQRUrl = (event: { title: string; date: string }) => {
  const datePart = event.date.replace(/\//g, '');
  const titlePart = event.title.trim().replace(/\s+/g, '-');
  const eventIdentifier = `EVENT-${datePart}-${titlePart}`;
  // Prefer NEXT_PUBLIC_APP_URL, then window origin, NEXTAUTH_URL, then localhost.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'
  );
  return `${baseUrl}/event-check-in/${eventIdentifier}`;
};

export default RuntimeQRCode;
