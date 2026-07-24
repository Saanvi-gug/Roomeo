import { createContext, useContext, useState, useCallback } from "react";
import * as api from "../api/mockApi";

// Why Context instead of prop-drilling or Redux:
//  - Two people (Frontend A + B) are building different page groups that
//    both need to know "is someone logged in?" and "what's their profile?".
//  - Context lets both sides read the same state without passing props
//    through five layers of components, and without pulling in a state
//    management library for what is genuinely a small amount of shared state.
//  - If the app grows past this hackathon, this is the seam where you'd
//    swap in Redux/Zustand - only this file would change.
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
