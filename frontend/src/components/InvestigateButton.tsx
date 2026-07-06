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
      className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Investigating..." : "Investigate Cluster"}
    </button>
  );
}
