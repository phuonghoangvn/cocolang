import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const whereClause = category ? { category: category as any } : {};

  const tasks = await prisma.task.findMany({
    where: whereClause,
    orderBy: [{ level: "asc" }, { type: "asc" }],
  });

  return NextResponse.json({ tasks });
}
