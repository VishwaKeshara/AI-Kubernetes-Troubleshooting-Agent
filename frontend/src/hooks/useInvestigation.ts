"use client";

import { useCallback, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { subscribeToInvestigationChannel } from "@/hooks/useInvestigationRealtime";
import { useInvestigationSteps } from "@/hooks/useInvestigationSteps";
import { getInvestigationErrorMessage, runInvestigation } from "@/services/api";
import { saveInvestigationHistory } from "@/services/investigations";
import type { Diagnosis } from "@/types";

export function useInvestigation(onHistorySaved: () => void) {
  const { user } = useAuth();
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const { steps, applyProgress, markAllComplete, resetSteps, startSteps } =
    useInvestigationSteps();

  const investigate = useCallback(async () => {
    if (!user) {
      setError("You must be signed in to investigate.");
      return;
    }

    const investigationId = crypto.randomUUID();
    setIsInvestigating(true);
    setError(null);
    setDiagnosis(null);
    resetSteps();
    startSteps();

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = await subscribeToInvestigationChannel(
        investigationId,
        applyProgress,
      );

      const result = await runInvestigation(investigationId);
      markAllComplete();
      setDiagnosis(result.diagnosis);
      await saveInvestigationHistory(user.id, result);
      onHistorySaved();
    } catch (err) {
      setError(getInvestigationErrorMessage(err));
    } finally {
      unsubscribe?.();
      setIsInvestigating(false);
    }
  }, [user, applyProgress, markAllComplete, resetSteps, startSteps, onHistorySaved]);

  return {
    steps,
    diagnosis,
    error,
    isInvestigating,
    investigate,
  };
}
