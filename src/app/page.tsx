"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

type KPI = { clicks: number; impressions: number; ctr: number; avgPosition: number; sessions: number };
type Project = { id: string; name: string; repoUrl: string; domain: string; gscSiteUrl: string; ga4PropertyId: string };
type Task = { id: string; title: string; status: string; priority: string; projectId: string };

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [newProject, setNewProject] = useState({
    name: "dabia-clinic",
    repoUrl: "https://github.com/boobacar/dabia-clinic",
    domain: "cliniquedentairedabia.com",
    gscSiteUrl: "https://www.cliniquedentairedabia.com/",
    ga4PropertyId: "486431832",
  });

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const authHeaders = () => ({
    Authorization: `Bearer ${session?.access_token || ""}`,
    "x-google-access-token": session?.provider_token || "",
    "Content-Type": "application/json",
  });

  const load = async () => {
    if (!session) return;
    const [o, p, t] = await Promise.all([
      fetch("/api/seo/overview", { headers: authHeaders() }).then((r) => r.json()),
      fetch("/api/projects", { headers: authHeaders() }).then((r) => r.json()),
      fetch("/api/tasks", { headers: authHeaders() }).then((r) => r.json()),
    ]);
    setKpis(o.kpis || null);
    setProjects(Array.isArray(p) ? p : []);
    setTasks(Array.isArray(t) ? t : []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  const createProject = async () => {
    if (!session) return;
    await fetch("/api/projects", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(newProject),
    });
    await load();
  };

  const signInEmail = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signInWithPassword({ email, password });
  };

  const signInGoogle = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes:
          "openid email profile https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly",
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}` : undefined,
      },
    });
  };

  const supabaseReady = !!getSupabaseClient();

  if (!supabaseReady) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Gestion SEO</h1>
        <p className="text-sm text-red-600">Config manquante: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Gestion SEO</h1>
        <p className="text-sm text-gray-600">Connexion Supabase (email/password) ou Google (recommandé pour GSC/GA4).</p>
        <div className="space-y-2">
          <input className="border rounded px-3 py-2 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="border rounded px-3 py-2 w-full" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="bg-black text-white rounded px-4 py-2" onClick={signInEmail}>Se connecter (email)</button>
        </div>
        <button className="border rounded px-4 py-2" onClick={signInGoogle}>Se connecter avec Google (pour data GSC/GA4)</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Gestion SEO — Dashboard</h1>
        <button className="border rounded px-3 py-2" onClick={async () => { const supabase = getSupabaseClient(); if (supabase) await supabase.auth.signOut(); }}>
          Déconnexion
        </button>
      </div>

      <section className="grid md:grid-cols-5 gap-3">
        {[["Clicks", kpis?.clicks],["Impressions", kpis?.impressions],["CTR %", kpis?.ctr],["Avg Position", kpis?.avgPosition],["Sessions", kpis?.sessions]].map(([label, value]) => (
          <div className="border rounded-xl p-4" key={label as string}>
            <p className="text-xs text-gray-500">{label as string}</p>
            <p className="text-2xl font-semibold">{value as number | undefined ?? "-"}</p>
          </div>
        ))}
      </section>

      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="text-xl font-semibold">Ajouter un projet</h2>
        <div className="grid md:grid-cols-2 gap-2">
          {Object.entries(newProject).map(([k, v]) => (
            <input key={k} className="border rounded px-3 py-2" placeholder={k} value={v} onChange={(e) => setNewProject((s) => ({ ...s, [k]: e.target.value }))} />
          ))}
        </div>
        <button className="bg-black text-white rounded px-4 py-2" onClick={createProject}>Ajouter</button>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-3">Projets</h2>
          <ul className="space-y-2">{projects.map((p) => <li key={p.id} className="border rounded p-2"><p className="font-semibold">{p.name}</p><p className="text-sm break-all">{p.repoUrl}</p><p className="text-xs text-gray-500">GSC: {p.gscSiteUrl} | GA4: {p.ga4PropertyId}</p></li>)}</ul>
        </div>
        <div className="border rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-3">Tasks</h2>
          <ul className="space-y-2">{tasks.map((t) => <li key={t.id} className="border rounded p-2 flex justify-between"><span>{t.title}</span><span className="text-sm">{t.priority} · {t.status}</span></li>)}</ul>
        </div>
      </section>
    </main>
  );
}
