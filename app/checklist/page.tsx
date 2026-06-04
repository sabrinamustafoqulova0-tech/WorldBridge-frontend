"use client";

import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import api from "../../lib/api";
import {
    ArrowLeft,
    Globe,
    Moon,
    Sun,
    Plus,
    Trash2,
    CheckCircle2,
    Circle,
    Loader2,
    ClipboardList,
    Pencil,
    X,
    Check,
} from "lucide-react";

interface ChecklistItem {
    id: number;
    user_id: number;
    program_id: number | null;
    title: string;
    is_done: boolean;
    position: number;
}

export default function ChecklistPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchItems();
        }
    }, [authLoading, isAuthenticated]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await api.get("/checklists");
            setItems(res.data.items || []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setAdding(true);
        try {
            const res = await api.post("/checklists", {
                title: newTitle.trim(),
                program_id: 0,
                position: items.length,
            });
            setItems((prev) => [...prev, res.data]);
            setNewTitle("");
        } catch { }
        finally { setAdding(false); }
    };

    const handleToggle = async (item: ChecklistItem) => {
        try {
            const res = await api.patch(`/checklists/${item.id}`, {
                title: item.title,
                is_done: !item.is_done,
                position: item.position,
            });
            setItems((prev) => prev.map((i) => (i.id === item.id ? res.data : i)));
        } catch { }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/checklists/${id}`);
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch { }
    };

    const startEdit = (item: ChecklistItem) => {
        setEditingId(item.id);
        setEditTitle(item.title);
    };

    const handleEditSave = async (item: ChecklistItem) => {
        if (!editTitle.trim()) return;
        try {
            const res = await api.patch(`/checklists/${item.id}`, {
                title: editTitle.trim(),
                is_done: item.is_done,
                position: item.position,
            });
            setItems((prev) => prev.map((i) => (i.id === item.id ? res.data : i)));
        } catch { }
        finally {
            setEditingId(null);
            setEditTitle("");
        }
    };

    const doneCount = items.filter((i) => i.is_done).length;
    const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

    if (authLoading) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)]">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
        );
    }

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col pb-24">

      {/* Header */}
      <div className="pt-24 pb-8 px-4 md:px-6">
        <div className="max-w-[1440px] mx-auto space-y-3">
          <p className="text-[11px] uppercase tracking-widest font-bold text-[var(--accent)] flex items-center gap-1.5">
            <ClipboardList size={12} />
            Личный трекер
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight">
            Мой чеклист
          </h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed max-w-[45ch]">
            Отслеживайте прогресс подготовки к переезду шаг за шагом.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 w-full space-y-6">

                {/* Progress card */}
                {items.length > 0 && (
                    <div className="card rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-[var(--muted)]">Прогресс</span>
                            <span className="text-[var(--accent)]">{doneCount} / {items.length} выполнено</span>
                        </div>
                        <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--accent)] rounded-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-[var(--muted)]">{progress}% завершено</p>
                    </div>
                )}

                {/* Add form */}
                <form onSubmit={handleAdd} className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Добавить новый пункт..."
                        className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={adding || !newTitle.trim()}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                        {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Добавить
                    </button>
                </form>

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed border-[var(--border)] rounded-3xl space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center">
                            <ClipboardList size={24} className="text-[var(--accent)] opacity-60" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm">Список пуст</h3>
                            <p className="text-xs text-[var(--muted)] max-w-[28ch] leading-relaxed">
                                Добавьте первый пункт чтобы начать отслеживать прогресс
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`group glass border rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all duration-200 ${item.is_done
                                        ? "border-[var(--accent)]/20 bg-[var(--accent)]/5"
                                        : "border-[var(--border)] hover:border-[var(--accent)]/20"
                                    }`}
                            >
                                {/* Toggle */}
                                <button
                                    onClick={() => handleToggle(item)}
                                    className="shrink-0 transition-transform hover:scale-110"
                                >
                                    {item.is_done
                                        ? <CheckCircle2 size={18} className="text-[var(--accent)]" />
                                        : <Circle size={18} className="text-[var(--muted)]" />
                                    }
                                </button>

                                {/* Title / Edit */}
                                {editingId === item.id ? (
                                    <input
                                        autoFocus
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleEditSave(item);
                                            if (e.key === "Escape") { setEditingId(null); }
                                        }}
                                        className="flex-1 bg-transparent text-sm focus:outline-none border-b border-[var(--accent)] text-[var(--foreground)]"
                                    />
                                ) : (
                                    <span className={`flex-1 text-sm leading-snug ${item.is_done ? "line-through text-[var(--muted)]" : ""}`}>
                                        {item.title}
                                    </span>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {editingId === item.id ? (
                                        <>
                                            <button
                                                onClick={() => handleEditSave(item)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors"
                                            >
                                                <Check size={13} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted)] hover:bg-[var(--border)] transition-colors"
                                            >
                                                <X size={13} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(item)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:bg-[var(--border)] transition-all"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Clear done */}
                {doneCount > 0 && (
                    <button
                        onClick={async () => {
                            const done = items.filter((i) => i.is_done);
                            await Promise.all(done.map((i) => api.delete(`/checklists/${i.id}`)));
                            setItems((prev) => prev.filter((i) => !i.is_done));
                        }}
                        className="w-full py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:border-rose-500/30 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                    >
                        Удалить выполненные ({doneCount})
                    </button>
                )}
            </div>
        </div>
    );
}