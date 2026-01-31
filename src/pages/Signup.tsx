import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(72),
    confirm: z.string().min(8).max(72),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

export default function Signup() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => schema.safeParse({ email, password, confirm }).success, [email, password, confirm]);

  const submit = async () => {
    setError(null);
    const parsed = schema.safeParse({ email, password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    setBusy(true);
    const { error: e } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });
    setBusy(false);
    if (e) {
      setError(e.message);
      return;
    }
    nav("/verify-email", { replace: true, state: { email: parsed.data.email } });
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="container flex min-h-screen max-w-lg items-center justify-center py-10">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>We’ll email you a verification link.</CardDescription>
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
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-col gap-3">
              <Button onClick={submit} disabled={!canSubmit || busy}>
                Sign up
              </Button>
              <Button variant="ghost" onClick={() => nav("/login")} disabled={busy}>
                Already have an account? Log in
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
