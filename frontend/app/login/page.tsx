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
  const [email, setEmail] = useState("jhonleovil@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    <div className="min-h-screen relative flex flex-col justify-between bg-[#FBF8F2] overflow-hidden select-none">
      {/* Top Branding Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-4 z-10">
        {/* Coffee Cup Artistic Logo */}
        <div className="relative mb-6">
          {/* Warm background glow blob */}
          <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-[#E2B184]/40 blur-sm pointer-events-none" />
          
          <svg
            className="w-28 h-28 text-[#6F452A]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft oval background accent behind cup */}
            <ellipse cx="65" cy="50" rx="20" ry="14" fill="#C69068" opacity="0.85" />
            
            {/* Steam lines */}
            <path
              d="M38 22C41 17 44 24 47 19"
              stroke="#6F452A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M48 20C51 14 55 22 58 16"
              stroke="#6F452A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            
            {/* Cup Rim */}
            <ellipse
              cx="48"
              cy="34"
              rx="24"
              ry="7"
              stroke="#2D1C13"
              strokeWidth="2.8"
              fill="#FBF8F2"
            />
            {/* Liquid inside */}
            <ellipse cx="48" cy="34" rx="19" ry="4.5" fill="#6F452A" />

            {/* Cup Body */}
            <path
              d="M26 36C27 54 35 64 48 64C61 64 69 54 70 36"
              stroke="#2D1C13"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Cup Handle */}
            <path
              d="M68 40C76 40 80 46 80 50C80 55 74 58 66 58"
              stroke="#2D1C13"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Saucer */}
            <path
              d="M20 68C32 75 64 75 76 68"
              stroke="#2D1C13"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Brand Titles */}
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#2D1C13] mb-1">
          Blaise
        </h1>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-[#8C5837]">✦</span>
          <span className="text-sm font-bold tracking-[0.25em] text-[#6F452A] uppercase">
            CAFÉ
          </span>
          <span className="text-xs text-[#8C5837]">✦</span>
        </div>

        <p className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] text-[#8C7B70] uppercase">
          COFFEE • BREAK • LAUGH
        </p>
      </div>

      {/* Decorative Floating Coffee Beans */}
      <div className="absolute bottom-52 right-8 pointer-events-none opacity-80 z-20">
        <svg width="48" height="40" viewBox="0 0 60 50" fill="none">
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
      <div className="relative w-full pt-16 z-10">
        {/* Layered Organic Waves SVG */}
        <div className="absolute top-0 inset-x-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            className="w-full h-24 sm:h-32 text-[#8C5837]"
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
        <div className="bg-[#8C5837] px-6 pb-8 pt-4">
          <div className="max-w-xs mx-auto space-y-3">
            {/* Primary Login Button */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full py-3.5 px-6 rounded-full bg-[#5A361F] text-white font-semibold text-sm shadow-md hover:bg-[#4E2E19] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Login</span>
            </button>

            {/* Create Account / Portal Info Button */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-full py-3.5 px-6 rounded-full border border-[#D49E78]/80 text-[#FBF8F2] font-semibold text-sm hover:bg-[#5A361F]/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Owner Portal</span>
            </button>

            {/* Bottom Tagline Caption */}
            <p className="text-center text-xs text-[#EAD8CA]/80 pt-3 italic font-serif">
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
                  Enter your owner credentials to continue
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
                    placeholder="jhonleovil@gmail.com"
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
