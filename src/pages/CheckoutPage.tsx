import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Lock, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext.js';
import { apiRequest } from '../api/client.js';
import { formatMoney, Order } from '../shared/types.js';

export function CheckoutPage() {
  const { cart, user, isAuthenticated, refreshCart, setActiveOrderReceipt, showToast, navigate } = useShop();

  const [step, setStep] = useState<'delivery' | 'review_sandbox' | 'confirmed'>('delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [fullName, setFullName] = useState(user?.name || 'Alex Vance');
  const [email, setEmail] = useState(user?.email || 'alex@example.com');
  const [phone, setPhone] = useState('+1 (555) 392-8172');
  const [addressLine1, setAddressLine1] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Portland');
  const [postalCode, setPostalCode] = useState('97201');
  const [country, setCountry] = useState('United States');

  // Checkout Response from Server
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [reservationExpiry, setReservationExpiry] = useState<string>('');
  const [webhookDetails, setWebhookDetails] = useState<any>(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-stone-200 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900 font-serif-display">Sign In Required</h2>
        <p className="text-xs text-stone-500">
          You must be logged in to complete checkout and reserve inventory.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-2.5 px-4 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
        >
          Sign In (/login)
        </button>
      </div>
    );
  }

  const handleInitiateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await apiRequest<{
        order: Order;
        hostedCheckoutUrl: string;
        reservationExpiry: string;
      }>('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          deliveryDetails: {
            fullName,
            email,
            phone,
            addressLine1,
            city,
            postalCode,
            country,
          },
          paymentMethod: 'Hosted Sandbox Card',
        }),
      });

      if (res.data?.order) {
        setPendingOrder(res.data.order);
        setReservationExpiry(res.data.reservationExpiry);
        setStep('review_sandbox');
        await refreshCart();
        showToast('Inventory reserved atomically. Ready for sandbox payment.', 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout failed. Please review your cart.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePaymentWebhook = async () => {
    if (!pendingOrder) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await apiRequest<{
        order: Order;
        webhookSimulated: {
          eventId: string;
          signatureVerified: boolean;
          secretUsed: string;
          outcome: string;
        };
      }>('/api/payments/simulate-sandbox-pay', {
        method: 'POST',
        body: JSON.stringify({ orderId: pendingOrder.id }),
      });

      if (res.data?.order) {
        setPendingOrder(res.data.order);
        setWebhookDetails(res.data.webhookSimulated);
        setStep('confirmed');
        showToast('Payment verified via HMAC webhook! Order marked PAID.', 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment simulation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            {step === 'delivery' && 'Step 1 of 2: Shipping'}
            {step === 'review_sandbox' && 'Step 2 of 2: Payment'}
            {step === 'confirmed' && 'Order Confirmed'}
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-display mt-0.5">
            Checkout
          </h1>
        </div>

        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* STEP 1: DELIVERY FORM */}
      {step === 'delivery' && (
        <form onSubmit={handleInitiateCheckout} className="space-y-4 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Country</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Postal Code</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-600 flex items-start gap-2 mt-4">
            <ShieldCheck className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-900">Server Price Protection:</span>{' '}
              Submitting reserves stock atomically and revalidates prices directly from catalog records.
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Reserving Stock...' : 'Reserve Inventory & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 2: REVIEW SERVER ORDER & PAYMENT */}
      {step === 'review_sandbox' && pendingOrder && (
        <div className="space-y-6 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs text-xs">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Stock Atomically Reserved</span>
            </div>
            <p>
              Order <span className="font-mono font-bold">{pendingOrder.orderNumber}</span> created in state{' '}
              <span className="font-mono font-bold">PENDING_PAYMENT</span>.
            </p>
          </div>

          {/* Frozen items */}
          <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
            <div className="p-3 bg-stone-50 font-semibold text-stone-800 flex justify-between">
              <span>Item Snapshots ({pendingOrder.items.length})</span>
              <span>Subtotal</span>
            </div>
            {pendingOrder.items.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded bg-stone-100" />
                  <div>
                    <div className="font-semibold text-stone-900">{item.name}</div>
                    <div className="text-stone-500 font-mono text-[11px]">
                      {item.quantity} × {formatMoney(item.unitPriceMinor, pendingOrder.currency)}
                    </div>
                  </div>
                </div>
                <span className="font-mono tabular-nums font-semibold text-stone-900">
                  {formatMoney(item.subtotalMinor, pendingOrder.currency)}
                </span>
              </div>
            ))}

            <div className="p-3 bg-stone-50 space-y-1.5 text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatMoney(pendingOrder.subtotalMinor, pendingOrder.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono tabular-nums">
                  {pendingOrder.shippingMinor === 0 ? 'FREE' : formatMoney(pendingOrder.shippingMinor, pendingOrder.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-mono tabular-nums">{formatMoney(pendingOrder.taxMinor, pendingOrder.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums">{formatMoney(pendingOrder.totalMinor, pendingOrder.currency)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSimulatePaymentWebhook}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Verifying Provider Webhook...'
                : `Complete Payment (${formatMoney(pendingOrder.totalMinor, pendingOrder.currency)})`}
            </span>
          </button>
        </div>
      )}

      {/* STEP 3: CONFIRMED */}
      {step === 'confirmed' && pendingOrder && (
        <div className="space-y-6 text-center py-10 bg-white border border-stone-200 rounded-2xl p-8">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase font-semibold text-emerald-700 tracking-wider">
              Payment Confirmed
            </span>
            <h2 className="text-2xl font-bold text-stone-900 font-serif-display mt-1">
              Order #{pendingOrder.orderNumber}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Confirmation sent to {pendingOrder.deliveryDetails.email}.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setActiveOrderReceipt(pendingOrder);
              }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              View Receipt Snapshot
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Go to My Orders (/orders)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
