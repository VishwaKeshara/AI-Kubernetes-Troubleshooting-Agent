"use client";

import type { InvestigationHistoryItem } from "@/types";

interface InvestigationHistoryProps {
  history: InvestigationHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

export function InvestigationHistory({
  history,
  isLoading,
  error,
}: InvestigationHistoryProps) {
  return (
    <section className="rounded-2xl border border-slate-800/80 bg-[#0D1321]/50 p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800/50">
        <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-md shadow-cyan-500/50"></div>
        <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">
          Recent Investigations
        </h2>
      </div>

      {isLoading ? (
        <div className="mt-6 flex items-center justify-center py-6 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border border-slate-500 border-t-transparent mr-2"></div>
          Loading history...
        </div>
      ) : null}

      {error ? (
        <p className="mt-6 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-xl px-4 py-3">{error}</p>
      ) : null}

      {!isLoading && !error && history.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500 py-6 text-center border border-dashed border-slate-800/60 rounded-xl bg-slate-950/10">
          No investigations recorded yet.
        </p>
      ) : null}

      {!isLoading && history.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 pr-4 font-bold">Root Cause</th>
                <th className="py-3 pr-4 font-bold">Namespace</th>
                <th className="py-3 pr-4 font-bold">Confidence</th>
                <th className="py-3 pr-4 font-bold">Status</th>
                <th className="py-3 font-bold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {history.map((item) => {
                const isSuccess = item.status === "completed" || item.status === "success";
                const isFailed = item.status === "failed";
                return (
                  <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3.5 pr-4 font-medium text-slate-200">{item.root_cause}</td>
                    <td className="py-3.5 pr-4 text-slate-400 font-mono text-xs">{item.namespace}</td>
                    <td className="py-3.5 pr-4 text-slate-300 font-semibold">{item.confidence}%</td>
                    <td className="py-3.5 pr-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${
                        isSuccess
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                          : isFailed
                            ? "bg-rose-500/10 text-rose-400 ring-rose-500/20"
                            : "bg-slate-500/10 text-slate-400 ring-slate-500/20"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 text-xs">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
