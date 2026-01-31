import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { applyTalentTheme } from "@/lib/themeEngine";
import type { ThemeKey } from "@/lib/cursorEmojiMap";

type Profile = Tables<"profiles">;

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert({ user_id: userId, theme_key: "unknown", theme_mode: "system" })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return inserted;
}

function setEmojiCursor(emoji: string) {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (isMobile) {
    document.body.style.cursor = "";
    return;
  }
  if (!emoji) {
    document.body.style.cursor = "";
    return;
  }

  // Simple, stable SVG cursor
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><text x='0' y='24' font-size='24'>${emoji}</text></svg>`;
  const uri = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 0 24, auto`;
  document.body.style.cursor = uri;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const uid = session?.user?.id;
    if (!uid) return;
    const p = await ensureProfile(uid);
    setProfile(p);
    applyTalentTheme((p.theme_key as ThemeKey) ?? "unknown");
    setEmojiCursor(p.cursor_emoji ?? "");
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) setProfile(null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    refreshProfile().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      refreshProfile,
      signOut: async () => {
        await supabase.auth.signOut();
        setEmojiCursor("");
      },
    }),
    [loading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
