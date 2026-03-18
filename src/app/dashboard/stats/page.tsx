import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Flame, Zap, CheckCircle2, Trophy, Mic, Headphones, BookOpen, PenTool, HelpCircle } from "lucide-react";
import ProgressCharts from "@/components/ProgressCharts";

const TASK_TYPE_CONFIG = {
  SPEAK: { label: "Speak", icon: Mic, color: "from-rose-400 to-pink-500", bg: "bg-rose-50", text: "text-rose-600" },
  LISTEN: { label: "Listen", icon: Headphones, color: "from-blue-400 to-sky-500", bg: "bg-blue-50", text: "text-blue-600" },
  READ: { label: "Read", icon: BookOpen, color: "from-violet-400 to-purple-500", bg: "bg-violet-50", text: "text-violet-600" },
  WRITE: { label: "Write", icon: PenTool, color: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-600" },
  QUIZ: { label: "Quiz", icon: HelpCircle, color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600" },
};

// Generate last 7 days labels
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      totalXp: true,
      currentStreak: true,
      lastCompletedDate: true,
    },
  });

  const allProgress = await prisma.userProgress.findMany({
    where: { userId: session.user.id, isCompleted: true },
    include: { task: true },
    orderBy: { completedAt: "asc" },
  });

  // XP by day (last 7 days)
  const last7Days = getLast7Days();
  const xpByDay = last7Days.map((day) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    const xp = allProgress
      .filter((p) => p.completedAt >= dayStart && p.completedAt <= dayEnd)
      .reduce((sum, p) => sum + (p.task?.xpReward || 0), 0);
    return {
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      xp,
    };
  });

  // Tasks by type
  const tasksByType: Record<string, number> = {};
  for (const p of allProgress) {
    const type = p.task?.type || "READ";
    tasksByType[type] = (tasksByType[type] || 0) + 1;
  }

  // By track
  const englishCompleted = allProgress.filter((p) => p.task?.category === "UX_ENGLISH").length;
  const swedishCompleted = allProgress.filter((p) => p.task?.category === "SWEDISH").length;

  // Longest streak est. (simplified)
  const totalDone = allProgress.length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950">My Progress</h1>
        <p className="text-zinc-500 text-sm mt-1">Track your journey and celebrate growth.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          bg="bg-orange-50"
          value={user?.currentStreak ?? 0}
          label="Current Streak"
          unit="days"
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-emerald-500" />}
          bg="bg-emerald-50"
          value={(user?.totalXp ?? 0).toLocaleString()}
          label="Total XP"
          unit=""
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-violet-500" />}
          bg="bg-violet-50"
          value={totalDone}
          label="Tasks Completed"
          unit=""
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 text-yellow-500" />}
          bg="bg-yellow-50"
          value={Math.max(user?.currentStreak ?? 0, 0)}
          label="Best Streak"
          unit="days"
        />
      </div>

      {/* XP Chart + Task breakdown — client component */}
      <ProgressCharts
        xpByDay={xpByDay}
        tasksByType={tasksByType}
        englishCompleted={englishCompleted}
        swedishCompleted={swedishCompleted}
      />

      {/* Recent activity */}
      {allProgress.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-bold text-zinc-900 mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {allProgress.slice(-8).reverse().map((p) => {
              const typeConfig = TASK_TYPE_CONFIG[p.task?.type as keyof typeof TASK_TYPE_CONFIG] || TASK_TYPE_CONFIG.READ;
              const TypeIcon = typeConfig.icon;
              return (
                <div key={p.id} className="flex items-center gap-3 bg-white border border-zinc-100 rounded-xl p-3.5 shadow-sm">
                  <div className={`w-9 h-9 rounded-lg ${typeConfig.bg} flex items-center justify-center shrink-0`}>
                    <TypeIcon className={`w-4 h-4 ${typeConfig.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{p.task?.title}</p>
                    <p className="text-xs text-zinc-400">
                      {p.completedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 shrink-0">
                    +{p.task?.xpReward} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, bg, value, label, unit }: { icon: React.ReactNode; bg: string; value: any; label: string; unit: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
      <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-black text-zinc-900">
        {value}
        {unit && <span className="text-sm font-medium text-zinc-400 ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-zinc-500 font-medium mt-0.5">{label}</p>
    </div>
  );
}
