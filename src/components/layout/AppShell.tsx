import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const doLogout = async () => {
    await signOut();
    nav("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm font-semibold tracking-tight">
              TMS
            </Link>
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant={loc.pathname === "/dashboard" ? "default" : "ghost"} size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant={loc.pathname === "/settings" ? "default" : "ghost"} size="sm">
              <Link to="/settings">Settings</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={doLogout}>
              Log out
            </Button>
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
