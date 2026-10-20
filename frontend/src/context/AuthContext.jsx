// ============================================
// AuthContext – Global authentication state
// ============================================
// Provides user info and auth methods to all
// components via React Context.
// ============================================

import { createContext, useContext, useState, useEffect } from "react";
import { getMe, logout as apiLogout } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await getMe();
        setUser(data.user);
        setDemoMode(data.demoMode);
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Logout handler
  async function handleLogout() {
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
  }

  const value = {
    user,
    demoMode,
    loading,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state in any component.
 * Usage: const { user, demoMode, loading, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
