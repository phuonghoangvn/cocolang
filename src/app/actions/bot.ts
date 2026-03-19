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
      // Simulate Bot XP earning (between 25 and 65)
      // Increment gradually each day for better realistic competition.
      const randomXp = Math.floor(Math.random() * 41) + 25; 
      
      const getMondayStart = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday.getTime();
      };

      let newWeeklyXp = bot.weeklyXp || 0;
      if (bot.lastCompletedDate) {
        const lastMonday = getMondayStart(bot.lastCompletedDate);
        const thisMonday = getMondayStart(new Date());
        if (lastMonday < thisMonday) {
          newWeeklyXp = 0;
        }
      } else {
        newWeeklyXp = 0;
      }
      newWeeklyXp += randomXp;
      
      await prisma.user.update({
        where: { id: bot.id },
        data: {
          totalXp: bot.totalXp + randomXp,
          weeklyXp: newWeeklyXp,
          currentStreak: bot.currentStreak + 1,
          lastCompletedDate: new Date(),
        },
      });
    }
  }
}
