import React from 'react';
import { Plus, Eye, Check, Star } from 'lucide-react';
import { Product, formatMoney } from '../../shared/types.js';
import { useShop } from '../../context/ShopContext.js';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setQuickViewProduct } = useShop();
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group flex flex-col bg-white border border-stone-200/90 rounded-xl overflow-hidden hover:shadow-lg hover:border-stone-300 transition-all duration-300">
      {/* 65%-75% Card Height Imagery on a neutral solid stone surface */}
      <div
        className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden cursor-pointer"
        onClick={() => setQuickViewProduct(product)}
      >
        <img
          src={product.imageUrl}
          alt={product.imageAlt || product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.image-fallback')) {
              const fallback = document.createElement('div');
              fallback.className =
                'image-fallback w-full h-full flex flex-col items-center justify-center bg-stone-100 p-6 text-stone-400 text-center';
              fallback.innerHTML = `<span class="text-xs uppercase tracking-wider font-semibold text-stone-500">${product.categoryName || 'Design Object'}</span><p class="text-xs text-stone-400 mt-1">${product.name}</p>`;
              parent.appendChild(fallback);
            }
          }}
        />

        {/* Floating Stock Micro-Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isOutOfStock ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-900/80 text-white backdrop-blur-xs">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-900/80 text-amber-100 backdrop-blur-xs">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="px-4 py-2 bg-white/95 text-stone-900 text-xs font-semibold rounded-md shadow-md hover:bg-white transition-all transform translate-y-2 group-hover:translate-y-0 duration-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-stone-700" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="uppercase tracking-widest text-[10px] font-semibold text-stone-600">
                {product.categoryName}
              </span>
            </div>

            {/* Subtle Rating */}
            <div className="flex items-center gap-1 text-[11px] text-stone-600 font-mono">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>4.9</span>
            </div>
          </div>

          {/* Product Name in refined display typography */}
          <h3
            onClick={() => setQuickViewProduct(product)}
            className="text-base font-semibold text-stone-900 hover:text-stone-600 transition-colors cursor-pointer leading-snug line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Baseline */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
              Price
            </div>
            <div className="font-mono tabular-nums text-base font-bold text-stone-950">
              {formatMoney(product.priceMinor, product.currency)}
            </div>
          </div>

          <button
            onClick={() => addToCart(product.id, 1)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer shadow-2xs ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>
    </div>
  );
}
