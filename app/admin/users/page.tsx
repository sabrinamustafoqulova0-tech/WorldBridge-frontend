"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import api from "../../../lib/api";
import { Search, Trash2, Shield, User } from "lucide-react";

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const init = parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : parts[0]?.slice(0, 2) || "?";
  return (
    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
      <span className="text-[11px] font-bold text-[var(--accent)] uppercase">{init}</span>
    </div>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      const data = Array.isArray(res.data) ? res.data : (res.data.items ?? []);
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (id === currentUser?.id) return;
    if (!confirm(`Удалить пользователя «${name}»? Это действие необратимо.`)) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-full pb-16">
      <main className="pt-8 px-6 md:px-8 max-w-5xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Пользователи</h1>
            <p className="text-xs text-[var(--muted)]">
              Все зарегистрированные пользователи платформы — {users.length} чел.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] shadow-inner transition-colors"
          />
        </div>

        {/* Table */}
        <div className="glass border border-[var(--border)] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--border)]/5 text-[var(--muted)] font-semibold">
                    <th className="p-4">Пользователь</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Роль</th>
                    <th className="p-4 text-center">Дата</th>
                    <th className="p-4 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/60">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--border)]/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <Initials name={u.full_name || u.email} />
                          <div>
                            <p className="font-semibold text-[12px]">
                              {u.full_name || "—"}
                              {u.id === currentUser?.id && (
                                <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                                  Вы
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-[var(--muted)] md:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[11px] text-[var(--muted)] hidden md:table-cell">{u.email}</td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          {u.is_admin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-[10px] font-bold">
                              <Shield size={9} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--border)]/50 text-[var(--muted)] border border-[var(--border)] text-[10px] font-semibold">
                              <User size={9} /> Пользователь
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center text-[11px] text-[var(--muted)]">
                        {u.created_at ? formatDate(u.created_at) : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleDelete(u.id, u.full_name || u.email)}
                            disabled={u.id === currentUser?.id || u.is_admin}
                            title={
                              u.id === currentUser?.id
                                ? "Нельзя удалить себя"
                                : u.is_admin
                                ? "Нельзя удалить администратора"
                                : "Удалить"
                            }
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:border-red-500/30 hover:bg-red-500/5 transition-colors text-red-500/80 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-xs text-[var(--muted)]">
                        {search ? "Пользователи не найдены." : "Нет зарегистрированных пользователей."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
