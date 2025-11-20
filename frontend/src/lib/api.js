/**
 * Centralized API configuration
 * Dynamically detects the backend URL based on the current host
 * This ensures API calls work from any device on the network
 */

/**
 * Get the backend API base URL
 * - On laptop: http://localhost:5001
 * - On phone: http://192.168.x.x:5001 (same as frontend host)
 */
export const getApiBaseUrl = () => {
  // Check if running in browser
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol; // http: or https:
    const hostname = window.location.hostname; // localhost or 192.168.x.x
    return `${protocol}//${hostname}:5001`;
  }
  
  // Fallback for server-side rendering
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
};

// Export a constant that components can use
export const API_BASE_URL = getApiBaseUrl();
