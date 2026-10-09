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
import {
  Coffee,
  Search,
  X,
  LogOut,
  RefreshCw,
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function POSTerminalPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout } = useAuth();
  const { addItem } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Fetch Menu from Express Backend
  const loadMenu = async () => {
    if (!token) return;
    setLoadingMenu(true);
    setFetchError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      const [catsRes, prodsRes] = await Promise.all([
        fetch(`${apiUrl}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [catsData, prodsData] = await Promise.all([
        catsRes.json(),
        prodsRes.json()
      ]);

      if (catsRes.ok && catsData.success) {
        setCategories(catsData.data);
      } else {
        throw new Error(catsData.message || "Failed to load categories");
      }

      if (prodsRes.ok && prodsData.success) {
        setProducts(prodsData.data);
      } else {
        throw new Error(prodsData.message || "Failed to load products");
      }
    } catch (err: unknown) {
      console.error("Error loading menu:", err);
      setFetchError(
        err instanceof Error ? err.message : "Could not reach the Express backend."
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

  // Filter products by selected category and search term
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory =
        selectedCategoryId === null || prod.categoryId === selectedCategoryId;
      const matchesSearch =
        searchQuery.trim() === "" ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        prod.category?.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Calculate product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const prod of products) {
      counts[prod.categoryId] = (counts[prod.categoryId] || 0) + 1;
    }
    return counts;
  }, [products]);

  // Handle adding variant to cart
  const handleSelectVariant = (product: Product, variant: ProductVariant) => {
    addItem(product, variant);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121416]">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-[#1F2327] border border-[#2D3238] shadow-lg animate-pulse">
            <Coffee className="w-8 h-8 text-[#C8A882]" />
          </div>
          <p className="text-sm text-stone-400 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121416] text-[#F3F4F6] flex flex-col pb-28">
      {/* Top App Header */}
      <header className="sticky top-0 z-30 bg-[#16181A]/95 backdrop-blur-md border-b border-[#262A30] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#292E34] to-[#1C1F22] border border-[#3E454F] flex items-center justify-center shadow-md">
            <Coffee className="w-5 h-5 text-[#C8A882]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white leading-tight">
              BLAISE CAFÉ
            </h1>
            <p className="text-[10px] uppercase font-bold text-[#C8A882] tracking-wider">
              POS Terminal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={loadMenu}
            className="p-2 rounded-xl bg-[#20242A] border border-[#2F353E] text-stone-300 hover:text-white transition-colors"
            title="Refresh Menu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMenu ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#20242A] border border-[#2F353E] text-xs font-semibold text-stone-300 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto flex flex-col flex-1">
        {/* Search Bar */}
        <div className="px-4 pt-3.5 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drinks or snacks..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#191C20] border border-[#2C3138] text-white text-xs placeholder-stone-500 focus:outline-none focus:border-[#C8A882] focus:ring-1 focus:ring-[#C8A882]/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (Sticky) */}
        <div className="sticky top-[53px] z-20 bg-[#121416]/95 backdrop-blur-md pt-1 pb-2 border-b border-[#22262B]">
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
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/50 text-center space-y-2 my-6">
              <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
              <h3 className="text-xs font-bold text-red-200">Unable to load menu</h3>
              <p className="text-[11px] text-stone-400">{fetchError}</p>
              <button
                onClick={loadMenu}
                className="mt-2 px-3 py-1.5 text-xs font-bold bg-red-900/60 hover:bg-red-800 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : loadingMenu ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-32 rounded-2xl bg-[#191C20] border border-[#2A2E35] animate-pulse p-3.5 flex flex-col justify-between"
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-800/60" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-stone-800/80 rounded w-4/5" />
                    <div className="h-2.5 bg-stone-800/50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#1C1F23] border border-[#2A2E35] flex items-center justify-center mx-auto text-stone-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-stone-300">No items found</p>
              <p className="text-[11px] text-stone-500">
                Try searching with another keyword or select All Items.
              </p>
            </div>
          ) : (
            /* Active 2-Column Product Grid */
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

      {/* Drink Size Selector Sheet */}
      <SizeSelectorModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
        onSelectVariant={handleSelectVariant}
      />

      {/* Floating Bottom Cart Tray */}
      <CartTray />
    </div>
  );
}
