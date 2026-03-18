"use client";

import { useState, useTransition, useMemo } from "react";
import { completeTask } from "@/app/actions/task";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import TaskCompletionCelebration from "@/components/TaskCompletionCelebration";
import { useRouter } from "next/navigation";

export default function ListenWorkspace({ task, isCompleted }: { task: any; isCompleted: boolean }) {
  const [textAnswer, setTextAnswer] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  // Expected format from AI: "VIDEO_ID | Instruction"
  const parsedData = useMemo(() => {
    try {
      if (!task.content.includes("|")) throw new Error("Format mismatch");
      const parts = task.content.split("|").map((s: string) => s.trim());
      return {
        videoId: parts[0],
        question: parts[1] || "Listen to the video and summarize the main points or transcribe a key section.",
      };
    } catch {
      return {
        videoId: "qp0HIF3SfI4", // Default fallback if format fails
        question: task.content || "Watch the video and summarize the concept:",
      };
    }
  }, [task.content]);

  const handleComplete = () => {
    if (!textAnswer.trim()) return;
    startTransition(async () => {
      const res = await completeTask(task.id, `User Summary: ${textAnswer}`);
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

      <div className="max-w-3xl mx-auto py-4 md:py-8 pb-12 px-4 md:px-0">
        {/* YouTube Video Section */}
        <div className="bg-zinc-950 rounded-3xl p-2 mb-6 shadow-xl overflow-hidden shrink-0">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube-nocookie.com/embed/${parsedData.videoId}?rel=0`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 border-0"
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg md:text-xl text-zinc-900 mb-2 leading-tight">
            {parsedData.question}
          </h3>
          <p className="text-sm text-zinc-500 mb-4 font-medium">Type your summary or transcription below.</p>
          
          <textarea
            disabled={isCompleted || isPending}
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Start typing your notes here..."
            className="w-full resize-none p-4 rounded-xl border-2 border-zinc-200 focus:border-zinc-950 focus:ring-0 outline-none transition-colors disabled:opacity-50 disabled:bg-zinc-50 bg-white"
            style={{ minHeight: "200px" }}
          />
        </div>

        <div className="mt-2 pt-6 border-t border-zinc-200">
          <button
            onClick={handleComplete}
            disabled={!textAnswer.trim() || isPending || isCompleted}
            className={`w-full text-white rounded-xl py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm ${
               isCompleted 
                ? "bg-emerald-500 hover:bg-emerald-600" 
                : textAnswer.trim() 
                  ? "bg-zinc-950 hover:bg-zinc-800"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
            }`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCompleted ? "Already Completed (Back to map)" : "Submit Response"}
          </button>
        </div>
      </div>
    </>
  );
}
