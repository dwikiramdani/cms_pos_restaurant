import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { format } from 'date-fns';

export default function Kitchen() {
  const { data: orders } = useQuery({
    queryKey: ['kitchenOrders'],
    queryFn: () => api.get('/kitchen/display').then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-japanese-charcoal">Kitchen Display</h1>
          <p className="text-gray-500">Real-time order management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders?.map((order: any) => (
          <div key={order.id} className="card border-l-4 border-japanese-red">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold">{order.orderNumber}</span>
              <span className="text-sm text-gray-500">{order.orderType}</span>
            </div>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.menuItem?.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex gap-2">
              <button className="flex-1 btn-primary text-sm justify-center">
                Start
              </button>
              <button className="flex-1 btn-secondary text-sm justify-center">
                Ready
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
