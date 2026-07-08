"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleInvestigate = async () => {
    setLoading(true);
    setResult(null);
    // Mimic the placeholder investigation flow
    setTimeout(() => {
      setLoading(false);
      setResult("Investigation complete. Kubernetes cluster analysis completed successfully. All checkmarks are green (placeholder).");
    }, 2000);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" 
      />

      <div className="relative z-10 max-w-xl w-full text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-300 text-xs font-medium mb-6 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Autonomous Diagnostic Node
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-indigo-200 to-violet-300 mb-4">
          AI Kubernetes Agent
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-slate-400 font-light mb-8 max-w-md mx-auto">
          Troubleshoot Kubernetes with AI
        </p>

        {/* Main interactive panel */}
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-6">
          <button
            onClick={handleInvestigate}
            disabled={loading}
            className="group relative w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing cluster state...
              </span>
            ) : (
              <span>Investigate Cluster</span>
            )}
          </button>

          {/* System status display */}
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Status: <span className="text-emerald-400">Ready</span>
          </div>

          {/* Results display */}
          {result && (
            <div className="mt-4 p-4 w-full rounded-lg bg-slate-950/60 border border-slate-800 text-left text-sm text-slate-300">
              <div className="text-violet-400 font-semibold mb-1">Diagnostic Output:</div>
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
