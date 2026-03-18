import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, avatar, dailyGoalMinutes, emailReminders } = body;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || undefined,
      avatar: avatar || undefined,
      dailyGoalMinutes: dailyGoalMinutes ? Number(dailyGoalMinutes) : undefined,
      emailReminders: typeof emailReminders === "boolean" ? emailReminders : undefined,
    },
  });

  return NextResponse.json({ success: true });
}
