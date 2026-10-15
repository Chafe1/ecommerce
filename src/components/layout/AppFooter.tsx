import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext.js';
import { ShieldCheck, Copy, Check, Lock, User, ArrowRight } from 'lucide-react';

export function AppFooter() {
  const { navigate, showToast, switchDemoAccount } = useShop();
  const [copiedCustomer, setCopiedCustomer] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  const handleCopy = (text: string, type: 'customer' | 'admin') => {
    navigator.clipboard.writeText(text);
    if (type === 'customer') {
      setCopiedCustomer(true);
      setTimeout(() => setCopiedCustomer(false), 2000);
    } else {
      setCopiedAdmin(true);
      setTimeout(() => setCopiedAdmin(false), 2000);
    }
    showToast(`Copied ${text} to clipboard`, 'info');
  };

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand & Editorial Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-serif-display">
                ShopEase
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-semibold">
                MERN E-Commerce
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed font-light">
              Single-store e-commerce platform with real-time stock reservations, persistent user carts, and role-authorized store administration.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1 font-mono">
              <button
                onClick={() => navigate('/spec-audit')}
                className="hover:text-stone-300 transition-colors underline cursor-pointer"
              >
                Verification Suite (FR-01 to FR-14)
              </button>
            </div>
          </div>

          {/* Customer Routes Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-100">
              Customer Area
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home / Storefront (/)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Customer Login (/login)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/register')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Register (/register)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/account')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Account (/account)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/cart')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shopping Cart (/cart)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/orders')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  My Orders (/orders)
                </button>
              </li>
            </ul>
          </div>

          {/* Store Admin Routes */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-100">
              Store Admin
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => navigate('/admin/login')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold text-amber-200"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Login (/admin/login)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Dashboard (/admin/dashboard)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin/products')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Products (/admin/products)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin/categories')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Categories (/admin/categories)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Orders (/admin/orders)
                </button>
              </li>
            </ul>
          </div>

          {/* ShopEase - Demo Access (Exact Layout Requested) */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-100">
                ShopEase — Demo Access
              </h3>
            </div>
            <p className="text-[11px] text-stone-400">
              For demonstration and testing purposes:
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Customer Demo Card */}
              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Customer Demo</span>
                  </div>
                  <button
                    onClick={() => switchDemoAccount('customer')}
                    className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                  >
                    Quick Sign In
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="font-mono text-[11px] text-stone-300">alex@example.com</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('alex@example.com', 'customer')}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded transition-colors cursor-pointer"
                  >
                    {copiedCustomer ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCustomer ? 'Copied' : 'Copy customer email'}</span>
                  </button>
                </div>
              </div>

              {/* Store Admin Demo Card */}
              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-amber-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Store Admin Demo</span>
                  </div>
                  <button
                    onClick={() => switchDemoAccount('admin')}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Admin Sign In
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="font-mono text-[11px] text-stone-300">admin@shopease.store</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('admin@shopease.store', 'admin')}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded transition-colors cursor-pointer"
                  >
                    {copiedAdmin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAdmin ? 'Copied' : 'Copy admin email'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 ShopEase E-Commerce Platform. Role-based authorization & verified sessions.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Separate Customer & Admin Routes</span>
            <span aria-hidden="true">·</span>
            <span>Zero Raw Card Storage</span>
            <span aria-hidden="true">·</span>
            <span>Cryptographic HMAC Webhooks</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
