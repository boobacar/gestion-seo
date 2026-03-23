import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
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
