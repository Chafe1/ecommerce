import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Layers,
  Award,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext.js';
import { formatMoney } from '../../shared/types.js';

export function ProductDetailModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useShop();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'craft' | 'shipping'>('overview');

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isOutOfStock = product.stock <= 0;
  const maxAvailable = product.stock;

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-xs text-stone-500 hover:text-stone-950 p-2 rounded-full shadow-xs transition-colors cursor-pointer border border-stone-200/80"
          aria-label="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
          {/* Gallery View */}
          <div className="md:col-span-7 relative bg-stone-100 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-stone-200">
            <img
              src={product.imageUrl}
              alt={product.imageAlt || product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center max-h-[540px]"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-white/90 bg-stone-950/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <span className="font-mono uppercase tracking-wider">{product.categoryName}</span>
              <span className="font-mono">Reference: {product.id}</span>
            </div>
          </div>

          {/* Contiguous Purchase Module */}
          <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Unboxed Metadata */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-widest text-[10px] font-bold text-stone-600">
                    {product.categoryName}
                  </span>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1 text-stone-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="font-semibold">4.9 / 5</span>
                  </div>
                </div>

                {isOutOfStock ? (
                  <span className="text-rose-600 font-semibold text-[11px]">Sold Out</span>
                ) : (
                  <span className="text-stone-600 font-mono text-[11px]">
                    {product.stock} in stock
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-stone-950 font-serif-display leading-tight">
                {product.name}
              </h2>

              <div className="mt-3">
                <span className="font-mono tabular-nums text-2xl font-bold text-stone-950">
                  {formatMoney(product.priceMinor, product.currency)}
                </span>
              </div>

              {/* Sub-Tabs: Description / Details / Shipping */}
              <div className="mt-5 border-b border-stone-200 flex gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'text-stone-950 border-b-2 border-stone-950'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('craft')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'craft'
                      ? 'text-stone-950 border-b-2 border-stone-950'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'shipping'
                      ? 'text-stone-950 border-b-2 border-stone-950'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Shipping
                </button>
              </div>

              {/* Tab Contents */}
              <div className="mt-4 text-xs text-stone-600 leading-relaxed min-h-[90px]">
                {activeTab === 'overview' && (
                  <p>{product.description}</p>
                )}

                {activeTab === 'craft' && (
                  <ul className="space-y-1.5">
                    {product.features?.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-2">
                    <p>
                      Orders are dispatched within 24 hours of payment confirmation.
                    </p>
                    <p className="text-stone-500">
                      Standard delivery typically takes 2–3 business days.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase CTA Module */}
            <div className="pt-5 border-t border-stone-200 space-y-4">
              {!isOutOfStock ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-1.5 text-stone-600 hover:text-stone-950 disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-mono tabular-nums text-sm font-bold text-stone-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                      disabled={quantity >= maxAvailable}
                      className="p-1.5 text-stone-600 hover:text-stone-950 disabled:opacity-30 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-stone-950 hover:bg-stone-850 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag · {formatMoney(product.priceMinor * quantity, product.currency)}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-stone-100 text-stone-600 rounded-lg text-center text-xs font-medium">
                  Currently Out of Stock.
                </div>
              )}

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3 text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-stone-400" />
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                  <span>Real-time stock reservation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
