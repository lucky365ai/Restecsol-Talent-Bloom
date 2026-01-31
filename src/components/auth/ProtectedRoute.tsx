import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { getPostAuthRoute } from "@/lib/flow";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      nav("/login", { replace: true, state: { from: loc.pathname } });
      return;
    }
    const expected = getPostAuthRoute(profile);
    const isFlowPage = ["/talent", "/questionnaire", "/subtalent", "/level"].includes(loc.pathname);
    if (isFlowPage && loc.pathname !== expected) {
      nav(expected, { replace: true });
    }
  }, [loading, session, nav, loc.pathname, profile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!session) return null;
  return <>{children}</>;
}
