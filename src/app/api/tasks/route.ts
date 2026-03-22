import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = await prisma.task.create({
    data: {
      title: body.title,
      status: body.status || "TODO",
      priority: body.priority || "P2",
      projectId: body.projectId,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
