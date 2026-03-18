import { prisma } from "@/lib/prisma";
import { simulateBotActivity } from "@/app/actions/bot";
import { Trophy, Medal, Flame, Zap, Crown } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function LeaderboardPage() {
  await simulateBotActivity();

  const session = await getServerSession(authOptions);

  // Fetch real users only
  const realUsers = await prisma.user.findMany({
    where: { isBot: false },
    orderBy: { totalXp: "desc" },
    select: { id: true, name: true, totalXp: true, currentStreak: true, isBot: true },
  });

  // Only real users
  const allUsers = [...realUsers].slice(0, 12);

  const currentUserId = session?.user?.id;

  return (
    <div className="p-6 max-w-3xl mx-auto h-full flex flex-col">
      <div className="text-center mb-8 mt-2">
        <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-2 mb-4">
          <Crown className="w-5 h-5 text-yellow-500 fill-yellow-200" />
          <span className="text-sm font-bold text-yellow-700">Global Leaderboard</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-950">
          Who&apos;s On Top?
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">
          Top most dedicated real learners 📈
        </p>
      </div>

      {/* Top 3 podium */}
      {allUsers.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {[1, 0, 2].map((rank) => {
            const u = allUsers[rank];
            if (!u) return null;
            const isYou = u.id === currentUserId;
            const podiumHeight = rank === 0 ? "h-24" : rank === 1 ? "h-16" : "h-12";
            const medalColors = ["text-yellow-500", "text-zinc-400", "text-amber-600"];
            const medalBg = ["bg-yellow-100", "bg-zinc-100", "bg-amber-50"];
            const scale = rank === 0 ? "scale-110" : "";
            return (
              <div key={u.id} className={`flex flex-col items-center gap-2 ${scale}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black ${
                  isYou ? "bg-gradient-to-br from-sky-400 to-violet-500 text-white" :
                  u.isBot ? "bg-zinc-100 text-zinc-500" : "bg-zinc-900 text-white"
                } shadow-lg`}>
                  {u.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <p className="text-xs font-bold text-zinc-700 max-w-[80px] truncate text-center">
                  {u.name}{isYou ? " 👤" : ""}
                </p>
                <p className="text-xs font-black text-emerald-600">{u.totalXp.toLocaleString()} XP</p>
                <div className={`w-20 ${podiumHeight} ${medalBg[rank]} rounded-t-xl flex items-center justify-center border border-zinc-200`}>
                  <Medal className={`w-6 h-6 ${medalColors[rank]}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden flex-1">
        <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-3 flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Rankings</span>
        </div>
        <div className="divide-y divide-zinc-100">
          {/* Header */}
          <div className="grid grid-cols-[48px_1fr_80px_80px] px-5 py-2 text-xs font-semibold text-zinc-400">
            <div className="text-center">#</div>
            <div>Learner</div>
            <div className="text-center">Streak</div>
            <div className="text-right">XP</div>
          </div>

          {allUsers.map((user, index) => {
            const isYou = user.id === currentUserId;
            const isTop3 = index < 3;

            return (
              <div
                key={user.id}
                className={`grid grid-cols-[48px_1fr_80px_80px] px-5 py-3.5 items-center transition-colors ${
                  isYou
                    ? "bg-sky-50 border-l-2 border-sky-400"
                    : "hover:bg-zinc-50/70"
                }`}
              >
                {/* Rank */}
                <div className="text-center">
                  {index === 0 ? (
                    <Medal className="w-5 h-5 mx-auto text-yellow-500 fill-yellow-100" />
                  ) : index === 1 ? (
                    <Medal className="w-5 h-5 mx-auto text-zinc-400 fill-zinc-100" />
                  ) : index === 2 ? (
                    <Medal className="w-5 h-5 mx-auto text-amber-600 fill-amber-50" />
                  ) : (
                    <span className="text-zinc-400 font-bold text-sm">{index + 1}</span>
                  )}
                </div>

                {/* User info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isYou
                        ? "bg-gradient-to-br from-sky-400 to-violet-500 text-white"
                        : user.isBot
                        ? "bg-zinc-100 text-zinc-500"
                        : "bg-zinc-900 text-white"
                    }`}
                  >
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-sm font-semibold truncate block ${isYou ? "text-sky-800" : user.isBot ? "text-zinc-500" : "text-zinc-900"}`}>
                      {user.name || "Anonymous"}
                    </span>
                    {isYou && <span className="text-[10px] text-sky-500 font-bold">You</span>}
                    {user.isBot && !isYou && <span className="text-[10px] text-zinc-400">Bot</span>}
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center justify-center gap-1">
                  <Flame className={`w-4 h-4 ${user.currentStreak > 0 ? "text-orange-500" : "text-zinc-300"}`} />
                  <span className="text-sm font-bold text-zinc-600">{user.currentStreak}</span>
                </div>

                {/* XP */}
                <div className="text-right">
                  <span className="text-sm font-black text-zinc-950">{user.totalXp.toLocaleString()}</span>
                </div>
              </div>
            );
          })}

          {allUsers.length === 0 && (
            <div className="px-6 py-12 text-center text-zinc-500 text-sm">
              No users found. Try creating an account!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
