import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api/client';
import { format } from 'date-fns';

export default function Orders() {
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data: orders } = useQuery({
    queryKey: ['orders', filterStatus],
    queryFn: () =>
      api
        .get('/orders', { params: filterStatus ? { status: filterStatus } : {} })
        .then((res) => res.data),
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'status-new',
      confirmed: 'bg-blue-100 text-blue-800',
      cooking: 'status-cooking',
      ready: 'status-ready',
      served: 'bg-purple-100 text-purple-800',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-japanese-charcoal">Orders</h1>
          <p className="text-gray-500">View and manage all orders</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-48"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="confirmed">Confirmed</option>
          <option value="cooking">Cooking</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-japanese-gray/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-japanese-gray">
            {orders?.map((order: any) => (
              <tr key={order.id} className="hover:bg-japanese-gray/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium">{order.orderNumber}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  {order.orderType.replace('_', '-')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.customerName || 'Walk-in'}
                  {order.tableNumber && (
                    <span className="text-sm text-gray-500 ml-1">
                      (Table {order.tableNumber})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.items?.length || 0} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  Rp {order.totalAmount?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(order.createdAt), 'HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders?.length && (
          <div className="p-8 text-center text-gray-500">No orders found</div>
        )}
      </div>
    </div>
  );
}
