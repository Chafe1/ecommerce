import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Lock, ExternalLink } from 'lucide-react';
import { useShop } from '../../context/ShopContext.js';
import { apiRequest } from '../../api/client.js';
import { formatMoney, Order } from '../../shared/types.js';

export function CheckoutModal() {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    cart,
    user,
    refreshCart,
    setActiveOrderReceipt,
    showToast,
  } = useShop();

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

  if (!isCheckoutModalOpen) return null;

  // Step 1: Submit delivery intent to server -> Server revalidates price, reserves stock atomically
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
        await refreshCart(); // Cart is emptied on server
        showToast('Inventory reserved atomically. Ready for sandbox payment.', 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout failed. Please review your cart items.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Simulate Hosted Sandbox Payment completion & Webhook Signature verification
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
        showToast('Payment verified via signed webhook! Order marked PAID.', 'success');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment simulation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishAndOpenReceipt = () => {
    if (pendingOrder) {
      setActiveOrderReceipt(pendingOrder);
    }
    setIsCheckoutModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200">
        <button
          onClick={() => setIsCheckoutModalOpen(false)}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer p-1"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Checkout Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <span>Checkout Workflow</span>
            <span aria-hidden="true">·</span>
            <span>
              {step === 'delivery'
                ? 'Step 1: Contact & Delivery'
                : step === 'review_sandbox'
                ? 'Step 2: Server Verification & Payment'
                : 'Order Confirmed'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 font-serif-display mt-1">
            {step === 'delivery' && 'Delivery Information'}
            {step === 'review_sandbox' && 'Server Recalculated Order & Hosted Sandbox'}
            {step === 'confirmed' && 'Order Successfully Placed'}
          </h2>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* STEP 1: DELIVERY FORM */}
        {step === 'delivery' && (
          <form onSubmit={handleInitiateCheckout} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Country</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Street name and house number"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            {/* Price check reassurance notice */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded text-xs text-stone-600 flex items-start gap-2 mt-4">
              <ShieldCheck className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-800">Server Price & Stock Protection:</span>{' '}
                Prices submitted in this request are discarded. The backend re-reads current catalog records,
                calculates line items, and commits an atomic inventory reservation.
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Reserving Stock on Server...' : 'Review Server Order & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: REVIEW SERVER RECALCULATED ORDER & HOSTED SANDBOX */}
        {step === 'review_sandbox' && pendingOrder && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Inventory Successfully Reserved</span>
              </div>
              <p>
                Order <span className="font-mono font-bold">{pendingOrder.orderNumber}</span> has been
                created with status <span className="font-mono font-bold">PENDING_PAYMENT</span>.
              </p>
              <p className="text-[11px] text-emerald-700">
                Reservation hold expires at: {new Date(reservationExpiry).toLocaleTimeString()}
              </p>
            </div>

            {/* Recalculated Order Breakdown */}
            <div className="border border-stone-200 rounded-lg divide-y divide-stone-100 text-xs">
              <div className="p-3 bg-stone-50 font-semibold text-stone-800 flex justify-between">
                <span>Frozen Item Snapshots ({pendingOrder.items.length})</span>
                <span>Subtotal</span>
              </div>
              {pendingOrder.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-9 h-9 object-cover rounded bg-stone-100"
                    />
                    <div>
                      <div className="font-semibold text-stone-900">{item.name}</div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {item.quantity} × {formatMoney(item.unitPriceMinor, pendingOrder.currency)}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-stone-900">
                    {formatMoney(item.subtotalMinor, pendingOrder.currency)}
                  </span>
                </div>
              ))}
              <div className="p-3 bg-stone-50/50 space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(pendingOrder.subtotalMinor, pendingOrder.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="font-mono tabular-nums">
                    {pendingOrder.shippingMinor === 0 ? 'FREE' : formatMoney(pendingOrder.shippingMinor, pendingOrder.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(pendingOrder.taxMinor, pendingOrder.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Authoritative Total</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(pendingOrder.totalMinor, pendingOrder.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sandbox Hosted Checkout Notice */}
            <div className="p-3.5 bg-stone-100 rounded-lg border border-stone-200 text-xs space-y-2 text-stone-700">
              <div className="font-semibold flex items-center gap-1.5 text-stone-900">
                <Lock className="w-3.5 h-3.5 text-stone-700" />
                <span>Hosted Payment Sandbox (Zero Raw Card Storage)</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                As required by Section 4.2 & NFR-01, ShopEase never handles raw credit card numbers.
                In production, customers are redirected to the hosted payment provider. The provider
                notifies ShopEase via an HMAC-SHA256 signed webhook to advance the order state.
              </p>
            </div>

            <button
              onClick={handleSimulatePaymentWebhook}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Verifying Provider Webhook Signature...'
                  : `Complete Sandbox Payment (${formatMoney(pendingOrder.totalMinor, pendingOrder.currency)})`}
              </span>
            </button>
          </div>
        )}

        {/* STEP 3: ORDER CONFIRMED */}
        {step === 'confirmed' && pendingOrder && (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-semibold text-emerald-700 tracking-wider">
                Payment Authorized & Verified
              </span>
              <h3 className="text-2xl font-bold text-stone-900 font-serif-display mt-1">
                Order #{pendingOrder.orderNumber}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                A confirmation has been sent to {pendingOrder.deliveryDetails.email}.
              </p>
            </div>

            {webhookDetails && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded text-left text-xs space-y-1">
                <div className="font-semibold text-stone-800">Webhook Verification Proof:</div>
                <div className="text-[11px] font-mono text-stone-600">
                  Event: {webhookDetails.eventId}
                </div>
                <div className="text-[11px] font-mono text-emerald-700 font-semibold">
                  HMAC Signature: Validated (200 OK)
                </div>
                <div className="text-[11px] font-mono text-stone-600">
                  Order Status Updated: PAID
                </div>
              </div>
            )}

            <button
              onClick={handleFinishAndOpenReceipt}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
            >
              View Order Receipt & Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
