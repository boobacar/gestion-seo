import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/tasks failed", error);
    return NextResponse.json({ error: "tasks_failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
  } catch (error) {
    console.error("POST /api/tasks failed", error);
    return NextResponse.json({ error: "tasks_create_failed" }, { status: 500 });
  }
}
