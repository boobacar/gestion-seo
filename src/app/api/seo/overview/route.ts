import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGoogleClients } from "@/lib/google";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
  const googleClients = await getGoogleClients(session.user.id);

  // fallback demo mode
  if (!googleClients) {
    return NextResponse.json({
      projects,
      demo: true,
      kpis: { clicks: 1240, impressions: 28400, ctr: 4.36, avgPosition: 12.8, sessions: 3190 },
    });
  }

  const firstProject = projects[0];
  if (!firstProject) return NextResponse.json({ projects, demo: false, kpis: null });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 28);
  const toDate = (d: Date) => d.toISOString().slice(0, 10);

  const [gsc, ga] = await Promise.all([
    googleClients.searchconsole.searchanalytics.query({
      siteUrl: firstProject.gscSiteUrl,
      requestBody: {
        startDate: toDate(startDate),
        endDate: toDate(endDate),
      },
    }),
    googleClients.analyticsdata.properties.runReport({
      property: `properties/${firstProject.ga4PropertyId}`,
      requestBody: {
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        metrics: [{ name: "sessions" }],
      },
    }),
  ]);

  const rows = gsc.data.rows || [];
  const clicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);
  const impressions = rows.reduce((s, r) => s + (r.impressions || 0), 0);
  const ctr = impressions ? (clicks / impressions) * 100 : 0;
  const avgPosition = rows.length
    ? rows.reduce((s, r) => s + (r.position || 0), 0) / rows.length
    : 0;
  const sessions = Number(ga.data.rows?.[0]?.metricValues?.[0]?.value || 0);

  return NextResponse.json({
    projects,
    demo: false,
    kpis: { clicks, impressions, ctr: Number(ctr.toFixed(2)), avgPosition: Number(avgPosition.toFixed(2)), sessions },
  });
}
