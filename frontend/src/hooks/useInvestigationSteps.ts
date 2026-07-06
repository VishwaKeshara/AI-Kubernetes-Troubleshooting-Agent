"use client";

import { useCallback, useState } from "react";

import {
  INVESTIGATION_STEPS,
  type InvestigationProgressEvent,
  type ProgressStep,
} from "@/types";

export function useInvestigationSteps() {
  const [steps, setSteps] = useState<ProgressStep[]>(INVESTIGATION_STEPS);

  const applyProgress = useCallback((event: InvestigationProgressEvent) => {
    setSteps((current) =>
      current.map((step) => {
        if (step.id === event.step) {
          return {
            ...step,
            label: event.label,
            status: event.status,
          };
        }

        if (event.status === "running") {
          const stepIndex = current.findIndex((item) => item.id === event.step);
          const currentIndex = current.findIndex((item) => item.id === step.id);
          if (currentIndex < stepIndex && step.status !== "complete") {
            return { ...step, status: "complete" };
          }
        }

        return step;
      }),
    );
  }, []);

  const resetSteps = useCallback(() => {
    setSteps(INVESTIGATION_STEPS);
  }, []);

  const startSteps = useCallback(() => {
    setSteps(
      INVESTIGATION_STEPS.map((step, index) => ({
        ...step,
        status: index === 0 ? "running" : "pending",
      })),
    );
  }, []);

  const markAllComplete = useCallback(() => {
    setSteps((current) =>
      current.map((step) => ({
        ...step,
        status: "complete",
      })),
    );
  }, []);

  return {
    steps,
    applyProgress,
    resetSteps,
    startSteps,
    markAllComplete,
  };
}
