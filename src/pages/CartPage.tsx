import React from 'react';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext.js';
import { formatMoney } from '../shared/types.js';

export function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, navigate, isAuthenticated } = useShop();

  const freeShippingThresholdMinor = 10000;
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdMinor - cart.estimatedSubtotalMinor);
  const progressPercent = Math.min(100, Math.round((cart.estimatedSubtotalMinor / freeShippingThresholdMinor) * 100));

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-display">
            Shopping Cart
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {cart.items.length === 0 ? (
        <div className="py-20 text-center bg-white border border-stone-200 rounded-2xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 font-serif-display">Your cart is currently empty</h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Discover our collection of furniture, leather goods, and timepieces.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Progress */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-stone-700">
                  <Truck className="w-3.5 h-3.5 text-stone-600" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-emerald-700 font-semibold">You unlocked Free Delivery!</span>
                  ) : (
                    <span>Add {formatMoney(remainingForFreeShipping, 'USD')} more for free delivery</span>
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

            <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden shadow-xs">
              {cart.items.map((item) => {
                const product = item.product;
                if (!product) return null;
                const isOverStock = item.quantity > product.stock;

                return (
                  <div key={item.productId} className="p-4 sm:p-5 flex gap-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-stone-100 shrink-0 border border-stone-200"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-stone-900">
                            {product.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            aria-label={`Remove ${product.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          Category: {product.categoryName} · {formatMoney(product.priceMinor, product.currency)} each
                        </div>
                        {isOverStock && (
                          <div className="text-[11px] text-rose-600 font-medium mt-1">
                            Only {product.stock} available in vault.
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 text-xs">
                        <div className="flex items-center border border-stone-300 rounded bg-stone-50">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 font-mono font-semibold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="font-mono tabular-nums text-sm font-bold text-stone-900">
                          {formatMoney(product.priceMinor * item.quantity, product.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 font-serif-display border-b border-stone-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Estimated Subtotal</span>
                <span className="font-mono tabular-nums font-semibold text-stone-900">
                  {formatMoney(cart.estimatedSubtotalMinor, 'USD')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono tabular-nums">
                  {cart.estimatedSubtotalMinor >= 10000 ? 'FREE' : '$15.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-mono tabular-nums">
                  {formatMoney(Math.round(cart.estimatedSubtotalMinor * 0.08), 'USD')}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-3 border-t border-stone-200">
                <span>Estimated Total</span>
                <span className="font-mono tabular-nums">
                  {formatMoney(
                    cart.estimatedSubtotalMinor +
                      (cart.estimatedSubtotalMinor >= 10000 ? 0 : 1500) +
                      Math.round(cart.estimatedSubtotalMinor * 0.08),
                    'USD'
                  )}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              *Taxes and actual totals are verified on the server during checkout.
            </p>

            <button
              onClick={handleProceedToCheckout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>Atomic stock verification at checkout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
