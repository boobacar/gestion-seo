import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/projects failed", error);
    return NextResponse.json({ error: "projects_failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item = await prisma.project.create({
      data: {
        name: body.name,
        repoUrl: body.repoUrl,
        domain: body.domain,
        gscSiteUrl: body.gscSiteUrl,
        ga4PropertyId: body.ga4PropertyId,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects failed", error);
    return NextResponse.json({ error: "projects_create_failed" }, { status: 500 });
  }
}
