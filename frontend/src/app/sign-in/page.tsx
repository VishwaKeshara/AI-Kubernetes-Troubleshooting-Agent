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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">AI Kubernetes Agent</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to investigate your cluster and view history.
        </p>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => { setMode("sign-in"); setMessage(null); }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "sign-in"
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("sign-up"); setMessage(null); }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "sign-up"
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode("verify"); setMessage(null); }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "verify"
                ? "bg-primary-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Verify
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {mode !== "verify" && (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
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
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
            </div>
          )}

          {mode === "verify" && (
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-slate-700"
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
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
            </div>
          )}

          {message ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
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
