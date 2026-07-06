"use client";

import type { Diagnosis } from "@/types";

interface DiagnosisCardProps {
  diagnosis: Diagnosis | null;
}

export function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
  if (!diagnosis) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Diagnosis</h2>

      <div className="mt-4 space-y-4 text-sm">
        <div>
          <p className="font-medium text-slate-500">Root Cause</p>
          <p className="mt-1 text-slate-900">{diagnosis.root_cause}</p>
        </div>

        <div>
          <p className="font-medium text-slate-500">Explanation</p>
          <p className="mt-1 text-slate-700">{diagnosis.explanation}</p>
        </div>

        <div>
          <p className="font-medium text-slate-500">Suggested Fix</p>
          <p className="mt-1 text-slate-700">{diagnosis.fix}</p>
        </div>

        {diagnosis.kubectl_command ? (
          <div>
            <p className="font-medium text-slate-500">Command</p>
            <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-xs text-slate-100">
              {diagnosis.kubectl_command}
            </pre>
          </div>
        ) : null}

        <div>
          <p className="font-medium text-slate-500">Confidence</p>
          <p className="mt-1 text-2xl font-bold text-primary-700">
            {diagnosis.confidence}%
          </p>
          {diagnosis.confidence_reasoning ? (
            <p className="mt-1 text-slate-600">{diagnosis.confidence_reasoning}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
