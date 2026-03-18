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
  const { avatar, nativeLanguage, learningGoal, currentLevel, dailyGoalMinutes, goalDeadlineDays, activeTrack } = body;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      avatar,
      nativeLanguage,
      learningGoal,
      currentLevel,
      dailyGoalMinutes: Number(dailyGoalMinutes),
      goalDeadlineDays: Number(goalDeadlineDays) || 30,
      activeTrack: (activeTrack as any) || "UX_ENGLISH",
      surveyCompleted: true,
    },
  });

  // Also create the default English course enrollment
  await prisma.courseEnrollment.upsert({
    where: { userId_category: { userId: session.user.id, category: "UX_ENGLISH" } },
    update: {
      learningGoal,
      currentLevel,
      goalDeadlineDays: Number(goalDeadlineDays) || 30,
    },
    create: {
      userId: session.user.id,
      category: "UX_ENGLISH",
      learningGoal,
      currentLevel,
      targetLevel: "C1",
      goalDeadlineDays: Number(goalDeadlineDays) || 30,
    },
  });

  return NextResponse.json({ success: true });
}
