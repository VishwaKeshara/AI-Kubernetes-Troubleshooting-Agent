"use client";

import { useCallback, useEffect, useState } from "react";

import { insforge } from "@/lib/insforge";
import {
  INVESTIGATION_STEPS,
  type InvestigationProgressEvent,
  type ProgressStep,
} from "@/types";

export function useInvestigationRealtime(investigationId: string | null) {
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

  useEffect(() => {
    if (!investigationId) {
      setSteps(INVESTIGATION_STEPS);
      return;
    }

    let isActive = true;

    const onProgress = (payload: unknown) => {
      if (!isActive) {
        return;
      }

      const event = payload as unknown as InvestigationProgressEvent;
      if (event.step && event.label && event.status) {
        applyProgress(event);
      }
    };

    const setupRealtime = async () => {
      setSteps(
        INVESTIGATION_STEPS.map((step, index) => ({
          ...step,
          status: index === 0 ? "running" : "pending",
        })),
      );

      insforge.realtime.on("investigation_progress", onProgress);

      await insforge.realtime.connect();
      const response = await insforge.realtime.subscribe(
        `investigation:${investigationId}`,
      );

      if (!response.ok) {
        console.error("Failed to subscribe to investigation channel", response.error);
      }
    };

    setupRealtime().catch((error) => {
      console.error("Realtime setup failed", error);
    });

    return () => {
      isActive = false;
      insforge.realtime.off("investigation_progress", onProgress);
      insforge.realtime.unsubscribe(`investigation:${investigationId}`);
    };
  }, [investigationId, applyProgress]);

  const markAllComplete = useCallback(() => {
    setSteps((current) =>
      current.map((step) => ({
        ...step,
        status: "complete",
      })),
    );
  }, []);

  const resetSteps = useCallback(() => {
    setSteps(INVESTIGATION_STEPS);
  }, []);

  return { steps, markAllComplete, resetSteps };
}
