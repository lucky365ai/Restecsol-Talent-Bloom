import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export function getPostAuthRoute(profile: Profile | null | undefined) {
  if (!profile?.talent) return "/talent";
  if (!profile?.sub_talent) return "/subtalent";
  if (!profile?.level) return "/level";
  return "/dashboard";
}
