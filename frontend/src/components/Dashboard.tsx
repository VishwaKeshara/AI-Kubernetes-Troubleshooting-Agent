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
      <div className="flex min-h-screen items-center justify-center text-slate-400 bg-[#080B11]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const backendReady = !healthError && health?.status === "healthy";

  const getClusterUrl = (ctx: string) => {
    if (ctx.includes("kind")) return "https://host.docker.internal:50174";
    if (ctx.includes("eks") || ctx.includes("arn")) return "https://5E95F34CB4F7EE7F9598C3E0CA1E2404.gr7.ap-south-1.eks.amazonaws.com";
    if (ctx.includes("flyte")) return "https://host.docker.internal:6443";
    return "https://host.docker.internal:6443";
  };

  const getClusterSub = (ctx: string) => {
    if (ctx.includes("kind")) return "kind-kubernetes-demo-cluster";
    if (ctx.includes("eks") || ctx.includes("arn")) return "aws-eks-production-cluster";
    if (ctx.includes("flyte")) return "flytev2-sandbox";
    return "kubernetes-context";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F19] to-[#06080F] text-slate-100 pb-16">
      <Header />

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-6">
        {/* Title Section */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-md">
            AI Kubernetes Agent
          </h1>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Investigate cluster issues with AI-powered root cause analysis
          </p>
        </div>

        {/* Cluster Selection Card */}
        <section className="rounded-2xl border border-slate-800/80 bg-[#0D1321]/50 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-md shadow-blue-500/50"></div>
                <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">
                  Select Cluster
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {contexts.length} {contexts.length === 1 ? 'cluster' : 'clusters'} available
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">
                System Status:{" "}
                <span
                  className={
                    backendReady ? "font-semibold text-green-400" : "font-semibold text-red-400"
                  }
                >
                  {backendReady ? "Ready" : "Backend Unavailable"}
                </span>
              </span>

              <InvestigateButton
                onClick={() => investigate(selectedContext)}
                disabled={!backendReady || (contexts.length > 0 && !selectedContext)}
                loading={isInvestigating}
              />
            </div>
          </div>

          {/* Kubeconfig Path display */}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-950/40 px-4 py-3 text-xs font-mono text-slate-400 border border-slate-900/60 shadow-inner">
            <svg className="h-4 w-4 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span className="truncate">/tmp/k8s-agent-kubeconfig.json</span>
          </div>

          {/* Grid Selection */}
          {contexts.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-2">
              {contexts.map((ctx) => {
                const isSelected = selectedContext === ctx;
                const url = getClusterUrl(ctx);
                const subtitle = getClusterSub(ctx);
                return (
                  <button
                    key={ctx}
                    type="button"
                    disabled={isInvestigating || !backendReady}
                    onClick={() => setSelectedContext(ctx)}
                    className={`flex flex-col text-left p-4 rounded-xl border transition-all duration-200 outline-none ${
                      isSelected
                        ? "border-cyan-500/80 bg-cyan-950/15 shadow-md shadow-cyan-500/5 ring-1 ring-cyan-500/30"
                        : "border-slate-800/80 bg-[#101622]/30 hover:border-slate-700/80 hover:bg-[#101622]/60 hover:shadow-lg"
                    }`}
                  >
                    {/* Card Top */}
                    <div className="flex items-start justify-between w-full">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${
                        isSelected 
                          ? "bg-cyan-500/10 text-cyan-400 ring-cyan-500/20" 
                          : "bg-slate-800/40 text-slate-400 ring-slate-800"
                      }`}>
                        <svg className="h-5.5 w-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>

                      {/* Selection Badges */}
                      {isSelected && (
                        <div className="flex gap-1.5">
                          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                            current
                          </span>
                          <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 ring-1 ring-blue-500/20">
                            selected
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Context Name */}
                    <h3 className="mt-4 font-bold text-sm text-slate-100 truncate w-full">
                      {ctx}
                    </h3>

                    {/* Subtitle */}
                    <span className="mt-1 text-[11px] text-slate-500 font-medium truncate w-full">
                      {subtitle}
                    </span>

                    {/* Cluster Host URL */}
                    <span className="mt-6 text-[10px] font-mono text-slate-600 truncate w-full">
                      {url}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-slate-500 py-6">
              No Kubernetes clusters detected in active kubeconfig.
            </p>
          )}

          {error ? (
            <p className="mt-6 rounded-xl border border-red-900/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          ) : null}
        </section>

        {/* Diagnosis & Progress sections */}
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
