import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useShop } from '../../context/ShopContext.js';
import { formatMoney } from '../../shared/types.js';

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    setIsCheckoutModalOpen,
    isAuthenticated,
    navigate,
  } = useShop();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const freeShippingThresholdMinor = 10000; // $100.00
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdMinor - cart.estimatedSubtotalMinor);
  const progressPercent = Math.min(100, Math.round((cart.estimatedSubtotalMinor / freeShippingThresholdMinor) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="text-lg font-bold text-stone-950 font-serif-display">
                Shopping Bag
              </h2>
              <span className="text-xs font-mono tabular-nums text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                {cart.itemCount} {cart.itemCount === 1 ? 'piece' : 'pieces'}
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="text-stone-400 hover:text-stone-900 transition-colors cursor-pointer p-1 rounded-md"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cart.items.length > 0 && (
            <div className="px-6 py-3 bg-stone-50 border-b border-stone-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-stone-700">
                  <Truck className="w-3.5 h-3.5 text-stone-600" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-emerald-700 font-semibold">You unlocked Complimentary Courier Shipping!</span>
                  ) : (
                    <span>Add {formatMoney(remainingForFreeShipping, 'USD')} more for Free Shipping</span>
                  )}
                </span>
                <span className="font-mono text-[11px] text-stone-500">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-stone-900 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-stone-900 font-serif-display">Your bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                  Discover timeless design pieces in our curated catalog.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.items.map((item) => {
                const product = item.product;
                if (!product) return null;
                const isOverStock = item.quantity > product.stock;

                return (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-xl hover:border-stone-300 transition-colors"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 object-cover rounded-lg bg-stone-200 shrink-0 border border-stone-200/60"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                            aria-label={`Remove ${product.name} from bag`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-stone-500 mt-0.5">
                          {formatMoney(product.priceMinor, product.currency)} each
                        </div>
                        {isOverStock && (
                          <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                            Only {product.stock} left in stock
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-200/60">
                        {/* Stepper */}
                        <div className="flex items-center border border-stone-300 rounded-md bg-white">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 font-mono tabular-nums text-xs font-bold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item line total */}
                        <div className="font-mono tabular-nums text-xs font-bold text-stone-950">
                          {formatMoney(product.priceMinor * item.quantity, product.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between items-center text-sm font-bold text-stone-950">
                  <span>Estimated Subtotal</span>
                  <span className="font-mono tabular-nums text-base">
                    {formatMoney(cart.estimatedSubtotalMinor, 'USD')}
                  </span>
                </div>
                {/* Mandated Section 7 rule: Label totals as estimates until server validation */}
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  *Estimated subtotal. Delivery fees, taxes, and actual stock availability are strictly
                  recomputed and reserved by the server at checkout.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-stone-950 hover:bg-stone-850 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
                >
                  View Full Cart Page (/cart)
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Persistent cart saved to server account</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
