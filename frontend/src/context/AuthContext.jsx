// ============================================
// AuthContext – Global authentication state
// ============================================
// Provides user info and auth methods to all
// components via React Context.
// ============================================

import { createContext, useContext, useState, useEffect } from "react";
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await getMe();
        setUser(data.user);
        setDemoMode(data.demoMode);
        setCanUpload(data.canUpload === true);
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
        setCanUpload(false);
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

  async function handleLogin(credentials) {
    const data = await apiLogin(credentials);
    setUser(data.user);
    setDemoMode(data.demoMode);
    setCanUpload(data.canUpload === true);
  }

  async function handleRegister(account) {
    const data = await apiRegister(account);
    setUser(data.user);
    setDemoMode(data.demoMode);
    setCanUpload(data.canUpload === true);
  }

  const value = {
    user,
    demoMode,
    canUpload,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state in any component.
 * Usage: const { user, demoMode, canUpload, loading, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
