// src/lib/supabase.js
// ============================================================
// SUPABASE CLIENT + AUTH + DATA PERSISTENCE
// ============================================================
// SETUP: Create Supabase project, run sql/schema.sql, set env vars:
//   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
//   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (server-side only)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// AUTH HELPERS
// ============================================================

export async function signUp(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // { firstName, lastName, specialty, state }
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset`,
  });
  if (error) throw error;
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// ============================================================
// PROFILE CRUD (profiles table)
// ============================================================

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data;
}

export async function upsertProfile(userId, profileData) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...profileData, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// LINKED ACCOUNTS (plaid_accounts table)
// ============================================================

export async function getLinkedAccounts(userId) {
  const { data, error } = await supabase
    .from("plaid_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveLinkedAccount(userId, account) {
  const { data, error } = await supabase
    .from("plaid_accounts")
    .insert({ user_id: userId, ...account })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeLinkedAccount(accountId) {
  const { error } = await supabase
    .from("plaid_accounts")
    .delete()
    .eq("id", accountId);
  if (error) throw error;
}

// ============================================================
// SUBSCRIPTION STATUS
// ============================================================

export async function getSubscription(userId) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertSubscription(userId, subData) {
  const { data, error } = await supabase
    .from("subscriptions")
    .upsert({ user_id: userId, ...subData, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// NOTIFICATION PREFERENCES
// ============================================================

export async function getNotificationPrefs(userId) {
  const { data, error } = await supabase
    .from("notification_prefs")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertNotificationPrefs(userId, prefs) {
  const { data, error } = await supabase
    .from("notification_prefs")
    .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}
