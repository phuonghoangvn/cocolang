import { simulateBotActivity } from "@/app/actions/bot";
import { prisma } from "@/lib/prisma";
import { ensureCurriculumExists } from "@/app/actions/ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Flame, Zap, CheckCircle2 } from "lucide-react";
import RoadmapWrapper from "@/components/RoadmapWrapper";

export default async function DashboardPage() {
  await simulateBotActivity();

  const session = await getServerSession(authOptions);

  // Auto-ensure curriculum exists (generates missing tasks silently)
  const taskCount = await prisma.task.count();
  if (taskCount < 4) {
    ensureCurriculumExists().catch(console.error);
  }

  const allTasks = await prisma.task.findMany({
    orderBy: [{ level: "asc" }, { day: "asc" }],
  });

  const progress = await prisma.userProgress.findMany({
    where: { userId: session?.user?.id },
  });

  const userStats = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      totalXp: true,
      currentStreak: true,
      lastCompletedDate: true,
      activeTrack: true,
      avatar: true,
    },
  });

  const completedTaskIds = progress.map((p: any) => p.taskId);
  const totalCompleted = completedTaskIds.length;
  const totalTasks = allTasks.length;

  return (
    <div className="flex-1 h-full flex flex-col">
      {/* Top stats bar */}
      <div className="bg-white border-b border-zinc-100 px-6 py-3 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-black text-zinc-900 leading-none">{userStats?.currentStreak ?? 0}</p>
            <p className="text-[10px] text-zinc-400 font-medium">streak</p>
          </div>
        </div>
        <div className="w-px h-6 bg-zinc-100" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-black text-zinc-900 leading-none">{(userStats?.totalXp ?? 0).toLocaleString()}</p>
            <p className="text-[10px] text-zinc-400 font-medium">XP</p>
          </div>
        </div>
        <div className="w-px h-6 bg-zinc-100" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-black text-zinc-900 leading-none">{totalCompleted}/{totalTasks}</p>
            <p className="text-[10px] text-zinc-400 font-medium">done</p>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
        <RoadmapWrapper
          tasks={allTasks as any[]}
          completedIds={completedTaskIds}
          initialTrack={(userStats?.activeTrack as string) || "UX_ENGLISH"}
          userAvatar={userStats?.avatar || "🦜"}
        />
      </div>
    </div>
  );
}
