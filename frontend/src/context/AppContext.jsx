import { createContext, useContext, useState, useCallback } from "react";
import * as api from "../api/mockApi";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [profile, setProfile] = useState(null);

  const refreshProfile = useCallback(async () => {
    const p = await api.getProfile();
    setProfile(p);
    return p;
  }, []);

  const handleAuthSuccess = useCallback(async () => {
    setIsAuthenticated(true);
    await refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(() => {
    api.logout();
    setIsAuthenticated(false);
    setProfile(null);
  }, []);

  const value = {
    isAuthenticated,
    profile,
    refreshProfile,
    handleAuthSuccess,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
