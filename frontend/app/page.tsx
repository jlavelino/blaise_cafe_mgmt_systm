"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Coffee,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Server,
  Smartphone,
  Database,
  ArrowRight
} from "lucide-react";

interface BackendOwnerProfile {
  id: string;
  email: string;
  role: string;
  lastSignInAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();
  const [backendStatus, setBackendStatus] = useState<{
    verified: boolean;
    data?: BackendOwnerProfile;
    error?: string;
  } | null>(null);
  const [testingApi, setTestingApi] = useState(false);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Verify token against Express backend /api/auth/me
  useEffect(() => {
    if (token) {
      setTestingApi(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      
      fetch(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(async (res) => {
          const json = await res.json();
          if (res.ok && json.success) {
            setBackendStatus({ verified: true, data: json.data });
          } else {
            setBackendStatus({
              verified: false,
              error: json.message || "Failed to verify with backend"
            });
          }
        })
        .catch((err) => {
          setBackendStatus({
            verified: false,
            error: "Could not reach Express backend (ensure server is running on port 5000)"
          });
        })
        .finally(() => {
          setTestingApi(false);
        });
    }
  }, [token]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121416]">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-[#1F2327] border border-[#2D3238] shadow-lg animate-pulse">
            <Coffee className="w-8 h-8 text-[#C8A882]" />
          </div>
          <p className="text-sm text-stone-400 font-medium">
            Verifying owner session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121416] text-[#F3F4F6] flex flex-col">
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-40 bg-[#16181A]/95 backdrop-blur-md border-b border-[#282C32] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2A2F35] to-[#1C1F22] border border-[#3E454F] flex items-center justify-center shadow-md">
            <Coffee className="w-5 h-5 text-[#C8A882]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              BLAISE CAFÉ
            </h1>
            <p className="text-[10px] uppercase font-semibold text-[#C8A882] tracking-wider">
              Owner POS Terminal
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22262B] border border-[#333841] text-xs font-medium text-stone-300 hover:text-white hover:bg-red-950/40 hover:border-red-900 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Content (Mobile Optimized Container) */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 space-y-5">
        {/* Welcome Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1C1F23] to-[#17191C] border border-[#2C3138] shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Owner Authenticated
              </span>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#C8A882]" />
          </div>

          <h2 className="text-lg font-bold text-white">
            Welcome, {user.email?.split("@")[0]}! ☕
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Logged in as: <span className="text-stone-300 font-mono">{user.email}</span>
          </p>
        </div>

        {/* Phase 3 Backend Verification Badge */}
        <div className="p-5 rounded-2xl bg-[#181B1E] border border-[#2A2E35] space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#C8A882]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Full-Stack Security Handshake
            </h3>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            Your Next.js client sent your Supabase JWT to the Express backend (<code>/api/auth/me</code>). The backend middleware verified your token and confirmed your single-owner access.
          </p>

          {testingApi ? (
            <div className="p-3.5 rounded-xl bg-[#131517] border border-[#24282E] text-xs text-stone-400 flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-[#C8A882] border-t-transparent rounded-full animate-spin" />
              <span>Verifying JWT with Express backend...</span>
            </div>
          ) : backendStatus?.verified ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Express API Handshake Verified!</span>
              </div>
              <div className="text-[11px] text-stone-300 font-mono pl-6">
                Status: 200 OK • Role: {backendStatus.data?.role} • Express Protected
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200 space-y-1">
              <p className="font-semibold">⚠️ Backend Check Pending</p>
              <p className="text-[11px] text-stone-300">{backendStatus?.error || "Make sure backend server is running."}</p>
            </div>
          )}
        </div>

        {/* System Architecture Overview */}
        <div className="p-4 rounded-xl bg-[#151719] border border-[#23272D] space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            System Status
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-[#1B1E22] border border-[#2A2E35]">
              <Smartphone className="w-4 h-4 text-[#C8A882] mx-auto mb-1" />
              <div className="text-[11px] font-bold text-white">Next.js</div>
              <div className="text-[9px] text-emerald-400">Port 3000</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#1B1E22] border border-[#2A2E35]">
              <Server className="w-4 h-4 text-[#C8A882] mx-auto mb-1" />
              <div className="text-[11px] font-bold text-white">Express API</div>
              <div className="text-[9px] text-emerald-400">Port 5000</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#1B1E22] border border-[#2A2E35]">
              <Database className="w-4 h-4 text-[#C8A882] mx-auto mb-1" />
              <div className="text-[11px] font-bold text-white">Supabase</div>
              <div className="text-[9px] text-emerald-400">PostgreSQL</div>
            </div>
          </div>
        </div>

        {/* Phase 4 Preview Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#21252A] to-[#1A1D20] border border-[#30363F] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#C8A882] tracking-wider">
              Next in Line
            </div>
            <div className="text-xs font-semibold text-white mt-0.5">
              Phase 4: Product Catalog & POS Grid
            </div>
            <div className="text-[11px] text-stone-400">
              41 menu variants ready to display
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#C8A882]/10 border border-[#C8A882]/30 flex items-center justify-center text-[#C8A882]">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </main>
    </div>
  );
}
