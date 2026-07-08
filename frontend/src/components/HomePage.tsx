"use client";

import { InvestigateButton } from "@/components/InvestigateButton";
import { useHealthCheck } from "@/hooks/useHealthCheck";

export function HomePage() {
  const { data, isLoading, isError } = useHealthCheck();

  const systemStatus = isLoading
    ? "Checking..."
    : isError
      ? "Backend Unavailable"
      : data?.status === "healthy"
        ? "Ready"
        : "Unknown";

  const statusColor = isError
    ? "text-red-600"
    : data?.status === "healthy"
      ? "text-green-600"
      : "text-amber-600";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          AI Kubernetes Agent
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Troubleshoot Kubernetes with AI
        </p>

        <div className="mt-8">
          <InvestigateButton
            onClick={() => {
              // Investigation flow will be implemented in a future phase.
            }}
          />
        </div>

        <p className="mt-8 text-sm text-slate-500">
          System Status:{" "}
          <span className={`font-medium ${statusColor}`}>{systemStatus}</span>
        </p>
      </div>
    </main>
  );
}
