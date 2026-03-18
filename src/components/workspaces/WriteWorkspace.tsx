"use client";

import { useState, useTransition } from "react";
import { completeTask } from "@/app/actions/task";
import { Copy, Check, Loader2 } from "lucide-react";
import TaskCompletionCelebration from "@/components/TaskCompletionCelebration";
import { useRouter } from "next/navigation";

export default function WriteWorkspace({ task, isCompleted }: { task: any; isCompleted: boolean }) {
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    startTransition(async () => {
      const res = await completeTask(task.id, content);
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

      <div className="max-w-3xl mx-auto flex flex-col min-h-[70vh] md:h-full py-6 px-4 md:px-0">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Writing Prompt</h2>
            <p className="text-zinc-600 mt-2 font-medium">{task.content}</p>
          </div>
        </div>

        <div className="flex-1 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col focus-within:ring-2 focus-within:ring-zinc-950 transition-shadow">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isCompleted}
            placeholder="Start drafting your essay here..."
            className="flex-1 w-full p-4 md:p-6 resize-none min-h-[250px] md:min-h-0 focus:outline-none text-zinc-800 leading-relaxed text-base md:text-lg disabled:bg-zinc-50"
          />
          <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-500 font-mono">
              {content.split(/\s+/).filter((w) => w.length > 0).length} words
            </div>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 bg-white border border-zinc-200 py-2 px-4 rounded-lg shadow-sm transition-colors hover:shadow active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy All"}
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleComplete}
            disabled={content.trim().length === 0 || isPending || isCompleted}
            className="px-8 min-w-[200px] bg-zinc-950 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCompleted ? "Already Submitted" : "Submit Portfolio Piece"}
          </button>
        </div>
      </div>
    </>
  );
}
