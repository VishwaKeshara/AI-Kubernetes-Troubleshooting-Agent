"use client";

interface InvestigateButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function InvestigateButton({
  onClick,
  disabled = false,
  loading = false,
}: InvestigateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/10 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ring-1 ring-blue-400/20 active:scale-[0.98] flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <span>Investigating...</span>
        </>
      ) : (
        "Investigate"
      )}
    </button>
  );
}
