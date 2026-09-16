"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export interface SignInState {
  error: string;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email o contraseña incorrectos.",
  email_not_confirmed: "Todavía no confirmaste tu email.",
  user_banned: "Esta cuenta está bloqueada.",
  over_request_rate_limit: "Demasiados intentos. Esperá un momento e intentá de nuevo.",
  over_email_send_rate_limit: "Demasiados intentos. Esperá un momento e intentá de nuevo.",
};

const DEFAULT_ERROR = "No pudimos iniciar sesión. Intentá de nuevo.";

export async function signIn(
  _state: SignInState | undefined,
  formData: FormData,
): Promise<SignInState | undefined> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresá tu email y tu contraseña." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: AUTH_ERROR_MESSAGES[error.code ?? ""] ?? DEFAULT_ERROR };
    }
  } catch {
    return { error: DEFAULT_ERROR };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
