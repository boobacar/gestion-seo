import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export async function GET(req: Request) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
}
