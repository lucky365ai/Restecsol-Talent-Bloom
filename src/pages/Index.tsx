import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { getPostAuthRoute } from "@/lib/flow";

const Index = () => {
  const nav = useNavigate();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      nav("/login", { replace: true });
      return;
    }
    nav(getPostAuthRoute(profile), { replace: true });
  }, [loading, nav, profile, session]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Loading…</h1>
        <p className="text-sm text-muted-foreground">Preparing your dashboard</p>
      </div>
    </div>
  );
};

export default Index;
