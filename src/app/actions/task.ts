"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
  
  if (user) {
    let newStreak = user.currentStreak;
    const now = new Date();
    
    if (user.lastCompletedDate) {
      const yesterdayStart = new Date(now);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);

      const yesterdayEnd = new Date(now);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const lastDate = new Date(user.lastCompletedDate);

      // If they had a task completed yesterday, streak goes up
      if (lastDate >= yesterdayStart && lastDate <= yesterdayEnd) {
        newStreak += 1; 
      } else if (lastDate < yesterdayStart) {
        // More than a day gap, streak broken
        newStreak = 1; 
      }
      // If completed another task today earlier, streak stays the same (assuming 1 increment per day max)
    } else {
      // First task completed
      newStreak = 1; 
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalXp: user.totalXp + task.xpReward,
        currentStreak: newStreak,
        lastCompletedDate: now,
      },
    });
  }

  return { success: true };
}
