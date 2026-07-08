"use client";

import type { ProgressStep } from "@/types";

interface InvestigationProgressProps {
  steps: ProgressStep[];
  isInvestigating: boolean;
}

function StepIcon({ status }: { status: ProgressStep["status"] }) {
  if (status === "complete") {
    return <span className="text-green-600">✓</span>;
  }
  if (status === "running") {
    return <span className="text-primary-600">•</span>;
  }
  return <span className="text-slate-300">○</span>;
}

export function InvestigationProgress({
  steps,
  isInvestigating,
}: InvestigationProgressProps) {
  if (!isInvestigating && steps.every((step) => step.status === "pending")) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Investigation Status</h2>
      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-3 text-sm">
            <StepIcon status={step.status} />
            <span
              className={
                step.status === "running"
                  ? "font-medium text-primary-700"
                  : step.status === "complete"
                    ? "text-slate-700"
                    : "text-slate-400"
              }
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
