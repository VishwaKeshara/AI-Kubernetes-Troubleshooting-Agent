"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/AuthProvider";

export default function SignInPage() {
  const router = useRouter();
  const { user, isLoading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up" | "verify">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (mode === "verify") {
      const { insforge } = await import("@/lib/insforge");
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp,
      });
      if (error) {
        setMessage(error.message ?? "Verification failed");
      } else {
        setMessage("Email verified successfully! You can now sign in.");
        setMode("sign-in");
      }
      setIsSubmitting(false);
      return;
    }

    const result =
      mode === "sign-in"
        ? await signIn(email, password)
        : await signUp(email, password);

    if (result) {
      setMessage(result);
      if (mode === "sign-up" && result.includes("verification code")) {
        setMode("verify");
      }
      setIsSubmitting(false);
      return;
    }

    if (mode === "sign-in") {
      router.replace("/dashboard");
    }

    setIsSubmitting(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0B0F19] to-[#06080F] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-[#0D1321]/50 p-8 shadow-2xl backdrop-blur-md">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          AI Kubernetes Agent
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to investigate your cluster and view history.
        </p>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => { setMode("sign-in"); setMessage(null); }}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              mode === "sign-in"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                : "bg-slate-950/40 text-slate-400 border border-slate-900/50 hover:bg-slate-950/60"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("sign-up"); setMessage(null); }}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              mode === "sign-up"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                : "bg-slate-950/40 text-slate-400 border border-slate-900/50 hover:bg-slate-950/60"
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode("verify"); setMessage(null); }}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              mode === "verify"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                : "bg-slate-950/40 text-slate-400 border border-slate-900/50 hover:bg-slate-950/60"
            }`}
          >
            Verify
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl bg-slate-950/50 border border-slate-800/80 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-slate-600"
              placeholder="user@example.com"
            />
          </div>

          {mode !== "verify" && (
            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl bg-slate-950/50 border border-slate-800/80 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>
          )}

          {mode === "verify" && (
            <div>
              <label
                htmlFor="otp"
                className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase"
              >
                Verification Code (OTP)
              </label>
              <input
                id="otp"
                type="text"
                required
                placeholder="123456"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                className="mt-1.5 w-full rounded-xl bg-slate-950/50 border border-slate-800/80 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder-slate-600"
              />
            </div>
          )}

          {message ? (
            <p className="rounded-xl border border-amber-900/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-400 leading-relaxed">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/10 focus:outline-none transition-all disabled:opacity-50"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "sign-in"
                ? "Sign In"
                : mode === "sign-up"
                  ? "Create Account"
                  : "Verify Email"}
          </button>
        </form>
      </div>
    </main>
  );
}
