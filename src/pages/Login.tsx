import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => schema.safeParse({ email, password }).success, [email, password]);

  const signIn = async () => {
    setError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Please enter a valid email and password (8+ characters).");
      return;
    }
    setBusy(true);
    const { error: e } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (e) {
      setError(e.message);
      return;
    }
    nav("/", { replace: true });
  };

  const google = async () => {
    setError(null);
    const { error: e } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (e) setError(e.message);
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="container flex min-h-screen max-w-lg items-center justify-center py-10">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Log in to continue your talent journey.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-col gap-3">
              <Button onClick={signIn} disabled={!canSubmit || busy}>
                Log in
              </Button>
              <Button variant="secondary" onClick={google} disabled={busy}>
                Continue with Google
              </Button>
              <Button variant="ghost" onClick={() => nav("/signup")} disabled={busy}>
                New here? Create an account
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
