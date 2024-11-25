import React, { useEffect, useState } from 'react';

interface BillingRecord {
  date: string;
  amount: number;
  description: string;
}

const BillingInfo: React.FC = () => {
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);

  useEffect(() => {
    const fetchBillingHistory = async (): Promise<void> => {
      try {
        const res = await fetch('/api/user/billing');
        if (res.ok) {
          const data = await res.json();
          setBillingHistory(data);
        } else {
          console.error('Failed to fetch billing history');
        }
      } catch (err) {
        console.error('Error fetching billing history:', err);
      }
    };

    fetchBillingHistory();
  }, []);

  return (
    <div className="mt-3">
      <h4>Billing History</h4>
      {billingHistory.length === 0 ? (
        <p>No billing history available.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {billingHistory.map((record) => (
              <tr key={`${record.date}-${record.amount}`}>
                <td>{record.date}</td>
                <td>{`$${record.amount.toFixed(2)}`}</td>
                <td>{record.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BillingInfo;
