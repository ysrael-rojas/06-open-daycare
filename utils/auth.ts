import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export type UserRole = "staff" | "parent" | "admin";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  initials: string;
  role: UserRole | null;
  roleLabel: string;
  avatarColor: string;
  avatarTextColor: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  staff: "Guardería",
  parent: "Familia",
  admin: "Administración",
};

const FALLBACK_ROLE_LABEL = "Cuenta";

const AVATAR_PALETTE = [
  { bg: "#F2937A", text: "#FFFFFF" },
  { bg: "#A9D9E8", text: "#1F7A93" },
  { bg: "#CFEBD8", text: "#3E9B6C" },
  { bg: "#E7DCF6", text: "#7B5FC0" },
  { bg: "#F9D2DE", text: "#C56486" },
];

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";

  return `${first}${last}`.toUpperCase();
}

function getAvatarColors(id: string): { bg: string; text: string } {
  const index =
    [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    AVATAR_PALETTE.length;

  return AVATAR_PALETTE[index];
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  const { sub: id, email } = data.claims;

  const { data: profile } = await supabase
    .from("users")
    .select("id, full_name, role, avatar_url")
    .eq("id", id)
    .maybeSingle();

  const fallbackName = email ? email.split("@")[0] : "Usuario";
  const fullName = profile?.full_name?.trim() || fallbackName;
  const role = (profile?.role as UserRole | undefined) ?? null;
  const avatar = getAvatarColors(id);

  return {
    id,
    email: email ?? "",
    fullName,
    initials: getInitials(fullName),
    role,
    roleLabel: role ? ROLE_LABELS[role] : FALLBACK_ROLE_LABEL,
    avatarColor: avatar.bg,
    avatarTextColor: avatar.text,
  };
});
