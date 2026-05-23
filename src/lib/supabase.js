// src/lib/supabase.js
// Supabase client with graceful fallback when not configured

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env?.VITE_SUPABASE_URL || "";
const key = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

let supabase = null;
if (url && key) {
  try { supabase = createClient(url, key); } catch (e) { console.warn("Supabase init failed"); }
}

export { supabase };

export async function signUp(email, password, metadata = {}) {
  if (!supabase) return { user: { id: "local", email }, error: null };
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
  return { user: data?.user, error };
}

export async function signIn(email, password) {
  if (!supabase) {
    const isAdmin = email === "papoutsis89@gmail.com";
    return { user: { id: "local", email, isAdmin }, error: null };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data?.user, error };
}

export async function signInWithGoogle() {
  if (!supabase) return { error: { message: "Supabase not configured" } };
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  return { data, error };
}

export async function signOut() {
  if (!supabase) return {};
  return supabase.auth.signOut();
}

export async function resetPassword(email) {
  if (!supabase) return { error: { message: "Not configured" } };
  return supabase.auth.resetPasswordForEmail(email);
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session;
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}

export async function getProfile(userId) {
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function upsertProfile(userId, profileData) {
  if (!supabase) {
    try { localStorage.setItem("pw_profile", JSON.stringify(profileData)); } catch {}
    return { error: null };
  }
  const { error } = await supabase.from("profiles").upsert({ id: userId, ...profileData, updated_at: new Date().toISOString() });
  return { error };
}

export async function upsertNotificationPrefs(userId, prefs) {
  if (!supabase) {
    try { localStorage.setItem("pw_notifs", JSON.stringify(prefs)); } catch {}
    return { error: null };
  }
  const { error } = await supabase.from("notification_prefs").upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() });
  return { error };
}
