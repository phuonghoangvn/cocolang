import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      avatar: true,
      dailyGoalMinutes: true,
      emailReminders: true,
      nativeLanguage: true,
      learningGoal: true,
      totalXp: true,
      currentStreak: true,
    },
  });

  if (!user) redirect("/login");

  return <ProfileClient user={user} />;
}
