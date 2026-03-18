"use server";

import { prisma } from "@/lib/prisma";

export async function simulateBotActivity() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Find all bots
  const bots = await prisma.user.findMany({
    where: { isBot: true },
  });

  if (bots.length === 0) {
    // Optionally create some bots if none exist
    console.log("No bots found. Consider seeding bots for the leaderboard.");
    return;
  }

  // Check each bot if they need updates
  for (const bot of bots) {
    let shouldUpdateBot = false;

    if (!bot.lastCompletedDate) {
      shouldUpdateBot = true;
    } else {
      const botLastActiveDate = new Date(bot.lastCompletedDate);
      botLastActiveDate.setHours(0, 0, 0, 0);
      
      if (botLastActiveDate < todayStart) {
        shouldUpdateBot = true;
      }
    }

    if (shouldUpdateBot) {
      // Simulate Bot XP earning (between 50 and 150)
      const randomXp = Math.floor(Math.random() * 101) + 50; 
      
      await prisma.user.update({
        where: { id: bot.id },
        data: {
          totalXp: bot.totalXp + randomXp,
          currentStreak: bot.currentStreak + 1,
          lastCompletedDate: new Date(),
        },
      });
    }
  }
}
