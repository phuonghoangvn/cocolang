"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export type Category = "UX_ENGLISH" | "SWEDISH";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1";
export type TaskType = "LISTEN" | "SPEAK" | "READ" | "WRITE" | "QUIZ";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateTaskAI(category: Category, level: Level, type: TaskType) {
  if (!GEMINI_API_KEY) {
    return { error: "Gemini API Key is not configured." };
  }

  // Find the highest day for this category and level to sequence the next task
  const lastTask = await prisma.task.findFirst({
    where: { category, level },
    orderBy: { day: 'desc' },
  });
  const nextDay = lastTask ? lastTask.day + 1 : 1;

  // Build the prompt based on user request parameters
  let promptText = `Generate a single educational task for a language learning platform.
Track: ${category === "SWEDISH" ? "Swedish language learning (A1 to C1 progression)" : "English learning for Vietnamese speakers (B1 to C1)"}.
Difficulty Level: ${level} (CEFR standard).
Task Type: ${type}.

Format requirements:
- READ: Provide a short, interesting source text (approx 50-100 words) for the user to read and translate/take notes on.
- LISTEN: Provide a transcript or dialogue (approx 50-80 words). The application fakes audio playback, so the content should represent what they "heard". At the end, ask a question based on the text.
- SPEAK: Provide a clear, open-ended question or prompt (1-2 sentences) that the user must answer by recording their voice for 60 seconds.
- WRITE: Provide a scenario or topic requiring the user to write a short essay or paragraph in the target language.
- QUIZ: Provide a highly engaging multiple choice question. Format the content field as: "Question text? | Option 1 | Option 2 | Option 3 | Option 4 | CorrectIndex" where CorrectIndex is 0-3.

Respond ONLY with a valid JSON object matching this exact structure, with no markdown code blocks around it:
{
  "title": "A short, engaging title (Max 5 words)",
  "content": "The actual task material based on the format requirements.",
  "xpReward": 100
}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }],
        generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("Gemini API Error:", data);
        return { error: "Failed to fetch from Gemini API" };
    }

    const jsonText = data.candidates[0].content.parts[0].text;
    const taskDetails = JSON.parse(jsonText);

    if (!taskDetails.title || !taskDetails.content) {
        return { error: "AI generated invalid structured data." };
    }

    // Save to DB
    const newTask = await prisma.task.create({
      data: {
        category,
        level,
        type,
        day: nextDay,
        title: taskDetails.title,
        content: taskDetails.content,
        xpReward: taskDetails.xpReward || 100,
      },
    });

    return { success: true, task: newTask };
    
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { error: "An unexpected error occurred while calling the AI." };
  }
}

// Full curriculum generation: generates all 4 task types per day for a given track
export async function generateFullCurriculum() {
  // English track: B1 -> B2 -> C1 (1 month = ~30 days)
  // Swedish track: A1 -> A2 -> B1 -> B2 -> C1 (full)
  
  const englishLevels: Level[] = ["B1", "B2", "C1"];
  const swedishLevels: Level[] = ["A1", "A2", "B1", "B2", "C1"];
  const taskTypes: TaskType[] = ["SPEAK", "LISTEN", "READ", "WRITE"];

  const tracks: { category: Category; levels: Level[] }[] = [
    { category: "UX_ENGLISH", levels: englishLevels },
    { category: "SWEDISH", levels: swedishLevels },
  ];

  const results = [];

  for (const track of tracks) {
    for (const level of track.levels) {
      // Check how many tasks already exist for this category+level
      const existingCount = await prisma.task.count({
        where: { category: track.category, level },
      });

      // Generate at least 4 tasks (one per type) if fewer than 4 exist
      if (existingCount < 4) {
        for (const type of taskTypes) {
          const existing = await prisma.task.findFirst({
            where: { category: track.category, level, type },
          });
          if (!existing) {
            const res = await generateTaskAI(track.category, level, type);
            results.push({ category: track.category, level, type, success: res.success, error: res.error });
          }
        }
      }
    }
  }

  revalidatePath("/dashboard");
  return { success: true, generated: results.length };
}

export async function autoGenerateNextRoadmapTask() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Get the most recent task overall or by highest day
  const lastTask = await prisma.task.findFirst({
    orderBy: { day: 'desc' },
  });

  const CYCLE: TaskType[] = ["READ", "LISTEN", "SPEAK", "WRITE", "QUIZ"];

  let category: Category = "SWEDISH";
  let level: Level = "A1";
  let nextType: TaskType = "READ";

  if (lastTask) {
    category = lastTask.category as Category;
    level = lastTask.level as Level;
    
    // Find next task type in the cycle
    const currentIndex = CYCLE.indexOf(lastTask.type as TaskType);
    nextType = CYCLE[(currentIndex + 1) % CYCLE.length];
  }

  const res = await generateTaskAI(category, level, nextType);
  if (res.success) {
    revalidatePath("/dashboard");
    return { success: true };
  } else {
    return { error: res.error };
  }
}

// Auto-ensure curriculum exists at dashboard load (silent background generation)
export async function ensureCurriculumExists() {
  const englishLevels: Level[] = ["B1", "B2", "C1"];
  const swedishLevels: Level[] = ["A1", "A2", "B1", "B2", "C1"];
  const taskTypes: TaskType[] = ["SPEAK", "LISTEN", "READ", "WRITE"];

  const tracks: { category: Category; levels: Level[] }[] = [
    { category: "UX_ENGLISH", levels: englishLevels },
    { category: "SWEDISH", levels: swedishLevels },
  ];

  let generated = 0;

  for (const track of tracks) {
    for (const level of track.levels) {
      for (const type of taskTypes) {
        const existing = await prisma.task.findFirst({
          where: { category: track.category, level, type },
        });
        if (!existing) {
          await generateTaskAI(track.category, level, type);
          generated++;
        }
      }
    }
  }

  if (generated > 0) {
    revalidatePath("/dashboard");
  }
  return { generated };
}
