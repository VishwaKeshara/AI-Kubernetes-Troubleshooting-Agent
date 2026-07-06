"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { fetchInvestigationHistory } from "@/services/investigations";
import type { InvestigationHistoryItem } from "@/types";

export function useInvestigationHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<InvestigationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const items = await fetchInvestigationHistory(user.id);
      setHistory(items);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load investigation history.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    isLoading,
    error,
    reload: loadHistory,
  };
}
