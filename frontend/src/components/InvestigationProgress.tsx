"use client";

import type { ProgressStep } from "@/types";

interface InvestigationProgressProps {
  steps: ProgressStep[];
  isInvestigating: boolean;
}

export function InvestigationProgress({
  steps,
  isInvestigating,
}: InvestigationProgressProps) {
  if (!isInvestigating && steps.every((step) => step.status === "pending")) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-[#0D1321]/50 p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800/50 mb-6">
        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-md shadow-blue-500/50"></div>
        <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">
          Investigation Progress
        </h2>
      </div>

      <div className="relative pl-6 border-l border-slate-800/80 space-y-6 ml-2 py-1">
        {steps.map((step) => {
          const isRunning = step.status === "running";
          const isComplete = step.status === "complete";
          return (
            <div key={step.id} className="relative flex items-center gap-4">
              {/* Custom Step Circle marker on the line */}
              <div className={`absolute -left-[33px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-[#080B11] ${
                isComplete
                  ? "bg-emerald-500 text-[#080B11]"
                  : isRunning
                    ? "bg-blue-500 animate-glow-pulse"
                    : "bg-slate-800"
              }`}>
                {isComplete && (
                  <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {isRunning && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                )}
              </div>

              <div className="flex flex-col">
                <span className={`text-sm font-medium transition-all duration-200 ${
                  isRunning
                    ? "text-blue-400 font-semibold tracking-wide"
                    : isComplete
                      ? "text-slate-300"
                      : "text-slate-600"
                }`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
