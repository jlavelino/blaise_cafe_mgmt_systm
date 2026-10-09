"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Coffee, Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("jhonleovil@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect straight to register/dashboard
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
        password
      });

      if (error) {
        setErrorMsg(error.message || "Invalid login credentials. Please try again.");
        setSubmitting(false);
        return;
      }

      if (data.session) {
        router.replace("/");
      }
    } catch (err: unknown) {
      setErrorMsg("An unexpected connection error occurred.");
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121416]">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-[#1F2327] border border-[#2D3238] shadow-lg animate-pulse">
            <Coffee className="w-8 h-8 text-[#C8A882]" />
          </div>
          <p className="text-sm text-stone-400 font-medium tracking-wide">
            Loading Blaise Café...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-8 bg-[#121416] text-[#F3F4F6]">
      {/* Mobile-sized container */}
      <div className="w-full max-w-sm mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#262B30] to-[#1A1D20] border border-[#3A4048] shadow-xl mb-4">
            <Coffee className="w-9 h-9 text-[#C8A882]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            BLAISE CAFÉ
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#C8A882] font-semibold mt-1">
            Owner Management Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1A1D21] border border-[#2B3037] rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#2B3037]/60 text-xs text-stone-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#C8A882]" />
            <span>Secure Single-Owner Access</span>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Owner Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@blaisecafe.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#121416] border border-[#2E333B] text-white text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#C8A882]/50 focus:border-[#C8A882] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#121416] border border-[#2E333B] text-white text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#C8A882]/50 focus:border-[#C8A882] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300 transition-colors"
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
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#C8A882] to-[#B6956F] text-[#121416] hover:from-[#DFCAAF] hover:to-[#C8A882] active:scale-[0.99] transition-all shadow-lg shadow-[#C8A882]/10 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Open Café Register</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-stone-500 mt-6">
          Blaise Café POS System • Authorized Owner Terminal
        </p>
      </div>
    </div>
  );
}
