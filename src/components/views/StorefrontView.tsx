import React from 'react';
import { Search, ArrowRight, ShieldCheck, RefreshCw, Truck, CheckCircle2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext.js';
import { ProductCard } from '../catalog/ProductCard.js';

export function StorefrontView() {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    inStockOnly,
    setInStockOnly,
    sortBy,
    setSortBy,
    isLoadingCatalog,
  } = useShop();

  return (
    <div className="space-y-12 pb-20">
      {/* 1. CLEAN HERO BANNER */}
      <section className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-5xl font-bold font-serif-display tracking-tight text-white leading-tight">
              Quality Goods for Everyday Living
            </h1>

            <p className="text-sm sm:text-base text-stone-300 max-w-lg leading-relaxed">
              Explore our selection of furniture, leather goods, timepieces, apparel, and coffee equipment.
            </p>

            <div className="pt-2">
              <a
                href="#catalog-grid"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-stone-900 bg-white hover:bg-stone-100 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <span>Shop All Products</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-16/10 rounded-xl overflow-hidden shadow-lg border border-stone-800 bg-stone-950">
              <img
                src="/src/assets/images/hero_editorial_showcase_1792056508649.jpg"
                alt="Living room furniture showcase"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SIMPLE STORE GUARANTEES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-white border border-stone-200 rounded-xl text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-stone-100 text-stone-800">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-stone-900">Free Shipping Over $100</div>
              <div className="text-stone-500 text-[11px]">Fast delivery across all orders</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-stone-100 text-stone-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-stone-900">Verified Inventory</div>
              <div className="text-stone-500 text-[11px]">Real-time stock reservation</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-stone-100 text-stone-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-stone-900">Secure Checkout</div>
              <div className="text-stone-500 text-[11px]">Encrypted payment protection</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATALOG & FILTERS */}
      <section id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-serif-display">
              Products
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Showing available products with real-time stock and prices.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] max-w-sm w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div id="featured-categories" className="flex flex-wrap items-center justify-between gap-4 py-1 scroll-mt-20">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/60 rounded-lg">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* In-Stock & Sorting */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 w-4 h-4 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-stone-300 rounded-lg bg-white px-3 py-1.5 text-stone-800 focus:ring-2 focus:ring-stone-900 cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoadingCatalog ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <RefreshCw className="w-6 h-6 animate-spin mb-2" />
            <span className="text-xs font-medium">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-stone-200 p-8 space-y-3">
            <h3 className="text-sm font-semibold text-stone-800">No products found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No items match your filter criteria. Try searching for something else.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setInStockOnly(false);
              }}
              className="mt-2 px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
