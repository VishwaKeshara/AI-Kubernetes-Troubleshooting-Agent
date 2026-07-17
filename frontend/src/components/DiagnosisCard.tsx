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
    <section className="rounded-2xl border border-slate-800/80 bg-[#0D1321]/50 p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800/50">
        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/50"></div>
        <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">
          Diagnosis Report
        </h2>
      </div>

      <div className="mt-6 space-y-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Root Cause</p>
              <p className="mt-1.5 text-base font-semibold text-slate-200">{diagnosis.root_cause}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Explanation</p>
              <p className="mt-1.5 text-slate-300 leading-relaxed">{diagnosis.explanation}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Suggested Fix</p>
              <p className="mt-1.5 text-slate-300 leading-relaxed">{diagnosis.fix}</p>
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Confidence Score</p>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent drop-shadow-sm">
                  {diagnosis.confidence}%
                </span>
                {diagnosis.confidence_reasoning ? (
                  <span className="text-xs text-slate-400 bg-slate-900/40 border border-slate-800/50 px-2.5 py-1.5 rounded-lg leading-relaxed">
                    {diagnosis.confidence_reasoning}
                  </span>
                ) : null}
              </div>
            </div>

            {diagnosis.kubectl_command ? (
              <div className="pt-2">
                <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Recommended kubectl command</p>
                <div className="mt-2 rounded-xl border border-slate-800 bg-[#06080F] overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between bg-slate-950/70 px-4 py-2 border-b border-slate-900/80">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500/80"></span>
                      <span className="h-2 w-2 rounded-full bg-amber-500/80"></span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500/80"></span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 font-bold tracking-widest">KUBECTL CONSOLE</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs font-mono text-cyan-400 bg-transparent leading-relaxed select-all">
                    {diagnosis.kubectl_command}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
