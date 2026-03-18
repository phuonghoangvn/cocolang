"use client";

import { useState, useTransition } from "react";
import { completeTask } from "@/app/actions/task";
import { Copy, Check, Loader2 } from "lucide-react";
import TaskCompletionCelebration from "@/components/TaskCompletionCelebration";
import { useRouter } from "next/navigation";

export default function ReadWorkspace({ task, isCompleted }: { task: any; isCompleted: boolean }) {
  const [userContent, setUserContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(task.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    startTransition(async () => {
      const res = await completeTask(task.id, userContent);
      if (res.success) {
        setShowCelebration(true);
      }
    });
  };

  return (
    <>
      {showCelebration && (
        <TaskCompletionCelebration
          xpReward={task.xpReward}
          onFinish={() => {
            setShowCelebration(false);
            router.push("/dashboard");
            router.refresh();
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 relative flex flex-col">
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition shadow-sm"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
          </button>
          <h3 className="font-semibold text-zinc-900 mb-4">Source Text</h3>
          <p className="text-zinc-700 leading-relaxed overflow-y-auto flex-1 whitespace-pre-wrap">
            {task.content}
          </p>
        </div>
        <div className="flex flex-col h-full">
          <h3 className="font-semibold text-zinc-900 mb-4">Your Translation / Notes</h3>
          <textarea
            value={userContent}
            onChange={(e) => setUserContent(e.target.value)}
            disabled={isCompleted}
            placeholder="Type your notes or translation here..."
            className="flex-1 w-full bg-white border border-zinc-200 rounded-xl p-6 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-colors shadow-sm disabled:bg-zinc-50"
          />
          <button
            onClick={handleComplete}
            disabled={isPending || userContent.trim().length === 0 || isCompleted}
            className="mt-6 w-full bg-zinc-950 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCompleted ? "Already Completed" : "Complete Task"}
          </button>
        </div>
      </div>
    </>
  );
}
