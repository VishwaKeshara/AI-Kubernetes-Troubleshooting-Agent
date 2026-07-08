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
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recent Investigations</h2>

      {isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Loading history...</p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}

      {!isLoading && !error && history.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No investigations yet.</p>
      ) : null}

      {!isLoading && history.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-medium">Root Cause</th>
                <th className="py-2 pr-4 font-medium">Namespace</th>
                <th className="py-2 pr-4 font-medium">Confidence</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 text-slate-900">{item.root_cause}</td>
                  <td className="py-3 pr-4 text-slate-700">{item.namespace}</td>
                  <td className="py-3 pr-4 text-slate-700">{item.confidence}%</td>
                  <td className="py-3 pr-4 capitalize text-slate-700">{item.status}</td>
                  <td className="py-3 text-slate-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
