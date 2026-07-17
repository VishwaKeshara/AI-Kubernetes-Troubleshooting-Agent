"use client";

import { useAuth } from "@/components/AuthProvider";

export function Header() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <header className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5 bg-transparent">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/10 ring-1 ring-blue-400/20">
          <svg className="h-5.5 w-5.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Signed in as</span>
          <span className="text-sm font-medium text-slate-200">{user.email}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signOut()}
        className="text-sm font-medium text-slate-400 transition-colors hover:text-white focus:outline-none"
      >
        Sign out
      </button>
    </header>
  );
}
