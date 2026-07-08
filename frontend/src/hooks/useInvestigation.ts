"use client";

import { useCallback, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { useInvestigationRealtime } from "@/hooks/useInvestigationRealtime";
import { runInvestigation } from "@/services/api";
import { saveInvestigationHistory } from "@/services/investigations";
import type { Diagnosis, InvestigationResult } from "@/types";

export function useInvestigation(onHistorySaved: () => void) {
  const { user } = useAuth();
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const { steps, markAllComplete, resetSteps } =
    useInvestigationRealtime(investigationId);

  const investigate = useCallback(async (selectedContext?: string) => {
    if (!user) {
      setError("You must be signed in to investigate.");
      return;
    }

    const id = crypto.randomUUID();
    setInvestigationId(id);
    setIsInvestigating(true);
    setError(null);
    setDiagnosis(null);
    resetSteps();

    try {
      const result: InvestigationResult = await runInvestigation(id, selectedContext);
      markAllComplete();
      setDiagnosis(result.diagnosis);
      await saveInvestigationHistory(user.id, result);
      onHistorySaved();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Investigation failed unexpectedly.";
      setError(message);
    } finally {
      setIsInvestigating(false);
    }
  }, [user, markAllComplete, resetSteps, onHistorySaved]);

  return {
    steps,
    diagnosis,
    error,
    isInvestigating,
    investigate,
  };
}
