import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { redirect: "/admin" } });
    const { data: roles } = await supabase
      .from("user_roles" as never)
      .select("role")
      .eq("user_id", data.user.id);
    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    if (!isAdmin) throw redirect({ to: "/auth", search: { redirect: "/admin", denied: "1" } });
    return { user: data.user };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    await router.invalidate();
    navigate({ to: "/auth", search: {} });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="font-display text-xl">Heaven Admin</Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link
                to="/admin"
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-primary font-medium" }}
                className="text-foreground/70 hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/pricing"
                activeProps={{ className: "text-primary font-medium" }}
                className="text-foreground/70 hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                to="/admin/orders"
                activeProps={{ className: "text-primary font-medium" }}
                className="text-foreground/70 hover:text-foreground"
              >
                Orders
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{email}</span>
            <button onClick={signOut} className="flex items-center gap-1 hover:text-destructive">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
