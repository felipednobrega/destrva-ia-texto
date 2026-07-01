import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { FileText, StickyNote, LayoutDashboard, LogOut, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthLayout,
});

function AuthLayout() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        qc.clear();
        router.navigate({ to: "/auth" });
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router, qc]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  }


  return (
    <div className="min-h-screen bg-[#FDFDFF] flex">
      <aside className="hidden md:flex w-64 flex-col bg-neutral-950 text-white p-6 gap-2">
        <Link to="/" className="flex items-center gap-2 mb-6 font-black text-lg">
          <Sparkles className="w-5 h-5 text-indigo-300" />
          Redação 900+
        </Link>
        <NavItem to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
        <NavItem to="/redacoes" icon={<FileText className="w-4 h-4" />} label="Redações" />
        <NavItem to="/notas" icon={<StickyNote className="w-4 h-4" />} label="Notas" />
        <div className="flex-1" />
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
      activeProps={{ className: "bg-white/10 text-white" }}
    >
      {icon}
      {label}
    </Link>
  );
}
