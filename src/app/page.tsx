"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type KPI = { clicks: number; impressions: number; ctr: number; avgPosition: number; sessions: number };

type Project = {
  id: string;
  name: string;
  repoUrl: string;
  domain: string;
  gscSiteUrl: string;
  ga4PropertyId: string;
};

type Task = { id: string; title: string; status: string; priority: string; projectId: string };

export default function Home() {
  const { data: session, status } = useSession();
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

  const load = async () => {
    const [o, p, t] = await Promise.all([
      fetch("/api/seo/overview").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
    ]);
    setKpis(o.kpis);
    setProjects(p);
    setTasks(t);
  };

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status]);

  const createProject = async () => {
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });
    await load();
  };

  if (status === "loading") return <main className="p-6">Chargement...</main>;

  if (!session) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Gestion SEO</h1>
        <p>Connecte-toi avec Google pour charger les données Search Console et GA4.</p>
        <button className="bg-black text-white rounded px-4 py-2" onClick={() => signIn("google")}>
          Se connecter avec Google
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Gestion SEO — Dashboard</h1>
        <button className="border rounded px-3 py-2" onClick={() => signOut()}>
          Déconnexion
        </button>
      </div>

      <section className="grid md:grid-cols-5 gap-3">
        {[
          ["Clicks", kpis?.clicks],
          ["Impressions", kpis?.impressions],
          ["CTR %", kpis?.ctr],
          ["Avg Position", kpis?.avgPosition],
          ["Sessions", kpis?.sessions],
        ].map(([label, value]) => (
          <div className="border rounded-xl p-4" key={label}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-semibold">{value ?? "-"}</p>
          </div>
        ))}
      </section>

      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="text-xl font-semibold">Ajouter un projet</h2>
        <div className="grid md:grid-cols-2 gap-2">
          {Object.entries(newProject).map(([k, v]) => (
            <input
              key={k}
              className="border rounded px-3 py-2"
              placeholder={k}
              value={v}
              onChange={(e) => setNewProject((s) => ({ ...s, [k]: e.target.value }))}
            />
          ))}
        </div>
        <button className="bg-black text-white rounded px-4 py-2" onClick={createProject}>
          Ajouter
        </button>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-3">Projets</h2>
          <ul className="space-y-2">
            {projects.map((p) => (
              <li key={p.id} className="border rounded p-2">
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm break-all">{p.repoUrl}</p>
                <p className="text-xs text-gray-500">GSC: {p.gscSiteUrl} | GA4: {p.ga4PropertyId}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="border rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-3">Tasks</h2>
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="border rounded p-2 flex justify-between">
                <span>{t.title}</span>
                <span className="text-sm">{t.priority} · {t.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
