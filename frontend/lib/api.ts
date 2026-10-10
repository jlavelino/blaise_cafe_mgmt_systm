/**
 * Centralized API URL resolution
 * Handles both "http://localhost:5000" and "http://localhost:5000/api" seamlessly
 */
const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Base host without trailing /api or slash (e.g. "http://localhost:5000")
export const API_HOST = rawUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

// Standardized API endpoint base (e.g. "http://localhost:5000/api")
export const API_BASE = `${API_HOST}/api`;
