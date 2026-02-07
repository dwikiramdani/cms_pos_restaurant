import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function Payments() {
  const [date, setDate] Date().toISO = useState(newString().split('T')[0]);

  const { data: summary } = useQuery({
    queryKey: ['paymentSummary', date],
    queryFn: () =>
      api
        .get('/payments/summary/daily', { params: { date } })
        .then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-japanese-charcoal">Payments</h1>
          <p className="text-gray-500">Payment transactions and summaries</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input w-48"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-2xl font-bold">{summary?.totalTransactions || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-japanese-matcha">
            Rp {(summary?.totalAmount || 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Tips</p>
          <p className="text-2xl font-bold">Rp {(summary?.totalTip || 0).toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Refunds</p>
          <p className="text-2xl font-bold text-red-600">
            Rp {(summary?.totalRefunds || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
