import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding bots...");

  const botNames = [
    "Alex",
    "Jordan",
    "Taylor",
    "Casey",
    "Morgan",
    "Jamie",
    "Riley",
    "Cameron",
    "Avery",
  ];

  const dummyPassword = await bcrypt.hash("password123", 10);

  for (let i = 0; i < botNames.length; i++) {
    const name = botNames[i];
    await prisma.user.upsert({
      where: { email: `bot${i + 1}@cocolang.ai` },
      update: {},
      create: {
        email: `bot${i + 1}@cocolang.ai`,
        name,
        password: dummyPassword,
        isBot: true,
        totalXp: Math.floor(Math.random() * 2000) + 500, // Random starting XP
        currentStreak: Math.floor(Math.random() * 10),
      },
    });
  }

  console.log("Seeding default tasks...");

  const tasksData = [
    {
      title: "Introduce Yourself",
      content: "Learn how to introduce yourself in Swedish.",
      category: "SWEDISH",
      level: "A1",
      day: 1,
      type: "QUIZ",
      xpReward: 100,
    },
    {
      title: "Common Greetings",
      content: "Basic greetings and responses.",
      category: "SWEDISH",
      level: "A1",
      day: 2,
      type: "LISTEN",
      xpReward: 120,
    },
    {
      title: "Design Systems Basics",
      content: "What is a design system? Introduction to tokens.",
      category: "UX_ENGLISH",
      level: "B1",
      day: 1,
      type: "READ",
      xpReward: 100,
    },
    {
      title: "Explaining UI Decisions",
      content: "How to argue for a specific UI choice in an interview.",
      category: "UX_ENGLISH",
      level: "B2",
      day: 2,
      type: "SPEAK",
      xpReward: 150,
    },
  ];

  for (const t of tasksData) {
    // Check if task exists to prevent duplicates on multiple runs
    const existing = await prisma.task.findFirst({
      where: { title: t.title, day: t.day },
    });
    
    if (!existing) {
      await prisma.task.create({
        data: t as any, // Cast for TS
      });
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
