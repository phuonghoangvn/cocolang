"use client";

import { useState, useTransition } from "react";
import { generateTaskAI, Category, Level, TaskType } from "@/app/actions/ai";
import { Loader2, Plus, Sparkles, CheckCircle } from "lucide-react";

const CATEGORIES: Category[] = ["SWEDISH", "UX_ENGLISH"];
const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];
const TASK_TYPES: TaskType[] = ["LISTEN", "SPEAK", "READ", "WRITE", "QUIZ"];

export default function AdminPage() {
  const [category, setCategory] = useState<Category>("SWEDISH");
  const [level, setLevel] = useState<Level>("A1");
  const [type, setType] = useState<TaskType>("READ");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleGenerate = () => {
    setResult(null);
    startTransition(async () => {
      const res = await generateTaskAI(category, level, type);
      
      if (res.error) {
        setResult({ type: "error", msg: res.error });
      } else if (res.success && res.task) {
        setResult({
          type: "success",
          msg: `Successfully generated Day ${res.task.day} Task: "${res.task.title}"`
        });
      }
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-amber-500 fill-amber-100" />
          AI Task Generator
        </h1>
        <p className="text-zinc-500 mt-2">
          Use the power of Gemini to automatically formulate lessons based on your parameters.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-8 max-w-2xl">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800">Track (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-950 transition-shadow appearance-none font-medium text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c === "UX_ENGLISH" ? "UX/UI English" : "Swedish"}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-800">Difficulty (Level)</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-zinc-950 transition-shadow appearance-none font-medium text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-800">Task Modality (Type)</label>
            <div className="grid grid-cols-3 gap-3">
              {TASK_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t as TaskType)}
                  className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all border-2 text-center ${
                    type === t
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-md shadow-zinc-950/20"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
              result.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {result.type === 'success' ? <CheckCircle className="w-5 h-5" /> : null}
              {result.msg}
            </div>
          )}

          <div className="pt-4 mt-8 border-t border-zinc-100 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white tracking-wide font-semibold pl-4 pr-5 py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[200px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-current" />
                  Magic Generate Task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
