import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Product, Category, Order, CartItem } from '../shared/types.js';
import { apiRequest, setCsrfToken } from '../api/client.js';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ShopContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  products: Product[];
  categories: Category[];
  cart: {
    items: Array<{ productId: string; quantity: number; product?: Product }>;
    estimatedSubtotalMinor: number;
    itemCount: number;
  };
  isLoadingCatalog: boolean;
  selectedCategory: string;
  searchQuery: string;
  inStockOnly: boolean;
  sortBy: string;
  quickViewProduct: Product | null;
  isCartOpen: boolean;
  isCheckoutModalOpen: boolean;
  activeOrderReceipt: Order | null;
  toasts: ToastMessage[];

  // URL Navigation
  currentPath: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;

  // Mutators
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setInStockOnly: (val: boolean) => void;
  setSortBy: (sort: string) => void;
  setQuickViewProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutModalOpen: (open: boolean) => void;
  setActiveOrderReceipt: (order: Order | null) => void;

  // Actions
  login: (email: string, pass: string, portal?: 'customer' | 'admin') => Promise<string | undefined>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoAccount: (role: 'admin' | 'customer') => Promise<void>;
  refreshCatalog: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<{
    items: Array<{ productId: string; quantity: number; product?: Product }>;
    estimatedSubtotalMinor: number;
    itemCount: number;
  }>({ items: [], estimatedSubtotalMinor: 0, itemCount: 0 });

  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  // URL-based routing state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [activeOrderReceipt, setActiveOrderReceipt] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Navigation function syncing with browser history
  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    if (typeof window !== 'undefined') {
      if (options?.replace) {
        window.history.replaceState({}, '', path);
      } else {
        window.history.pushState({}, '', path);
      }
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Listen to popstate (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check current session on mount
  const checkAuth = useCallback(async () => {
    try {
      const res = await apiRequest<{ user: User | null; csrfToken: string }>('/api/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        if (res.data.csrfToken) {
          setCsrfToken(res.data.csrfToken);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // Fetch active categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiRequest<Category[]>('/api/categories');
      if (res.data) {
        setCategories(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load categories', err);
    }
  }, []);

  // Fetch catalog with current filters
  const refreshCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (inStockOnly) params.set('inStock', 'true');
      if (sortBy) params.set('sort', sortBy);
      params.set('limit', '30');

      const res = await apiRequest<Product[]>(`/api/products?${params.toString()}`);
      if (res.data) {
        setProducts(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load catalog', 'error');
    } finally {
      setIsLoadingCatalog(false);
    }
  }, [selectedCategory, searchQuery, inStockOnly, sortBy, showToast]);

  // Fetch persistent cart
  const refreshCart = useCallback(async () => {
    try {
      const res = await apiRequest<any>('/api/cart');
      if (res.data) {
        setCart({
          items: res.data.items || [],
          estimatedSubtotalMinor: res.data.estimatedSubtotalMinor || 0,
          itemCount: res.data.itemCount || 0,
        });
      }
    } catch {
      setCart({ items: [], estimatedSubtotalMinor: 0, itemCount: 0 });
    }
  }, []);

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, [checkAuth, fetchCategories]);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart({ items: [], estimatedSubtotalMinor: 0, itemCount: 0 });
    }
  }, [user, refreshCart]);

  // Auth actions
  const login = async (email: string, pass: string, portal: 'customer' | 'admin' = 'customer') => {
    const res = await apiRequest<{ user: User; csrfToken: string; targetRedirect?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass, portal }),
    });

    if (res.data) {
      setUser(res.data.user);
      setCsrfToken(res.data.csrfToken);
      showToast(`Welcome back, ${res.data.user.name}`, 'success');
      refreshCart();
      const redirect = res.data.targetRedirect || (res.data.user.role === 'admin' ? '/admin/dashboard' : '/');
      navigate(redirect);
      return redirect;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await apiRequest<{ user: User; csrfToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass }),
    });

    if (res.data) {
      setUser(res.data.user);
      setCsrfToken(res.data.csrfToken);
      showToast(`Account created for ${res.data.user.name}`, 'success');
      refreshCart();
      navigate('/');
    }
  };

  const logout = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setCart({ items: [], estimatedSubtotalMinor: 0, itemCount: 0 });
    showToast('Signed out successfully.', 'info');
    if (currentPath.startsWith('/admin') || currentPath === '/orders' || currentPath === '/account') {
      navigate('/');
    }
  };

  const switchDemoAccount = async (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      await login('admin@shopease.store', 'AdminPass123!', 'admin');
    } else {
      await login('alex@example.com', 'CustomerPass123!', 'customer');
    }
  };

  // Cart actions
  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      navigate('/login');
      showToast('Please sign in to add items to your cart.', 'info');
      return;
    }

    try {
      const existing = cart.items.find((i) => i.productId === productId);
      const newQuantity = (existing?.quantity || 0) + quantity;

      const res = await apiRequest<any>('/api/cart/items', {
        method: 'PUT',
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (res.data) {
        setCart({
          items: res.data.items || [],
          estimatedSubtotalMinor: res.data.estimatedSubtotalMinor || 0,
          itemCount: res.data.itemCount || 0,
        });
        showToast('Item added to cart', 'success');
        setIsCartOpen(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Could not add item to cart', 'error');
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    try {
      const res = await apiRequest<any>('/api/cart/items', {
        method: 'PUT',
        body: JSON.stringify({ productId, quantity }),
      });

      if (res.data) {
        setCart({
          items: res.data.items || [],
          estimatedSubtotalMinor: res.data.estimatedSubtotalMinor || 0,
          itemCount: res.data.itemCount || 0,
        });
      }
    } catch (err: any) {
      showToast(err.message || 'Could not update cart quantity', 'error');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await apiRequest(`/api/cart/items/${productId}`, { method: 'DELETE' });
      await refreshCart();
      showToast('Item removed from cart', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not remove item', 'error');
    }
  };

  const value: ShopContextType = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    products,
    categories,
    cart,
    isLoadingCatalog,
    selectedCategory,
    searchQuery,
    inStockOnly,
    sortBy,
    quickViewProduct,
    isCartOpen,
    isCheckoutModalOpen,
    activeOrderReceipt,
    toasts,

    currentPath,
    navigate,

    setSelectedCategory,
    setSearchQuery,
    setInStockOnly,
    setSortBy,
    setQuickViewProduct,
    setIsCartOpen,
    setIsCheckoutModalOpen,
    setActiveOrderReceipt,

    login,
    register,
    logout,
    switchDemoAccount,
    refreshCatalog,
    refreshCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    showToast,
    dismissToast,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
