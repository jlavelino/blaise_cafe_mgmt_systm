"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Category, Product, ProductVariant } from "@/types";
import { CategoryPills } from "@/components/CategoryPills";
import { ProductCard } from "@/components/ProductCard";
import { SizeSelectorModal } from "@/components/SizeSelectorModal";
import { CartTray } from "@/components/CartTray";
import { PaymentModal } from "@/components/PaymentModal";
import { ReceiptModal, CompletedOrderData } from "@/components/ReceiptModal";
import { BottomNavBar, ActiveTab } from "@/components/BottomNavBar";
import { DashboardView } from "@/components/DashboardView";
import { OrderHistoryView } from "@/components/OrderHistoryView";
import { DailyClosingModal } from "@/components/DailyClosingModal";
import { API_BASE } from "@/lib/api";
import {
  Coffee,
  Search,
  X,
  LogOut,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Bell
} from "lucide-react";

export default function AppMainPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout } = useAuth();
  const { items, subtotal, addItem, clearCart, setIsCartOpen } = useCart();

  // Navigation tab state (defaults to home dashboard as in 3.jpg)
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");

  // Menu states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  // Payment, Receipt, and Daily Closing Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderData | null>(null);
  const [isClosingOpen, setIsClosingOpen] = useState(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Fetch Menu from Express Backend
  const loadMenu = async () => {
    if (!token) return;

    try {
      setLoadingMenu(true);
      setFetchError(null);

      const [catRes, prodRes] = await Promise.all([
        fetch(`${API_BASE}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!catRes.ok || !prodRes.ok) {
        throw new Error("Failed to load catalog data from server");
      }

      const catJson = await catRes.json();
      const prodJson = await prodRes.json();

      if (catJson.success && prodJson.success) {
        setCategories(catJson.data);
        setProducts(prodJson.data);
      } else {
        throw new Error(prodJson.message || "Failed to parse menu items");
      }
    } catch (err: unknown) {
      console.error("Menu fetch error:", err);
      setFetchError(
        err instanceof Error ? err.message : "Error connecting to backend service"
      );
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadMenu();
    }
  }, [token]);

  // Category item counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter products by selected category and search term
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        !selectedCategoryId || product.categoryId === selectedCategoryId;
      const matchesSearch =
        searchQuery.trim() === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Open order receipt modal by ID
  const handleOpenReceiptFromId = async (orderId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCompletedOrder(json.data);
        }
      }
    } catch (err) {
      console.error("Error opening order receipt:", err);
    }
  };

  // Direct addition of single-variant products
  const handleSelectVariant = (product: Product, variant: ProductVariant) => {
    addItem(product, variant);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-3 border-[#6F452A]/20 border-t-[#6F452A] animate-spin" />
          <p className="text-sm font-medium text-[#8C7B70]">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F2] text-[#2D1C13] flex flex-col">
      {/* Top App Header */}
      <header className="sticky top-0 z-30 bg-[#FBF8F2]/95 backdrop-blur-md border-b border-[#EFE8DE] px-4 py-3 flex items-center justify-between max-w-md w-full mx-auto shadow-cafe-sm">
        <div className="flex items-center gap-2.5">
          {/* Logo Mark */}
          <div className="w-8 h-8 rounded-full bg-[#F5EFEB] border border-[#EFE8DE] flex items-center justify-center text-[#6F452A]">
            <Coffee className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-base tracking-tight text-[#2D1C13]">
                Blaise
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#8C5837] uppercase">
                CAFÉ
              </span>
            </div>
            <p className="text-[10px] font-medium text-[#8C7B70] tracking-wide">
              {activeTab === "home"
                ? "Owner Dashboard"
                : activeTab === "pos"
                ? "New Order POS"
                : activeTab === "orders"
                ? "Orders Queue"
                : "Sales Reports"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "pos" && (
            <button
              onClick={loadMenu}
              className="p-2 rounded-full bg-white border border-[#EFE8DE] text-[#6F452A] hover:bg-[#F5EFEB] transition-colors shadow-xs cursor-pointer"
              title="Refresh Menu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMenu ? "animate-spin" : ""}`} />
            </button>
          )}

          <button
            onClick={() => setActiveTab("reports")}
            className="p-2 rounded-full bg-white border border-[#EFE8DE] text-[#8C7B70] hover:text-[#6F452A] transition-colors shadow-xs cursor-pointer"
            title="Notifications & Reports"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#EFE8DE] text-xs font-semibold text-[#8C7B70] hover:text-red-700 transition-colors shadow-xs cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3 h-3" />
            <span className="text-[11px]">Logout</span>
          </button>
        </div>
      </header>

      {/* VIEW: HOME DASHBOARD */}
      {activeTab === "home" && (
        <DashboardView
          onSelectOrder={handleOpenReceiptFromId}
          onOpenClosing={() => setIsClosingOpen(true)}
          onNavigateToPOS={() => setActiveTab("pos")}
        />
      )}

      {/* VIEW: POS REGISTER */}
      {activeTab === "pos" && (
        <main className="max-w-md w-full mx-auto flex flex-col flex-1 pb-36">
          {/* Search Bar */}
          <div className="px-4 pt-3.5 pb-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7B70]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order # or item..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-[#EFE8DE] text-[#2D1C13] text-xs placeholder-[#8C7B70] focus:outline-none focus:border-[#6F452A] focus:ring-1 focus:ring-[#6F452A]/40 transition-all shadow-cafe-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7B70] hover:text-[#2D1C13] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Pills (Sticky) */}
          <div className="sticky top-[57px] z-20 bg-[#FBF8F2]/95 backdrop-blur-md pt-1 pb-2 border-b border-[#EFE8DE]">
            <CategoryPills
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
              categoryCounts={categoryCounts}
              totalCount={products.length}
            />
          </div>

          {/* Product Grid Area */}
          <div className="flex-1 px-4 pt-4">
            {fetchError ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-2 my-6">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
                <h3 className="text-xs font-bold text-red-800">Unable to load menu</h3>
                <p className="text-[11px] text-red-600">{fetchError}</p>
                <button
                  onClick={loadMenu}
                  className="mt-2 px-3 py-1.5 text-xs font-bold bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : loadingMenu ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="h-36 rounded-2xl bg-white border border-[#EFE8DE] animate-pulse p-3.5 flex flex-col justify-between shadow-cafe-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F5EFEB]" />
                    <div className="space-y-1.5">
                      <div className="h-3 bg-[#F5EFEB] rounded w-4/5" />
                      <div className="h-2.5 bg-[#F5EFEB] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EFE8DE] flex items-center justify-center mx-auto text-[#8C7B70] shadow-cafe-sm">
                  <Sparkles className="w-6 h-6 text-[#C69068]" />
                </div>
                <p className="text-xs font-bold text-[#2D1C13]">No items found</p>
                <p className="text-[11px] text-[#8C7B70]">
                  Try searching with another keyword or select All.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(p) => setActiveModalProduct(p)}
                    onDirectAdd={handleSelectVariant}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* VIEW: ORDER HISTORY / ORDERS QUEUE */}
      {activeTab === "orders" && (
        <OrderHistoryView onSelectOrder={(order) => setCompletedOrder(order)} />
      )}

      {/* VIEW: SALES REPORTS */}
      {activeTab === "reports" && (
        <DashboardView
          onSelectOrder={handleOpenReceiptFromId}
          onOpenClosing={() => setIsClosingOpen(true)}
          onNavigateToPOS={() => setActiveTab("pos")}
        />
      )}

      {/* Drink Size Selector Sheet */}
      <SizeSelectorModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
        onSelectVariant={handleSelectVariant}
      />

      {/* Floating Bottom Cart Tray (Only when on POS tab) */}
      {activeTab === "pos" && (
        <CartTray
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsPaymentOpen(true);
          }}
        />
      )}

      {/* Bottom Tab Navigation Bar */}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Payment & Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        subtotal={subtotal}
        items={items}
        onOrderCompleted={(order) => {
          setIsPaymentOpen(false);
          setCompletedOrder(order);
          clearCart();
        }}
      />

      {/* Sale Confirmation Receipt Modal */}
      <ReceiptModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      {/* Daily Cash Balancing & Closing Modal */}
      <DailyClosingModal
        isOpen={isClosingOpen}
        onClose={() => setIsClosingOpen(false)}
      />
    </div>
  );
}
