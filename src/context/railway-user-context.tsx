"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { User } from "~/lib/railway-types";
import { fetchUser } from "~/lib/railway-fetch";

type RailwayUserContextType = {
  error: string;
  loading: boolean;
  user: User | null;
  setApiKey: (apiKey: string) => Promise<void>;
  resetUser: () => void;
};

const RailwayUserContext = createContext<RailwayUserContextType | null>(null);

interface RailwayUserProviderProps {
  children: React.ReactNode;
}

export const RailwayUserProvider = ({ children }: RailwayUserProviderProps) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const setApiKey = useCallback(async (apiKey: string) => {
    setLoading(true);
    setError("");

    try {
      localStorage.setItem("railway.apiKey", apiKey);

      const data = await fetchUser();
      setUser(data);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("railway.apiKey");
      setError(
        "Failed to fetch account information. Check if your API key is correct.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const resetUser = useCallback(() => {
    localStorage.removeItem("railway.apiKey");
    setUser(null);
  }, []);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("railway.apiKey");

    if (storedApiKey) {
      void setApiKey(storedApiKey);
    }
  }, [setApiKey]);

  const context = useMemo(
    () => ({
      error,
      loading,
      user,
      setApiKey,
      resetUser,
    }),
    [error, loading, user, setApiKey, resetUser],
  );

  return (
    <RailwayUserContext.Provider value={context}>
      {children}
    </RailwayUserContext.Provider>
  );
};

export const useRailwayUserContext = () => {
  const context = useContext(RailwayUserContext);

  if (!context) {
    throw new Error(
      "useRailwayUserContext must be used within a RailwayUserProvider",
    );
  }

  return context;
};
