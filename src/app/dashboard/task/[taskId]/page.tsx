import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReadWorkspace from "@/components/workspaces/ReadWorkspace";
import ListenWorkspace from "@/components/workspaces/ListenWorkspace";
import SpeakWorkspace from "@/components/workspaces/SpeakWorkspace";
import WriteWorkspace from "@/components/workspaces/WriteWorkspace";
import QuizWorkspace from "@/components/workspaces/QuizWorkspace";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    redirect("/dashboard");
  }

  // Check if it's already completed
  const existingProgress = await prisma.userProgress.findUnique({
    where: {
      userId_taskId: {
        userId: session.user.id,
        taskId: task.id,
      },
    },
  });

  if (existingProgress?.isCompleted) {
    // If it's already completed, we can let them review it or redirect back. Let's just let them review for now.
    // Or we could have an overlay. We'll simply let them review.
  }

  let WorkspaceComponent;

  switch (task.type) {
    case "READ":
      WorkspaceComponent = ReadWorkspace;
      break;
    case "LISTEN":
      WorkspaceComponent = ListenWorkspace;
      break;
    case "SPEAK":
      WorkspaceComponent = SpeakWorkspace;
      break;
    case "WRITE":
      WorkspaceComponent = WriteWorkspace;
      break;
    case "QUIZ":
      WorkspaceComponent = QuizWorkspace;
      break;
    default:
      return <div>Unknown Task Type</div>;
  }

  return (
    <div className="h-full bg-white flex flex-col relative">
      {existingProgress?.isCompleted && (
        <div className="bg-emerald-50 text-emerald-700 text-center py-2 text-sm font-semibold border-b border-emerald-100">
          You have already completed this task!
        </div>
      )}
      
      <div className="border-b border-zinc-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-950">{task.title}</h1>
            <p className="text-sm text-zinc-500">Day {task.day} • {task.level}</p>
          </div>
        </div>
        <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          +{task.xpReward} XP
        </div>
      </div>
      <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-8">
        {/* Pass down whether it's completed so workspaces can disable submitting */}
        <WorkspaceComponent task={task as any} isCompleted={existingProgress?.isCompleted || false} />
      </div>
    </div>
  );
}
