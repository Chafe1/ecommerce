import React, { useState, useEffect } from 'react';
import { Package, Clock, ShieldCheck, Eye, RefreshCw, ShoppingBag } from 'lucide-react';
import { useShop } from '../../context/ShopContext.js';
import { apiRequest } from '../../api/client.js';
import { Order, formatMoney } from '../../shared/types.js';

export function OrdersView() {
  const { user, setActiveOrderReceipt, navigate } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiRequest<Order[]>('/api/orders');
      if (res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <span>Customer Portal</span>
            <span aria-hidden="true">·</span>
            <span>{user?.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-display mt-1">
            Order History & Tracking
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Historical orders with frozen price snapshots and state machine transitions.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-stone-200 rounded hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400">
          <RefreshCw className="w-6 h-6 animate-spin mb-2" />
          <span className="text-xs">Loading your order history...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-3">
          <Package className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-semibold text-stone-800">No orders placed yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You haven't placed any orders with this account yet. Add items to your bag and complete checkout.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-stone-200 rounded-lg p-5 hover:shadow-xs transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-stone-100 rounded text-stone-700">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-sm font-bold text-stone-900">
                      {order.orderNumber}
                    </span>
                    <div className="text-[11px] text-stone-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded bg-stone-100 text-stone-800 border border-stone-200 font-mono">
                    {order.orderStatus}
                  </span>

                  <button
                    onClick={() => setActiveOrderReceipt(order)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Receipt</span>
                  </button>
                </div>
              </div>

              {/* Items in order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-stone-50/70 p-2 rounded">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded bg-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-stone-800 truncate">{item.name}</div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {item.quantity} × {formatMoney(item.unitPriceMinor, order.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Delivery Address summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-600 gap-2">
                <div>
                  Delivering to: <span className="font-medium text-stone-800">{order.deliveryDetails.fullName}</span>, {order.deliveryDetails.city}
                </div>
                <div className="text-right sm:text-right">
                  Total Paid:{' '}
                  <span className="font-mono tabular-nums font-bold text-stone-900 text-sm">
                    {formatMoney(order.totalMinor, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
