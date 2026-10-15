import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext.js';
import { AppHeader } from './components/layout/AppHeader.js';
import { AppFooter } from './components/layout/AppFooter.js';
import { StorefrontView } from './components/views/StorefrontView.js';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';
import { CustomerRegisterPage } from './pages/CustomerRegisterPage.js';
import { CustomerAccountPage } from './pages/CustomerAccountPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrdersView } from './components/views/OrdersView.js';
import { AdminLoginPage } from './pages/AdminLoginPage.js';
import { AdminPortalView } from './components/views/AdminPortalView.js';
import { SpecVerificationView } from './components/views/SpecVerificationView.js';
import { ProductDetailModal } from './components/catalog/ProductDetailModal.js';
import { CartDrawer } from './components/cart/CartDrawer.js';
import { CheckoutModal } from './components/checkout/CheckoutModal.js';
import { OrderReceiptModal } from './components/orders/OrderReceiptModal.js';
import { ToastContainer } from './components/feedback/ToastContainer.js';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

function AppContent() {
  const { currentPath, isAdmin, navigate, switchDemoAccount } = useShop();

  // Normalize path without trailing slash (except root)
  const normalizedPath = currentPath === '/' ? '/' : currentPath.replace(/\/+$/, '');

  const renderCurrentRoute = () => {
    // 1. Customer & Storefront routes
    if (normalizedPath === '' || normalizedPath === '/') {
      return <StorefrontView />;
    }

    if (normalizedPath === '/login') {
      return <CustomerLoginPage />;
    }

    if (normalizedPath === '/register') {
      return <CustomerRegisterPage />;
    }

    if (normalizedPath === '/account') {
      return <CustomerAccountPage />;
    }

    if (normalizedPath === '/cart') {
      return <CartPage />;
    }

    if (normalizedPath === '/checkout') {
      return <CheckoutPage />;
    }

    if (normalizedPath === '/orders') {
      return <OrdersView />;
    }

    // 2. Admin routes
    if (normalizedPath === '/admin/login') {
      return <AdminLoginPage />;
    }

    if (
      normalizedPath === '/admin' ||
      normalizedPath === '/admin/dashboard' ||
      normalizedPath === '/admin/products' ||
      normalizedPath === '/admin/categories' ||
      normalizedPath === '/admin/orders' ||
      normalizedPath === '/admin/inventory' ||
      normalizedPath === '/admin/webhooks'
    ) {
      if (isAdmin) {
        return <AdminPortalView />;
      }

      // Role authorization gate for unauthenticated users
      return (
        <div className="max-w-lg mx-auto my-20 p-8 bg-white border-2 border-stone-800 rounded-2xl text-center space-y-5 shadow-lg">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-stone-900 font-serif-display">
              Store Administrator Access Required
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
              The requested administrative portal (<code>{normalizedPath}</code>) is restricted to verified store operations accounts.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Go to Store Admin Login (/admin/login)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => switchDemoAccount('admin')}
              className="w-full py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Authenticate as Elena Rostova (admin@shopease.store)
            </button>
          </div>

          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
            Customer? <button onClick={() => navigate('/login')} className="text-stone-800 font-semibold hover:underline cursor-pointer">Sign in to Customer Account</button>
          </div>
        </div>
      );
    }

    // 3. Technical specification audit route
    if (normalizedPath === '/spec-audit' || normalizedPath === '/audit') {
      return <SpecVerificationView />;
    }

    // 4. Default fallback: Storefront
    return <StorefrontView />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-white">
      <AppHeader />

      <main className="flex-1">
        {renderCurrentRoute()}
      </main>

      <AppFooter />

      {/* Global Modals & Overlays */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderReceiptModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
