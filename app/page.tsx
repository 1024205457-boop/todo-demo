"use client";
// @ts-nocheck

import React, { useEffect, useState, KeyboardEvent } from "react";

type Todo = {
  id: number;
  content: string;
  completed: boolean;
  created_at: string;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setError(null);
      const res = await fetch("/api/todos", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("获取待办列表失败");
      }
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error(err);
      setError("加载待办列表失败，请稍后重试");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async () => {
    const value = inputValue.trim();
    if (!value || loading) return;

    setLoading(true);
    try {
      setError(null);
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: value }),
      });

      if (!res.ok) {
        throw new Error("创建待办失败");
      }

      setInputValue("");
      await fetchTodos();
    } catch (err) {
      console.error(err);
      setError("添加任务失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    if (loading) return;

    setLoading(true);
    try {
      setError(null);
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: todo.id,
          completed: !todo.completed,
        }),
      });

      if (!res.ok) {
        throw new Error("更新待办状态失败");
      }

      await fetchTodos();
    } catch (err) {
      console.error(err);
      setError("更新任务状态失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTodo();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur border border-blue-100 shadow-lg rounded-2xl p-6 sm:p-8">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            我的待办清单
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            记录今天要做的事，完成后打个勾 ✅
          </p>
        </header>

        {/* 输入区域 */}
        <section className="mb-6">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例如：完成作业、去健身房、学习 React..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
            />
            <button
              onClick={handleAddTodo}
              className="shrink-0 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 sm:px-5 py-2.5 text-sm sm:text-base font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!inputValue.trim() || loading}
            >
              添加
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-500 text-left">{error}</p>
          )}
        </section>

        {/* 列表区域 */}
        <section>
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 text-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-400">
                ⏳
              </div>
              <p>正在加载待办列表...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 text-sm">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-400">
                ✏️
              </div>
              <p>还没有任务，先添加一个今天要完成的目标吧。</p>
            </div>
          ) : (
            <ul className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5 hover:border-blue-200 hover:bg-blue-50/70 transition"
                >
                  <label className="flex items-center gap-3 w-full cursor-pointer">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                    />
                    <span
                      className={`flex-1 text-sm sm:text-base text-slate-800 ${
                        todo.completed
                          ? "line-through text-slate-400"
                          : "group-hover:text-slate-900"
                      }`}
                    >
                      {todo.content}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}