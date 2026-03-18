"use client";

import { useState, useTransition, useMemo } from "react";
import { completeTask } from "@/app/actions/task";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import TaskCompletionCelebration from "@/components/TaskCompletionCelebration";
import { useRouter } from "next/navigation";

export default function ListenWorkspace({ task, isCompleted }: { task: any; isCompleted: boolean }) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  // Expected format from AI: "VIDEO_ID | Question? | Option A | Option B | Option C | Option D | CorrectIndex"
  const parsedData = useMemo(() => {
    try {
      if (!task.content.includes("|")) throw new Error("Format mismatch");
      const parts = task.content.split("|").map((s: string) => s.trim());
      if (parts.length >= 7) {
        return {
          videoId: parts[0],
          question: parts[1],
          options: [parts[2], parts[3], parts[4], parts[5]],
          correctIdx: Number(parts[6]) || 0
        };
      }
      throw new Error("Missing parts");
    } catch {
      return {
        videoId: "8rDJmX7S5aM", // Default fallback if format fails
        question: task.content || "Watch the video and summarize the concept:",
        options: ["Agree strongly", "Disagree slightly", "I didn't understand", "Needs more context"],
        correctIdx: 0,
      };
    }
  }, [task.content]);

  const handleComplete = () => {
    startTransition(async () => {
      // In a real app we might check `selectedAnswer === parsedData.correctIdx`.
      // For now we just complete it regardless of right/wrong, or could throw an error.
      const res = await completeTask(task.id, `Selected option: ${parsedData.options[selectedAnswer || 0]}`);
      if (res.success) {
        setShowCelebration(true);
      }
    });
  };

  const isCorrect = selectedAnswer === parsedData.correctIdx;
  const showFeedback = selectedAnswer !== null;

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

      <div className="max-w-3xl mx-auto h-full flex flex-col py-8 pb-12">
        {/* YouTube Video Section */}
        <div className="bg-zinc-950 rounded-3xl p-2 mb-8 shadow-xl overflow-hidden">
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

        <div className="flex-1 mt-2">
          <h3 className="font-bold text-xl text-zinc-900 mb-2 leading-tight">
            {parsedData.question}
          </h3>
          <p className="text-sm text-zinc-500 mb-6 font-medium">Watch the video above and select the best answer.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parsedData.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={isCompleted || showFeedback}
                onClick={() => setSelectedAnswer(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 group ${
                  showFeedback && idx === parsedData.correctIdx
                    ? "border-emerald-500 bg-emerald-50"
                    : showFeedback && idx === selectedAnswer && idx !== parsedData.correctIdx
                    ? "border-red-500 bg-red-50"
                    : selectedAnswer === idx 
                    ? "border-zinc-950 bg-zinc-50" 
                    : "border-zinc-200 hover:border-zinc-300 bg-white"
                } disabled:opacity-80 disabled:cursor-not-allowed`}
              >
                <div className="mt-0.5 shrink-0">
                  {showFeedback && idx === parsedData.correctIdx ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : showFeedback && idx === selectedAnswer ? (
                    <Circle className="w-5 h-5 text-red-500 fill-red-100" />
                  ) : selectedAnswer === idx ? (
                    <CheckCircle2 className="w-5 h-5 text-zinc-950" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-300 group-hover:text-zinc-400" />
                  )}
                </div>
                <span className={`font-semibold text-sm leading-snug ${
                  showFeedback && idx === parsedData.correctIdx
                    ? "text-emerald-800"
                    : showFeedback && idx === selectedAnswer
                    ? "text-red-800"
                    : "text-zinc-700"
                }`}>
                  {opt}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200">
          <button
            onClick={handleComplete}
            disabled={selectedAnswer === null || isPending || isCompleted || (!isCorrect && showFeedback)}
            className={`w-full text-white rounded-xl py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm ${
               isCompleted 
                ? "bg-emerald-500 hover:bg-emerald-600" 
                : showFeedback && isCorrect 
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : selectedAnswer !== null 
                    ? "bg-red-500 opacity-50 cursor-not-allowed" 
                    : "bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCompleted ? "Already Completed (Back to map)" : showFeedback && isCorrect ? "Correct! Click to Continue" : showFeedback && !isCorrect ? "Incorrect, try again next time" : "Submit Answer"}
          </button>
          
          {showFeedback && !isCorrect && !isCompleted && (
            <div className="text-center mt-4">
              <button 
                onClick={() => setSelectedAnswer(null)} 
                className="text-sm font-bold border-b-2 border-zinc-300 text-zinc-500 hover:text-zinc-800 transition-colors pb-0.5"
              >
                Try answering again
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
