import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, User, Search, ChevronDown, Check, Package, Settings, LogOut } from 'lucide-react';
import { useShop } from '../../context/ShopContext.js';
import { formatMoney } from '../../shared/types.js';

export function AppHeader() {
  const {
    currentPath,
    navigate,
    cart,
    user,
    isAuthenticated,
    isAdmin,
    switchDemoAccount,
    logout,
    searchQuery,
    setSearchQuery,
    setIsCartOpen,
  } = useShop();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isStoreActive = currentPath === '/' || currentPath === '';
  const isOrdersActive = currentPath === '/orders';
  const isAdminActive = currentPath.startsWith('/admin');
  const isAuditActive = currentPath === '/spec-audit' || currentPath === '/audit';

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT MICRO-BAR */}
      <div className="bg-stone-900 text-stone-300 text-[11px] py-1.5 px-4 text-center font-medium tracking-wide border-b border-stone-800 flex items-center justify-center gap-2">
        <span className="text-stone-300">Free standard shipping on orders over $100</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span className="text-stone-300">Atomic Stock Reservation</span>
        <span aria-hidden="true" className="text-stone-600">·</span>
        <span className="text-stone-400">Encrypted 256-bit Checkout</span>
      </div>

      {/* 2. MAIN HEADER (3-Zone Top Bar) */}
      <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/80 transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 h-16">
            {/* ZONE 1: BRAND TITLE */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  navigate('/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xl font-bold tracking-tight text-stone-950 font-serif-display hover:opacity-85 transition-opacity cursor-pointer text-left"
              >
                ShopEase
              </button>
            </div>

            {/* ZONE 2: CONCISE SINGLE-LINE NAVIGATION LINKS */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-stone-600">
              <button
                onClick={() => {
                  if (currentPath !== '/') {
                    navigate('/');
                  } else {
                    const el = document.getElementById('catalog-grid');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isStoreActive
                    ? 'text-stone-950 border-b-2 border-stone-950 pb-0.5'
                    : 'text-stone-600'
                }`}
              >
                Products
              </button>

              <button
                onClick={() => {
                  if (currentPath !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      const el = document.getElementById('featured-categories');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    const el = document.getElementById('featured-categories');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Categories
              </button>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    navigate('/orders');
                  }
                }}
                className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isOrdersActive
                    ? 'text-stone-950 border-b-2 border-stone-950 pb-0.5'
                    : 'text-stone-600'
                }`}
              >
                My Orders
              </button>

              <button
                onClick={() => {
                  if (isAdmin) {
                    navigate('/admin/dashboard');
                  } else {
                    navigate('/admin/login');
                  }
                }}
                className={`flex items-center gap-1.5 hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isAdminActive
                    ? 'text-stone-950 border-b-2 border-stone-950 pb-0.5 font-bold'
                    : 'text-stone-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-stone-800" />
                <span>Admin Portal</span>
              </button>

              <button
                onClick={() => navigate('/spec-audit')}
                className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-[11px] text-stone-500 font-mono ${
                  isAuditActive
                    ? 'text-stone-950 border-b-2 border-stone-950 pb-0.5 font-bold'
                    : ''
                }`}
              >
                Spec Audit
              </button>
            </nav>

            {/* ZONE 3: ACTIONS & AUTH CONTROLS */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Quick Search toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                  aria-label="Toggle search input"
                >
                  <Search className="w-4 h-4" />
                </button>

                {isSearchOpen && (
                  <div className="absolute right-0 top-11 w-72 bg-white rounded-lg shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Role Switcher & Account Dropdown */}
              <div className="relative">
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-stone-200/80 rounded-md transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-stone-700" />
                      <span className="hidden sm:inline font-semibold max-w-[110px] truncate">
                        {user?.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-stone-200 text-stone-700 font-bold uppercase">
                        {user?.role}
                      </span>
                      <ChevronDown className="w-3 h-3 text-stone-500" />
                    </button>

                    {isRoleDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl border border-stone-200 p-2 z-50 text-xs">
                        <div className="px-2 py-1.5 text-[11px] text-stone-500 border-b border-stone-100">
                          Signed in as <span className="font-semibold text-stone-900 block truncate">{user?.email}</span>
                        </div>

                        {/* Navigation Links in Dropdown */}
                        <div className="py-1 border-b border-stone-100">
                          <button
                            onClick={() => {
                              navigate('/account');
                              setIsRoleDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-stone-50 rounded flex items-center gap-2 text-stone-700 cursor-pointer"
                          >
                            <User className="w-3.5 h-3.5 text-stone-500" />
                            <span>My Account (/account)</span>
                          </button>

                          <button
                            onClick={() => {
                              navigate('/orders');
                              setIsRoleDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-stone-50 rounded flex items-center gap-2 text-stone-700 cursor-pointer"
                          >
                            <Package className="w-3.5 h-3.5 text-stone-500" />
                            <span>Order History (/orders)</span>
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => {
                                navigate('/admin/dashboard');
                                setIsRoleDropdownOpen(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-stone-50 rounded flex items-center gap-2 text-amber-800 font-semibold cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                              <span>Admin Dashboard (/admin/dashboard)</span>
                            </button>
                          )}
                        </div>

                        {/* Persona Quick Switchers */}
                        <div className="py-1">
                          <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            Switch Demo Persona
                          </div>

                          <button
                            onClick={() => {
                              switchDemoAccount('customer');
                              setIsRoleDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-stone-50 rounded flex items-center justify-between cursor-pointer"
                          >
                            <div>
                              <div className="font-semibold text-stone-800">Customer</div>
                              <div className="text-[10px] text-stone-500">alex@example.com</div>
                            </div>
                            {user?.role === 'customer' && <Check className="w-3.5 h-3.5 text-stone-900" />}
                          </button>

                          <button
                            onClick={() => {
                              switchDemoAccount('admin');
                              setIsRoleDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-stone-50 rounded flex items-center justify-between cursor-pointer"
                          >
                            <div>
                              <div className="font-semibold text-stone-900">Store Admin</div>
                              <div className="text-[10px] text-stone-500">admin@shopease.store</div>
                            </div>
                            {user?.role === 'admin' && <Check className="w-3.5 h-3.5 text-stone-900" />}
                          </button>
                        </div>

                        <div className="pt-1 border-t border-stone-100">
                          <button
                            onClick={() => {
                              logout();
                              setIsRoleDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer flex items-center gap-2"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:text-stone-950 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Shopping Bag Button (Zone 3 Primary Action) */}
              <button
                onClick={() => navigate('/cart')}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-stone-950 hover:bg-stone-800 rounded-md transition-all shadow-xs cursor-pointer group"
                aria-label={`Shopping bag containing ${cart.itemCount} items`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-stone-300 group-hover:text-white" />
                <span className="hidden sm:inline">Bag</span>
                <span className="font-mono tabular-nums text-[11px] bg-stone-800 px-1.5 py-0.2 rounded text-stone-200">
                  {cart.itemCount}
                </span>
                {cart.estimatedSubtotalMinor > 0 && (
                  <span className="hidden md:inline font-mono text-[11px] text-stone-300 pl-1 border-l border-stone-700">
                    {formatMoney(cart.estimatedSubtotalMinor, 'USD')}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
