import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BookOpen,
  LogOut,
  Trophy,
  Flame,
  Zap,
  BarChart2,
  UserCircle,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const userStats = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      totalXp: true,
      currentStreak: true,
      avatar: true,
      surveyCompleted: true,
    },
  });

  // If survey not completed, redirect to survey page
  // (except if already heading to survey)
  // Note: We can't do path check easily in layout, so we handle this softly

  return (
    <div className="flex h-screen bg-zinc-50 flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-zinc-200 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-5 border-b border-zinc-100 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-base">🦜</span>
            </div>
            <h1 className="font-black text-xl tracking-tight text-zinc-950">
              Cocolang
            </h1>
          </div>

          {/* User card */}
          <Link href="/dashboard/profile" className="p-4 border-b border-zinc-100 flex items-center gap-3 hover:bg-zinc-50 transition-colors group">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl border-2 border-zinc-100 bg-zinc-50 group-hover:border-sky-200 transition-colors">
              {userStats?.avatar || "🦜"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-950 truncate">
                {userStats?.name || "User"}
              </p>
              <div className="flex items-center gap-3 text-xs font-bold mt-0.5">
                <span className="flex items-center gap-1 text-orange-500">
                  <Flame className="w-3 h-3" /> {userStats?.currentStreak || 0}
                </span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <Zap className="w-3 h-3" /> {(userStats?.totalXp || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <UserCircle className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
          </Link>

          {/* Nav */}
          <nav className="p-3 space-y-0.5 text-sm font-medium">
            <NavLink href="/dashboard" icon={<BookOpen className="w-4 h-4" />} label="Roadmap" />
            <NavLink href="/dashboard/stats" icon={<BarChart2 className="w-4 h-4" />} label="My Progress" />
            <NavLink href="/dashboard/leaderboard" icon={<Trophy className="w-4 h-4" />} label="Leaderboard" />
          </nav>
        </div>

        {/* Sign out */}
        <div className="p-4 border-t border-zinc-200">
          <Link
            href="/api/auth/signout"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 transition-colors font-semibold"
    >
      <span className="text-zinc-400">{icon}</span>
      {label}
    </Link>
  );
}
