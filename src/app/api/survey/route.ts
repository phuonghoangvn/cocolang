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
  const { avatar, nativeLanguage, learningGoal, currentLevel, dailyGoalMinutes, activeTrack } = body;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      avatar,
      nativeLanguage,
      learningGoal,
      currentLevel,
      dailyGoalMinutes: Number(dailyGoalMinutes),
      activeTrack: activeTrack as any,
      surveyCompleted: true,
    },
  });

  return NextResponse.json({ success: true });
}
