import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Copy, Check, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext.js';

export function AdminLoginPage() {
  const { login, navigate, showToast } = useShop();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  const handleCopyAdmin = () => {
    navigator.clipboard.writeText('admin@shopease.store');
    setCopiedAdmin(true);
    setTimeout(() => setCopiedAdmin(false), 2000);
    showToast('Copied admin@shopease.store to clipboard', 'info');
  };

  const handleFillDemo = () => {
    setEmail('admin@shopease.store');
    setPassword('AdminPass123!');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // Pass portal: 'admin' to strictly enforce administrative role validation on backend
      await login(email, password, 'admin');
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Authentication failed. Ensure you have authorized store administrator privileges.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-20">
      <div className="bg-white border-2 border-stone-800 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Store Operations Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-950 font-serif-display mt-1">
            Store Administrator Login
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Administrative area for managing catalog, inventory, and order fulfillment.
          </p>
        </div>

        {/* DEMO ACCESS SECTION */}
        <div className="p-4 bg-stone-100 border border-stone-300 rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
              <span>ShopEase — Admin Demo Access</span>
            </span>
            <span className="text-[10px] font-mono text-stone-500">Authorized role</span>
          </div>

          <div className="p-3 bg-white border border-stone-200 rounded-lg flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-stone-900">Elena Rostova</div>
              <div className="font-mono text-[11px] text-stone-600">admin@shopease.store</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyAdmin}
                className="p-1.5 text-stone-600 hover:text-stone-900 border border-stone-200 rounded hover:bg-stone-50 transition-colors cursor-pointer"
                title="Copy admin email"
              >
                {copiedAdmin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded transition-colors cursor-pointer"
              >
                Auto Fill
              </button>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 leading-relaxed">
            *Backend strictly verifies credentials and server-side role. Customers cannot authenticate through this endpoint.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Admin Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopease.store"
                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-stone-700">Admin Password</label>
              <span className="text-[11px] text-stone-400">Default: AdminPass123!</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-stone-950 hover:bg-stone-850 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Authenticating Admin Session...' : 'Authenticate as Store Administrator'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-stone-700 font-semibold hover:underline cursor-pointer"
          >
            Customer Login (/login)
          </button>
        </div>
      </div>
    </div>
  );
}
