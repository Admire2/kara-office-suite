"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Mode = "login" | "signup" | "forgot" | "update";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || "");
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;
        if (token) {
          const r = await fetch("/api/usage?action=status&tool=validator", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: token }),
          });
          const j = await r.json();
          if (j.plan) setPlan(j.plan);
        }
      }
    });

    // Listen for password recovery event (fires when user clicks the email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
        setMessage("You are securely logged in. Please set your new password below.");
        setError("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function tryPendingActivation() {
    const pending = window.localStorage.getItem("pending_activation");
    if (!pending) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch("/api/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: pending, access_token: token }),
    });
    if (res.ok) {
      window.localStorage.removeItem("pending_activation");
      setMessage("Payment verified! Your plan is now active on your account.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (data.session) {
        setUserEmail(email);
        setMessage("Welcome aboard! You are signed in.");
        await tryPendingActivation();
      } else {
        setMessage("Account created! Check your Gmail inbox, click the confirmation link, then log in here.");
      }
    } else if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else { setUserEmail(email); await tryPendingActivation(); }
    } else if (mode === "update") {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) setError(error.message);
      else {
        setMessage("Password updated successfully! You can now use this password to log in anywhere.");
        setMode("login");
        setNewPassword("");
      }
    }
    setLoading(false);
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) setError(error.message);
    else setMessage("Password reset link sent! Check your email inbox (and spam folder).");
    
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserEmail("");
    setMessage("");
    setMode("login");
  }

  const inputClass = "box-border w-full max-w-full rounded-xl border border-white/10 bg-slate-900/70 p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400";
  const btnClass = "mt-6 box-border w-full max-w-full rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60";

  return (
    <main className="w-full min-w-0 p-6 md:p-10">
      <div className="mx-auto max-w-md min-w-0">
        <header className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">FounderPilot AI</p>
          <h1 className="mt-3 text-3xl font-bold">
            {userEmail ? "Your Account" : mode === "forgot" ? "Reset Password" : mode === "update" ? "Set New Password" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {userEmail 
              ? "Secure your reports, sync your history, and unlock your plan on any device." 
              : mode === "forgot" 
              ? "Enter your email and we will send you a secure link to reset your password."
              : mode === "update"
              ? "Create a strong new password for your account."
              : "Secure your reports, sync your history, and unlock your plan on any device."}
          </p>
        </header>

        {userEmail && mode !== "update" ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
            <p className="text-emerald-300 font-semibold">Signed in as</p>
            <p className="mt-2 text-white font-bold break-all">{userEmail}</p>
            <p className="mt-4 text-sm text-slate-300">Plan: <span className="uppercase font-semibold text-cyan-300">{plan}</span></p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/validator" className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
                Launch the AI Suite
              </Link>
              <button onClick={signOut} className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10">
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl">
            
            {mode === "login" || mode === "signup" ? (
              <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-slate-900/60 p-1">
                <button type="button" onClick={() => {setMode("signup"); setError(""); setMessage("");}} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "signup" ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:text-white"}`}>Sign Up</button>
                <button type="button" onClick={() => {setMode("login"); setError(""); setMessage("");}} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:text-white"}`}>Log In</button>
              </div>
            ) : (
              <button onClick={() => {setMode("login"); setError(""); setMessage("");}} className="mb-6 text-sm text-cyan-400 hover:underline">← Back to Log In</button>
            )}

            {mode === "forgot" ? (
              <form onSubmit={handleForgot}>
                <label className="mb-2 block text-sm font-medium text-slate-200">Email address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
                <button type="submit" disabled={loading} className={btnClass}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            ) : mode === "update" ? (
              <form onSubmit={handleSubmit}>
                <label className="mb-2 block text-sm font-medium text-slate-200">New Password (6+ characters)</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                <button type="submit" disabled={loading} className={btnClass}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />

                <label className="mt-4 mb-2 block text-sm font-medium text-slate-200">Password (6+ characters)</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
                
                {mode === "login" && (
                  <button type="button" onClick={() => {setMode("forgot"); setError(""); setMessage("");}} className="mt-3 text-right w-full text-xs text-cyan-400 hover:underline">
                    Forgot your password?
                  </button>
                )}

                <button type="submit" disabled={loading} className={btnClass}>
                  {loading ? "Please wait..." : mode === "signup" ? "Create Free Account" : "Log In"}
                </button>
              </form>
            )}

            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
            {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
          </div>
        )}
      </div>
    </main>
  );
}