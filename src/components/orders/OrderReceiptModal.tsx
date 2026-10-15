import React from 'react';
import { X, CheckCircle2, Clock, Truck, Package, ShieldCheck } from 'lucide-react';
import { useShop } from '../../context/ShopContext.js';
import { formatMoney } from '../../shared/types.js';

export function OrderReceiptModal() {
  const { activeOrderReceipt, setActiveOrderReceipt } = useShop();

  if (!activeOrderReceipt) return null;

  const order = activeOrderReceipt;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200">
        <button
          onClick={() => setActiveOrderReceipt(null)}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer p-1"
          aria-label="Close receipt"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-stone-200 pb-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase font-semibold text-stone-500 tracking-wider">
              Order Receipt
            </div>
            <h2 className="text-xl font-bold text-stone-900 font-serif-display mt-0.5">
              Order {order.orderNumber}
            </h2>
            <div className="text-xs text-stone-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-stone-100 text-stone-800 border border-stone-200 font-mono">
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Items Table Snapshot */}
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Historical Item Snapshot (Prices Frozen at Purchase)
          </div>
          <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-100 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded bg-stone-100 shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold text-stone-900">{item.name}</h4>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Qty: {item.quantity} · {formatMoney(item.unitPriceMinor, order.currency)} each
                    </span>
                  </div>
                </div>
                <div className="font-mono tabular-nums font-semibold text-stone-900">
                  {formatMoney(item.subtotalMinor, order.currency)}
                </div>
              </div>
            ))}

            <div className="p-3 bg-stone-50/70 space-y-1.5 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatMoney(order.subtotalMinor, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono tabular-nums">
                  {order.shippingMinor === 0 ? 'FREE' : formatMoney(order.shippingMinor, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax</span>
                <span className="font-mono tabular-nums">{formatMoney(order.taxMinor, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Paid</span>
                <span className="font-mono tabular-nums">{formatMoney(order.totalMinor, order.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs bg-stone-50 p-4 rounded-lg border border-stone-200">
          <div>
            <div className="font-semibold text-stone-800 mb-1">Delivery Destination</div>
            <div className="text-stone-600 leading-relaxed">
              <p>{order.deliveryDetails.fullName}</p>
              <p>{order.deliveryDetails.addressLine1}</p>
              <p>
                {order.deliveryDetails.city}, {order.deliveryDetails.postalCode}
              </p>
              <p>{order.deliveryDetails.country}</p>
            </div>
          </div>

          <div>
            <div className="font-semibold text-stone-800 mb-1">Payment Snapshot</div>
            <div className="text-stone-600 leading-relaxed space-y-0.5">
              <p>Method: {order.paymentMethod}</p>
              <p className="font-mono text-[11px] truncate">Ref: {order.paymentProviderReference}</p>
              <p>Status: <span className="font-semibold text-emerald-700">{order.paymentStatus}</span></p>
            </div>
          </div>
        </div>

        {/* Audit Status Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Status Audit Trail (State Machine)
            </div>
            <div className="space-y-2 border-l-2 border-stone-200 pl-3 ml-1 text-xs text-stone-600">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="relative">
                  <div className="font-semibold text-stone-800 flex items-center gap-2">
                    <span className="font-mono text-[11px] text-stone-500">
                      {new Date(h.changedAt).toLocaleTimeString()}
                    </span>
                    <span>{h.status}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    By {h.changedBy} {h.note ? `· ${h.note}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
