"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { revalidatePath } from "next/cache";

export async function completeTask(taskId: string, userContent?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  // Check if already completed
  const existingProgress = await prisma.userProgress.findUnique({
    where: {
      userId_taskId: {
        userId: session.user.id,
        taskId: taskId,
      },
    },
  });

  if (existingProgress?.isCompleted) {
    return { error: "Task already completed" };
  }

  // Create or update progress
  await prisma.userProgress.upsert({
    where: {
      userId_taskId: {
        userId: session.user.id,
        taskId: taskId,
      },
    },
    create: {
      userId: session.user.id,
      taskId: taskId,
      isCompleted: true,
      userContent: userContent || null,
      completedAt: new Date(),
    },
    update: {
      isCompleted: true,
      userContent: userContent || null,
      completedAt: new Date(),
    },
  });

  // Calculate streak logic & Update XP
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  let newStreak = 0;

  if (user) {
    let currentStreak = user.currentStreak;
    let newWeeklyXp = user.weeklyXp || 0;
    const now = new Date();

    // Use UTC date string (YYYY-MM-DD) for consistent day comparison regardless of server timezone
    const toUtcDateStr = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

    // Get start of UTC Monday (for weekly XP reset)
    const getMondayUtcTime = (d: Date) => {
      const day = d.getUTCDay(); // 0 = Sunday
      const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff);
    };

    if (user.lastCompletedDate) {
      const lastDate = new Date(user.lastCompletedDate);
      const todayUtc = toUtcDateStr(now);
      const lastUtc = toUtcDateStr(lastDate);

      // Calculate yesterday's UTC date string
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayUtc = toUtcDateStr(yesterday);

      if (lastUtc === yesterdayUtc) {
        // Completed yesterday → extend streak
        currentStreak += 1;
      } else if (lastUtc === todayUtc) {
        // Already completed today → keep streak as-is (no double increment)
      } else {
        // Gap of more than 1 day → streak broken
        currentStreak = 1;
      }

      // Weekly XP reset: compare UTC Mondays
      const lastMonday = getMondayUtcTime(lastDate);
      const thisMonday = getMondayUtcTime(now);
      if (lastMonday < thisMonday) {
        newWeeklyXp = 0;
      }
    } else {
      // First task ever completed
      currentStreak = 1;
      newWeeklyXp = 0;
    }

    newStreak = currentStreak;
    newWeeklyXp += task.xpReward;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalXp: user.totalXp + task.xpReward,
        weeklyXp: newWeeklyXp,
        currentStreak: newStreak,
        lastCompletedDate: now,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/stats");
  revalidatePath("/dashboard/leaderboard");
  revalidatePath("/", "layout"); // Refresh layout so streak in navbar updates

  return { success: true, newStreak, xpEarned: task.xpReward };
}
