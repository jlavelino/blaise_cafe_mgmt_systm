"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, Eye, EyeOff, Loader2, X, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load last used email on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("blaise_last_email");
      setEmail(savedEmail || "jhonleovil@gmail.com");
    }
  }, []);

  // If already authenticated, redirect straight to main page
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid credentials. Please verify your password.");
        setSubmitting(false);
        return;
      }

      if (data.session) {
        if (typeof window !== "undefined") {
          localStorage.setItem("blaise_last_email", email.trim());
        }
        router.replace("/");
      }
    } catch {
      setErrorMsg("An unexpected connection error occurred.");
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-3 border-[#6F452A]/20 border-t-[#6F452A] animate-spin" />
          <p className="text-sm font-medium text-[#8C7B70] tracking-wide">
            Brewing Blaise Café...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] min-h-[100dvh] relative flex flex-col justify-between bg-[#FBF8F2] overflow-hidden select-none">
      {/* Top Branding Section with Official Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-6 pb-2 z-10">
        <div className="relative mb-2">
          {/* Warm background glow blob */}
          <div className="absolute inset-0 bg-[#E2B184]/20 blur-xl rounded-full scale-110 pointer-events-none" />
          
          <img
            src="/Blaise_Cafe_Logo.png"
            alt="Blaise Café - Coffee • Break • Laugh"
            className="relative w-64 sm:w-80 max-w-[320px] h-auto object-contain mx-auto drop-shadow-md transition-transform hover:scale-102"
          />
        </div>
      </div>

      {/* Decorative Floating Coffee Beans */}
      <div className="absolute bottom-48 sm:bottom-52 right-6 sm:right-8 pointer-events-none opacity-80 z-20">
        <svg width="44" height="38" viewBox="0 0 60 50" fill="none">
          {/* Bean 1 */}
          <path
            d="M25 8C33 8 38 15 35 23C32 30 23 32 17 28C11 23 15 13 25 8Z"
            fill="#C69068"
          />
          <path
            d="M20 12C24 16 27 22 25 26"
            stroke="#FBF8F2"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Bean 2 */}
          <path
            d="M48 24C53 24 57 28 55 33C53 38 47 39 43 37C39 33 42 27 48 24Z"
            stroke="#8C5837"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M46 27C48 30 50 33 49 35"
            stroke="#8C5837"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Bottom Wave Organic Illustration & Action Area */}
      <div className="relative w-full z-10 shrink-0">
        {/* Layered Organic Waves SVG */}
        <div className="w-full overflow-hidden leading-none -mb-[2px] pointer-events-none">
          <svg
            className="w-full h-16 sm:h-24 block"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
          >
            {/* Soft terracotta upper wave */}
            <path
              d="M0,70 C100,20 220,110 400,35 L400,120 L0,120 Z"
              fill="#D49E78"
              opacity="0.85"
            />
            {/* Deep cocoa lower wave */}
            <path
              d="M0,90 C120,45 260,115 400,55 L400,120 L0,120 Z"
              fill="#8C5837"
            />
          </svg>
        </div>

        {/* Buttons on the wave background */}
        <div className="bg-[#8C5837] px-6 pt-2 pb-8 sm:pb-10 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <div className="max-w-xs mx-auto space-y-3">
            {/* Primary Login Button */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full py-3.5 px-6 rounded-full bg-[#4A2612] border border-[#D49E78]/60 text-white font-semibold text-sm shadow-xl hover:bg-[#3B1E0E] hover:border-[#D49E78] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Login</span>
            </button>

            {/* Bottom Tagline Caption */}
            <p className="text-center text-xs text-[#EAD8CA]/90 pt-1 italic font-serif">
              Good coffee, better days.
            </p>
          </div>
        </div>
      </div>

      {/* Slide-Up Login Modal Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in p-0 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#EFE8DE] transform transition-transform animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DE] mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2D1C13]">
                  Sign In to Blaise Café
                </h3>
                <p className="text-[11px] text-[#8C7B70]">
                  Enter your credentials to continue
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#8C7B70] hover:text-[#2D1C13] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#6F452A] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7B70]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#FBF8F2] border border-[#EFE8DE] text-[#2D1C13] text-sm focus:outline-none focus:ring-2 focus:ring-[#6F452A]/40 focus:border-[#6F452A] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#6F452A] mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7B70]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FBF8F2] border border-[#EFE8DE] text-[#2D1C13] text-sm focus:outline-none focus:ring-2 focus:ring-[#6F452A]/40 focus:border-[#6F452A] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C7B70] hover:text-[#2D1C13] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-sm bg-[#6F452A] text-white hover:bg-[#5A361F] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Access Register & Dashboard</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
