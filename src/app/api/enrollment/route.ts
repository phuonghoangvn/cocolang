import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { generateRoadmapForEnrollment } from "@/app/actions/ai";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { category, learningGoal, currentLevel, targetLevel, goalDeadlineDays } = body;

  if (!category) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }

  // Create or update enrollment
  const enrollment = await prisma.courseEnrollment.upsert({
    where: { userId_category: { userId: session.user.id, category } },
    update: {
      learningGoal,
      currentLevel,
      targetLevel: targetLevel || "C1",
      goalDeadlineDays: Number(goalDeadlineDays) || 30,
    },
    create: {
      userId: session.user.id,
      category,
      learningGoal,
      currentLevel,
      targetLevel: targetLevel || "C1",
      goalDeadlineDays: Number(goalDeadlineDays) || 30,
    },
  });

  // Trigger async roadmap generation based on enrollment context
  generateRoadmapForEnrollment({
    userId: session.user.id,
    category,
    learningGoal,
    currentLevel,
    targetLevel: targetLevel || "C1",
    goalDeadlineDays: Number(goalDeadlineDays) || 30,
  }).catch(console.error);

  return NextResponse.json({ success: true, enrollment });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ enrollments });
}
