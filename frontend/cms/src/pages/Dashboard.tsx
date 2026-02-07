import { useQuery } from '@tanstack/react-query';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../api/client';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: todayOrders } = useQuery({
    queryKey: ['todayOrders'],
    queryFn: () => api.get('/orders/today').then((res) => res.data),
  });

  const { data: dailySummary } = useQuery({
    queryKey: ['dailySummary'],
    queryFn: () => api.get('/reports/sales/daily').then((res) => res.data),
  });

  const { data: bestSelling } = useQuery({
    queryKey: ['bestSelling'],
    queryFn: () =>
      api
        .get('/reports/best-selling', {
          params: {
            startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
            endDate: new Date().toISOString(),
          },
        })
        .then((res) => res.data),
  });

  const stats = [
    {
      name: "Today's Revenue",
      value: `Rp ${dailySummary?.totalRevenue?.toLocaleString() || 0}`,
      icon: CurrencyDollarIcon,
      color: 'bg-japanese-matcha/20 text-japanese-matcha',
    },
    {
      name: 'Total Orders',
      value: todayOrders?.length || 0,
      icon: ShoppingCartIcon,
      color: 'bg-japanese-red/10 text-japanese-red',
    },
    {
      name: 'Completed',
      value: todayOrders?.filter((o: any) => o.status === 'completed').length || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-100 text-green-800',
    },
    {
      name: 'Cancelled',
      value: todayOrders?.filter((o: any) => o.status === 'cancelled').length || 0,
      icon: XCircleIcon,
      color: 'bg-red-100 text-red-800',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-japanese-charcoal">Dashboard</h1>
          <p className="text-gray-500">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-japanese-charcoal">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-japanese-charcoal mb-4">
            Recent Orders
          </h2>
          <div className="space-y-3">
            {todayOrders?.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-japanese-gray/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {order.items?.length || 0} items • {order.customerName || 'Walk-in'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Rp {order.totalAmount?.toLocaleString()}</p>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {!todayOrders?.length && (
              <p className="text-center text-gray-500 py-4">No orders today</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-japanese-charcoal mb-4">
            Best Selling Items
          </h2>
          <div className="space-y-3">
            {bestSelling?.slice(0, 5).map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-japanese-gray/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-japanese-red text-white rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.quantity} sold</p>
                  <p className="text-sm text-gray-500">
                    Rp {item.revenue?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {!bestSelling?.length && (
              <p className="text-center text-gray-500 py-4">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
