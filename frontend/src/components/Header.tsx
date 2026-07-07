"use client";

import { useAuth } from "@/components/AuthProvider";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">AI Kubernetes Agent</h1>
        <p className="text-sm text-slate-500">Troubleshoot Kubernetes with AI</p>
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user.email}</span>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Sign Out
          </button>
        </div>
      ) : null}
    </header>
  );
}
