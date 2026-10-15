import React from 'react';
import { User, Package, ShoppingBag, ShieldCheck, LogOut, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext.js';

export function CustomerAccountPage() {
  const { user, isAuthenticated, logout, navigate, cart } = useShop();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-stone-200 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900 font-serif-display">Sign In Required</h2>
        <p className="text-xs text-stone-500">
          Please sign in to view and manage your account.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-2.5 px-4 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
        >
          Go to Customer Login (/login)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Account Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-display mt-0.5">
            Hello, {user.name}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Registered customer account · Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        <button
          onClick={logout}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Details & Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
            <User className="w-4 h-4 text-stone-700" />
            <span>Profile Information</span>
          </div>
          <div className="text-xs space-y-1.5 pt-1">
            <div>
              <span className="text-stone-400">Name:</span> <span className="font-semibold text-stone-900">{user.name}</span>
            </div>
            <div>
              <span className="text-stone-400">Email:</span> <span className="font-mono text-stone-800">{user.email}</span>
            </div>
            <div>
              <span className="text-stone-400">Role:</span>{' '}
              <span className="font-mono font-semibold text-stone-900 uppercase text-[10px] px-1.5 py-0.5 bg-stone-100 rounded">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              <Package className="w-4 h-4 text-stone-700" />
              <span>Order Archive</span>
            </div>
            <p className="text-xs text-stone-500">
              Review placed orders, shipping statuses, and frozen price receipts.
            </p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center justify-between py-2 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-stone-900 transition-colors cursor-pointer"
          >
            <span>View Order History</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
          </button>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              <ShoppingBag className="w-4 h-4 text-stone-700" />
              <span>Active Bag</span>
            </div>
            <p className="text-xs text-stone-500">
              You currently have <span className="font-bold text-stone-900">{cart.itemCount} items</span> saved in your persistent cart.
            </p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center justify-between py-2 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-stone-900 transition-colors cursor-pointer"
          >
            <span>Open Shopping Cart</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
