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

// ============================================================
// DOCUMENT VAULT
// ============================================================

export async function saveDocument(userId, doc) {
  if (!supabase) {
    // Local fallback
    try {
      const docs = JSON.parse(localStorage.getItem("pw_docs") || "[]");
      const newDoc = { ...doc, id: `local-${Date.now()}`, user_id: userId, created_at: new Date().toISOString() };
      docs.push(newDoc);
      localStorage.setItem("pw_docs", JSON.stringify(docs));
      return { data: newDoc, error: null };
    } catch (e) { return { data: null, error: e }; }
  }
  const { data, error } = await supabase.from("saved_documents").insert({
    user_id: userId,
    ...doc,
    created_at: new Date().toISOString(),
  }).select().single();
  return { data, error };
}

export async function getDocuments(userId) {
  if (!supabase) {
    try {
      const docs = JSON.parse(localStorage.getItem("pw_docs") || "[]");
      return { data: docs.filter(d => d.user_id === userId || d.user_id === "local"), error: null };
    } catch { return { data: [], error: null }; }
  }
  const { data, error } = await supabase.from("saved_documents")
    .select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function updateDocument(docId, updates) {
  if (!supabase) {
    try {
      const docs = JSON.parse(localStorage.getItem("pw_docs") || "[]");
      const idx = docs.findIndex(d => d.id === docId);
      if (idx >= 0) { docs[idx] = { ...docs[idx], ...updates }; localStorage.setItem("pw_docs", JSON.stringify(docs)); }
      return { error: null };
    } catch (e) { return { error: e }; }
  }
  const { error } = await supabase.from("saved_documents").update(updates).eq("id", docId);
  return { error };
}

export async function deleteDocument(docId) {
  if (!supabase) {
    try {
      const docs = JSON.parse(localStorage.getItem("pw_docs") || "[]");
      localStorage.setItem("pw_docs", JSON.stringify(docs.filter(d => d.id !== docId)));
      return { error: null };
    } catch (e) { return { error: e }; }
  }
  const { error } = await supabase.from("saved_documents").delete().eq("id", docId);
  return { error };
}

// ============================================================
// USER CONTEXT (.md summary)
// ============================================================

export async function getUserContext(userId) {
  if (!supabase) {
    try { return { data: JSON.parse(localStorage.getItem("pw_context") || "null"), error: null }; }
    catch { return { data: null, error: null }; }
  }
  const { data, error } = await supabase.from("user_context").select("*").eq("user_id", userId).single();
  return { data, error };
}

export async function saveUserContext(userId, contextMd, docCount, totalFindings) {
  if (!supabase) {
    try {
      localStorage.setItem("pw_context", JSON.stringify({
        user_id: userId, context_md: contextMd, doc_count: docCount,
        total_findings: totalFindings, last_rebuilt: new Date().toISOString()
      }));
      return { error: null };
    } catch (e) { return { error: e }; }
  }
  const { error } = await supabase.from("user_context").upsert({
    user_id: userId, context_md: contextMd, doc_count: docCount,
    total_findings: totalFindings, last_rebuilt: new Date().toISOString(), updated_at: new Date().toISOString()
  });
  return { error };
}
