import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  redirect: z.string().optional(),
  denied: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const { redirect, denied } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(denied ? "This account is not an admin." : null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    navigate({ to: (redirect ?? "/admin") as "/admin", search: {} as never });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blush/30 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-background p-8 shadow-xl">
        <h1 className="font-display text-3xl">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Heaven Beauty administration.</p>

        <label className="mt-6 block text-[11px] font-medium uppercase tracking-widest text-foreground/70">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1.5 w-full rounded-sm border border-border bg-white/70 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
        />

        <label className="mt-4 block text-[11px] font-medium uppercase tracking-widest text-foreground/70">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1.5 w-full rounded-sm border border-border bg-white/70 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
        />

        {err && <p className="mt-4 text-sm text-destructive">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
