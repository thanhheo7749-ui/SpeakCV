/*
 * Copyright (c) 2026 SpeakCV Team
 * This project is licensed under the MIT License.
 * See the LICENSE file in the project root for more information.
 */

"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SubscriptionContextType {
  plan: "free" | "pro";
  tokens: number;
  upgradeToPro: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>(
  {} as SubscriptionContextType,
);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [tokens, setTokens] = useState(100);

  useEffect(() => {
    const storedPlan = localStorage.getItem("subscription_plan") as
      | "free"
      | "pro"
      | null;
    const storedTokens = localStorage.getItem("subscription_tokens");

    if (storedPlan) {
      setPlan(storedPlan);
      setTokens(
        storedTokens
          ? parseInt(storedTokens)
          : storedPlan === "pro"
            ? 2000
            : 100,
      );
    }
  }, []);

  const upgradeToPro = async () => {
    setPlan("pro");
    setTokens(2000);
    localStorage.setItem("subscription_plan", "pro");
    localStorage.setItem("subscription_tokens", "2000");

    // Sync with backend database
    try {
      const { upgradeToPro: upgradeApi } = await import("@/services/api");
      await upgradeApi();
    } catch (e) {
      console.error("Failed to sync upgrade with backend:", e);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ plan, tokens, upgradeToPro }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
