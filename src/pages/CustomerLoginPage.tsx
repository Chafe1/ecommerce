import React, { useState } from 'react';
import { Mail, Lock, Copy, Check, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useShop } from '../context/ShopContext.js';

export function CustomerLoginPage() {
  const { login, navigate, showToast } = useShop();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login(email, password, 'customer');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-20">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Customer Portal
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-display mt-1">
            Customer Sign In
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Sign in to access your persistent cart, checkout, and order history.
          </p>
        </div>

        {/* DEMO ACCESS SECTION (As Specified in User Request) */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-900">ShopEase — Demo Access</span>
            <span className="text-[10px] text-stone-500 font-mono">Testing credentials</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {/* Customer Demo */}
            <div className="p-2.5 bg-white border border-stone-200 rounded-lg flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-stone-800">Customer Demo</div>
                <div className="font-mono text-[11px] text-stone-600">alex@example.com</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopy('alex@example.com', 'customer')}
                  className="p-1.5 text-stone-500 hover:text-stone-900 border border-stone-200 rounded hover:bg-stone-50 transition-colors cursor-pointer"
                  title="Copy customer email"
                >
                  {copiedCustomer ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('alex@example.com', 'CustomerPass123!')}
                  className="px-2 py-1 text-[11px] font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors cursor-pointer"
                >
                  Fill
                </button>
              </div>
            </div>

            {/* Store Admin Demo Link */}
            <div className="p-2.5 bg-white border border-stone-200 rounded-lg flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-stone-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                  <span>Store Admin Demo</span>
                </div>
                <div className="font-mono text-[11px] text-stone-600">admin@shopease.store</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopy('admin@shopease.store', 'admin')}
                  className="p-1.5 text-stone-500 hover:text-stone-900 border border-stone-200 rounded hover:bg-stone-50 transition-colors cursor-pointer"
                  title="Copy admin email"
                >
                  {copiedAdmin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/login')}
                  className="px-2 py-1 text-[11px] font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors cursor-pointer"
                >
                  Admin Login &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-stone-700">Password</label>
              <span className="text-[11px] text-stone-400">Default: CustomerPass123!</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In as Customer'}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 flex flex-col gap-2 text-center text-xs text-stone-500">
          <div>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-stone-900 font-semibold hover:underline cursor-pointer"
            >
              Register here
            </button>
          </div>

          <div className="pt-2 text-[11px] text-stone-400">
            Store administrator?{' '}
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="text-stone-700 font-medium hover:underline cursor-pointer"
            >
              Sign in at /admin/login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
