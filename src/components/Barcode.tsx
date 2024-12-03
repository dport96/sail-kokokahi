'use client';

import dynamic from 'next/dynamic';

const Barcode = dynamic(() => import('react-barcode'), { ssr: false });

const BarcodeTest = () => (
  <div>
    <Barcode value="TEST-BARCODE" />
  </div>
);

export default BarcodeTest;
