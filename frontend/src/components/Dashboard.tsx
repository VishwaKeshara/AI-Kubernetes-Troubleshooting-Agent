"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { DiagnosisCard } from "@/components/DiagnosisCard";
import { Header } from "@/components/Header";
import { InvestigationHistory } from "@/components/InvestigationHistory";
import { InvestigationProgress } from "@/components/InvestigationProgress";
import { InvestigateButton } from "@/components/InvestigateButton";
import { useInvestigation } from "@/hooks/useInvestigation";
import { useInvestigationHistory } from "@/hooks/useInvestigationHistory";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import { fetchContexts } from "@/services/api";

export function Dashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: health, isError: healthError } = useHealthCheck();
  const { history, isLoading: historyLoading, error: historyError, reload } =
    useInvestigationHistory();
  const { steps, diagnosis, error, isInvestigating, investigate } =
    useInvestigation(reload);

  const [contexts, setContexts] = useState<string[]>([]);
  const [selectedContext, setSelectedContext] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchContexts().then((list) => {
        setContexts(list);
        if (list.length > 0) {
          setSelectedContext(list[0]);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Loading dashboard...
      </div>
    );
  }

  const backendReady = !healthError && health?.status === "healthy";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Cluster Investigation
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                System Status:{" "}
                <span
                  className={
                    backendReady ? "font-medium text-green-600" : "font-medium text-red-600"
                  }
                >
                  {backendReady ? "Ready" : "Backend Unavailable"}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {contexts.length > 0 ? (
                <div className="flex flex-col">
                  <label htmlFor="context-select" className="text-xs font-semibold text-slate-500 mb-1">
                    Select Cluster
                  </label>
                  <select
                    id="context-select"
                    value={selectedContext}
                    onChange={(e) => setSelectedContext(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    disabled={isInvestigating || !backendReady}
                  >
                    {contexts.map((ctx) => (
                      <option key={ctx} value={ctx}>
                        {ctx}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <InvestigateButton
                onClick={() => investigate(selectedContext)}
                disabled={!backendReady || (contexts.length > 0 && !selectedContext)}
                loading={isInvestigating}
              />
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </section>

        <InvestigationProgress steps={steps} isInvestigating={isInvestigating} />
        <DiagnosisCard diagnosis={diagnosis} />
        <InvestigationHistory
          history={history}
          isLoading={historyLoading}
          error={historyError}
        />
      </main>
    </div>
  );
}
