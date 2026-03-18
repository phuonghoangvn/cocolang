"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export type Category = "UX_ENGLISH" | "SWEDISH";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1";
export type TaskType = "LISTEN" | "SPEAK" | "READ" | "WRITE" | "QUIZ";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Maps deadline (days) to number of tasks to generate per level
function calcTasksPerLevel(deadlineDays: number, levelsCount: number): number {
  const totalTasks = Math.max(10, Math.ceil(deadlineDays * 1.5));
  return Math.max(5, Math.floor(totalTasks / levelsCount));
}

// ─── PROMPT BUILDER (Role · Context · Constraint · Task · Output) ─────────────
function buildTaskPrompt(params: {
  category: Category;
  level: Level;
  type: TaskType;
  learningGoal?: string | null;
  nativeLanguage?: string | null;
  deadlineDays?: number;
  dayIndex: number;
  totalDays: number;
}): string {
  const { category, level, type, learningGoal, nativeLanguage, deadlineDays, dayIndex, totalDays } = params;

  const isSwedish = category === "SWEDISH";
  const targetLang = isSwedish ? "Swedish" : "English";
  const nativeLang = nativeLanguage || "Vietnamese";

  const goalMap: Record<string, string> = {
    work: "securing a job or thriving in a professional work environment abroad",
    travel: "travelling confidently and navigating real-world situations as a tourist or expat",
    study: "succeeding academically in an international university or research setting",
    family: "communicating warmly and personally with foreign family members or partners",
    culture: "enjoying movies, books, music, and social media in the target language",
    fun: "enjoying language learning as a fulfilling personal hobby",
  };
  const goalDescription = learningGoal ? (goalMap[learningGoal] || learningGoal) : "general language proficiency";

  const urgencyLevel =
    (deadlineDays ?? 30) <= 7 ? "EXTREME – generate highly targeted, exam-like, high-density content" :
    (deadlineDays ?? 30) <= 14 ? "HIGH – content should be intensive with maximum vocabulary exposure" :
    (deadlineDays ?? 30) <= 30 ? "INTENSIVE – pack rich, practical content for fast progress" :
    (deadlineDays ?? 30) <= 60 ? "MODERATE – balanced content with steady progression" :
    "RELAXED – comfortable, enjoyable content with gradual build-up";

  const ENGLISH_VIDEOS = ["reYcgvTEXBE", "8rDJmX7S5aM", "RJKK8q9b54Q", "9vJRopau0g0", "F0YdOETyOCQ", "iG9CE55wbtY"];
  const SWEDISH_VIDEOS = ["L9y_eC6FepQ", "pXzB187H5fE", "Xz_Xv3N_tOQ", "yY8pUvG766o", "7Yq3E9g5OEQ"];
  
  const videoId = isSwedish 
    ? SWEDISH_VIDEOS[Math.floor(Math.random() * SWEDISH_VIDEOS.length)] 
    : ENGLISH_VIDEOS[Math.floor(Math.random() * ENGLISH_VIDEOS.length)];

  const typeInstructions: Record<TaskType, string> = {
    READ: "Provide an excerpt from a real, recent article or research paper related to AI, UI/UX, Business, or Technology in the target language. Put the Title at the top, followed by a 100-word excerpt, and end with a comprehension question.",
    LISTEN: `You will create a quiz for a real YouTube video. Format your output 'content' field EXACTLY like this (using the pipe character): "${videoId} | Your question related to technology/business/AI? | Option A | Option B | Option C | Option D | CorrectIndex (0-3)".`,
    SPEAK: "Provide a challenging open-ended speaking prompt. The learner will practice the 4-3-2 method (speaking on the exact same topic for 4 mins, then 3 mins, then 2 mins). Describe the scenario clearly.",
    WRITE: "Provide a writing scenario or prompt that requires the learner to write 3–5 sentences in the target language. The scenario should directly relate to their real-world goal.",
    QUIZ: "Provide a multiple-choice question testing vocabulary or grammar at this CEFR level. Format: \"Question? | Option A | Option B | Option C | Option D | CorrectIndex\" (0-indexed).",
  };

  return `# ROLE
You are an expert ${targetLang} language curriculum designer specializing in accelerated CEFR-aligned learning for ${nativeLang} speakers.

# CONTEXT
- Target Language: ${targetLang}
- Learner's Native Language: ${nativeLang}
- CEFR Level: ${level}
- Learner's Goal: ${goalDescription}
- Study Timeline: ${deadlineDays ?? 30} days total — this is Task ${dayIndex} of ${totalDays} for this level
- Urgency: ${urgencyLevel}

# CONSTRAINT
- The task MUST be at exactly ${level} difficulty — not easier, not harder
- Content MUST be directly useful for the learner's goal: "${goalDescription}"
- Do NOT use generic filler content — every sentence should feel purposeful and real-world applicable
- Keep vocabulary fresh and non-repetitive across a curriculum
- Task type is strictly: ${type}

# TASK
${typeInstructions[type]}

# OUTPUT
Respond ONLY with a valid JSON object (no markdown code blocks) in this exact structure:
{
  "title": "A short, punchy title (max 5 words)",
  "content": "The actual task material per the instructions above.",
  "xpReward": ${(deadlineDays ?? 30) <= 14 ? 150 : 100}
}`;
}

// ─── CORE AI CALL ────────────────────────────────────────────────────────────
async function callGemini(prompt: string): Promise<{ title: string; content: string; xpReward: number } | null> {
  if (!GEMINI_API_KEY) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.75,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    console.error("Gemini API Error:", await response.text());
    return null;
  }

  const data = await response.json();
  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!jsonText) return null;

  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

// ─── SINGLE TASK GENERATOR (used by admin panel) ──────────────────────────────
export async function generateTaskAI(
  category: Category,
  level: Level,
  type: TaskType,
  opts?: { learningGoal?: string; nativeLanguage?: string; deadlineDays?: number }
) {
  if (!GEMINI_API_KEY) return { error: "Gemini API Key is not configured." };

  const lastTask = await prisma.task.findFirst({
    where: { category, level },
    orderBy: { day: "desc" },
  });
  const nextDay = lastTask ? lastTask.day + 1 : 1;

  const totalCount = await prisma.task.count({ where: { category, level } });

  const prompt = buildTaskPrompt({
    category,
    level,
    type,
    learningGoal: opts?.learningGoal,
    nativeLanguage: opts?.nativeLanguage,
    deadlineDays: opts?.deadlineDays,
    dayIndex: nextDay,
    totalDays: Math.max(nextDay, totalCount + 1),
  });

  try {
    const taskDetails = await callGemini(prompt);
    if (!taskDetails?.title || !taskDetails?.content) {
      return { error: "AI generated invalid structured data." };
    }

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

// ─── ENROLLMENT-DRIVEN ROADMAP GENERATION ─────────────────────────────────────
export async function generateRoadmapForEnrollment(params: {
  userId: string;
  category: Category;
  learningGoal?: string;
  currentLevel?: string;
  targetLevel?: string;
  goalDeadlineDays: number;
  nativeLanguage?: string;
}) {
  const { category, learningGoal, currentLevel, targetLevel, goalDeadlineDays, nativeLanguage } = params;

  const ALL_LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

  // Determine which levels to generate
  const startIdx = currentLevel
    ? Math.max(0, ALL_LEVELS.findIndex((l) => l.toLowerCase() === currentLevel?.replace("level_", "").toLowerCase().replace("beginner","a1").replace("elementary","a2").replace("intermediate","b1").replace("advanced","c1")) )
    : 0;
  const endIdx = targetLevel
    ? ALL_LEVELS.findIndex((l) => l === targetLevel)
    : ALL_LEVELS.length - 1;

  const levelsToGenerate = ALL_LEVELS.slice(
    Math.max(0, startIdx),
    Math.min(ALL_LEVELS.length, endIdx + 1)
  );

  // For English: always B1 → C1
  const effectiveLevels: Level[] =
    category === "UX_ENGLISH" ? (["B1", "B2", "C1"] as Level[]) : levelsToGenerate.length > 0 ? levelsToGenerate : ALL_LEVELS;

  const TASK_TYPES: TaskType[] = ["READ", "LISTEN", "SPEAK", "WRITE"];
  const tasksPerLevel = calcTasksPerLevel(goalDeadlineDays, effectiveLevels.length);

  console.log(
    `[Roadmap Gen] ${category} | ${effectiveLevels.join("→")} | ${goalDeadlineDays}d | ${tasksPerLevel} tasks/level`
  );

  for (const level of effectiveLevels) {
    // How many tasks already exist for this level?
    const existingCount = await prisma.task.count({ where: { category, level } });
    const needed = Math.max(0, tasksPerLevel - existingCount);

    for (let i = 0; i < needed; i++) {
      const type = TASK_TYPES[i % TASK_TYPES.length];
      const dayIndex = existingCount + i + 1;

      const prompt = buildTaskPrompt({
        category,
        level,
        type,
        learningGoal,
        nativeLanguage,
        deadlineDays: goalDeadlineDays,
        dayIndex,
        totalDays: tasksPerLevel,
      });

      try {
        const taskDetails = await callGemini(prompt);
        if (taskDetails?.title && taskDetails?.content) {
          const lastExisting = await prisma.task.findFirst({
            where: { category, level },
            orderBy: { day: "desc" },
          });
          await prisma.task.create({
            data: {
              category,
              level,
              type,
              day: (lastExisting?.day ?? 0) + 1,
              title: taskDetails.title,
              content: taskDetails.content,
              xpReward: taskDetails.xpReward || 100,
            },
          });
        }
      } catch (err) {
        console.error(`Failed to generate task for ${category}/${level}:`, err);
      }
    }
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// ─── FULL CURRICULUM (admin use) ───────────────────────────────────────────────
export async function generateFullCurriculum() {
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
      const existingCount = await prisma.task.count({
        where: { category: track.category, level },
      });

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

  const lastTask = await prisma.task.findFirst({
    orderBy: { day: "desc" },
  });

  const CYCLE: TaskType[] = ["READ", "LISTEN", "SPEAK", "WRITE"];

  let category: Category = "UX_ENGLISH";
  let level: Level = "B1";
  let nextType: TaskType = "READ";

  if (lastTask) {
    category = lastTask.category as Category;
    level = lastTask.level as Level;
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

// Auto-ensure English curriculum exists at dashboard load
export async function ensureCurriculumExists() {
  const englishLevels: Level[] = ["B1", "B2", "C1"];
  const taskTypes: TaskType[] = ["SPEAK", "LISTEN", "READ", "WRITE"];

  let generated = 0;

  for (const level of englishLevels) {
    for (const type of taskTypes) {
      const existing = await prisma.task.findFirst({
        where: { category: "UX_ENGLISH", level, type },
      });
      if (!existing) {
        await generateTaskAI("UX_ENGLISH", level, type);
        generated++;
      }
    }
  }

  if (generated > 0) {
    revalidatePath("/dashboard");
  }
  return { generated };
}
