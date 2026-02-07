import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function Reports() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: salesReport } = useQuery({
    queryKey: ['salesReport', month, year],
    queryFn: () =>
      api
        .get('/reports/sales/monthly', {
          params: { month, year },
        })
        .then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-japanese-charcoal">Reports</h1>
          <p className="text-gray-500">Analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="input"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{salesReport?.totalOrders || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-japanese-matcha">
            Rp {(salesReport?.totalRevenue || 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Average Order</p>
          <p className="text-2xl font-bold">
            Rp {(salesReport?.averageOrderValue || 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">
            {salesReport?.byStatus?.cancelled || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
