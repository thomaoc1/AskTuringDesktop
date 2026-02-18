import { supabaseClient } from "./supabase";

export async function initiateGoogleOAuth() {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "askturing://auth/callback",
      skipBrowserRedirect: true, 
    },
  });

  if (error) throw new Error(error.message);
  return data.url; 
}

export async function initiateCredentialLogin(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw new Error(error.message);
}
