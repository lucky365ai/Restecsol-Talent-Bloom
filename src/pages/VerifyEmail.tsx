import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function VerifyEmail() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    // If the user arrives here via email redirect, they may already have a session.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav("/", { replace: true });
    });
  }, [nav]);

  const email = (loc.state as any)?.email as string | undefined;

  return (
    <main className="min-h-screen bg-background">
      <section className="container flex min-h-screen max-w-xl items-center justify-center py-10">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Check your inbox</CardTitle>
            <CardDescription>
              {email ? (
                <>We sent a verification email to <span className="font-medium">{email}</span>.</>
              ) : (
                <>We sent you a verification email. Open it and follow the link to finish signup.</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              After verifying, you can return here—if you’re already signed in, we’ll automatically continue.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => nav("/login")}>Go to login</Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                I already verified
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
