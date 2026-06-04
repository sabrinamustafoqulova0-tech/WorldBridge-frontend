"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle, XCircle, Clock, User, Mail, Phone,
  Globe, ChevronLeft, ChevronRight, Eye, X, MessageSquare,
} from "lucide-react";
import api from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";

type SuggestionStatus = "pending" | "approved" | "rejected";

interface Suggestion {
  id: number;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
  program_title: string;
  country: string;
  description: string;
  official_url: string | null;
  extra_info: string | null;
  status: SuggestionStatus;
  admin_comment: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<SuggestionStatus, { label: string; color: string; icon: React.FC<{ size: number }> }> = {
  pending:  { label: "На рассмотрении", color: "text-amber-500 bg-amber-500/10 border-amber-500/20",   icon: Clock },
  approved: { label: "Одобрено",         color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  rejected: { label: "Отклонено",        color: "text-red-500 bg-red-500/10 border-red-500/20",         icon: XCircle },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminSuggestionsPage() {
  const { user, isAuthenticated } = useAuthStore();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<SuggestionStatus | "all">("all");
  const pageSize = 15;

  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const inputCls =
    "w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] " +
    "focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]";

  const load = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page, size: pageSize };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await api.get("/suggestions/admin/all", { params });
      setSuggestions(res.data.items);
      setTotal(res.data.total);
      setPendingCount(res.data.pending_count);
      setTotalPages(Math.ceil(res.data.total / pageSize));
    } catch (err) {
      console.error("Failed to load suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) load();
  }, [page, statusFilter, isAuthenticated, user]);

  const handleReview = async () => {
    if (!selected) return;
    setReviewing(true);
    setReviewError("");
    try {
      const res = await api.patch(`/suggestions/admin/${selected.id}/review`, {
        status: reviewStatus,
        admin_comment: reviewComment.trim() || null,
      });
      setSuggestions(prev => prev.map(s => s.id === selected.id ? res.data : s));
      setPendingCount(prev => Math.max(0, prev - 1));
      setSelected(res.data);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setReviewError(typeof detail === "string" ? detail : "Ошибка при модерации");
    } finally {
      setReviewing(false);
    }
  };

  const openDetail = (s: Suggestion) => {
    setSelected(s);
    setReviewStatus("approved");
    setReviewComment("");
    setReviewError("");
  };

  return (
    <div className="min-h-full pb-16">
      <main className="pt-8 px-6 md:px-8 max-w-5xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Предложения пользователей</h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-bold">
                  {pendingCount}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--muted)]">Программы, предложенные пользователями для публикации.</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setStatusFilter(tab); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                statusFilter === tab
                  ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
              }`}
            >
              {tab === "all" ? `Все (${total})` :
               tab === "pending" ? `На рассмотрении${pendingCount > 0 ? ` (${pendingCount})` : ""}` :
               tab === "approved" ? "Одобрено" : "Отклонено"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-20 text-center text-sm text-[var(--muted)]">Предложений нет</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background-subtle)] sticky top-0 text-[var(--muted)] font-semibold">
                    <th className="p-4">Пользователь</th>
                    <th className="p-4">Программа</th>
                    <th className="p-4">Страна</th>
                    <th className="p-4">Дата</th>
                    <th className="p-4 text-center">Статус</th>
                    <th className="p-4 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/60">
                  {suggestions.map(s => {
                    const cfg = STATUS_CONFIG[s.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={s.id} className="hover:bg-[var(--border)]/5 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold">{s.submitter_name}</p>
                          <p className="text-[10px] text-[var(--muted)] truncate max-w-[140px]">{s.submitter_email}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold max-w-[180px] truncate">{s.program_title}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-[var(--muted)]">{s.country}</span>
                        </td>
                        <td className="p-4 text-[var(--muted)] whitespace-nowrap">
                          {new Date(s.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${cfg.color}`}>
                              <StatusIcon size={10} />
                              {cfg.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => openDetail(s)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)] text-[10px] font-semibold"
                            >
                              <Eye size={11} />
                              Просмотр
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--muted)]">Страница {page} из {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-[100]">
          <div onClick={() => setSelected(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-[var(--background)] border-l border-[var(--border)] shadow-2xl overflow-y-auto animate-slide-left">

            {/* Header — sticky */}
            <div className="sticky top-0 z-10 px-6 py-4 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Предложение #{selected.id}</h2>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Подано {formatDate(selected.created_at)}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)]"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="px-6 py-5 space-y-5">

              {/* Status badge */}
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = STATUS_CONFIG[selected.status];
                  const Icon = cfg.icon;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${cfg.color}`}>
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>

              {/* Submitter info */}
              <div className="card border-[var(--border)] rounded-xl p-4 space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Контакты</p>
                <div className="flex items-center gap-2 text-sm">
                  <User size={13} className="text-[var(--accent)] shrink-0" />
                  <span className="font-semibold">{selected.submitter_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={13} className="text-[var(--accent)] shrink-0" />
                  <a href={`mailto:${selected.submitter_email}`} className="text-[var(--accent)] hover:underline">
                    {selected.submitter_email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={13} className="text-[var(--accent)] shrink-0" />
                  <span>{selected.submitter_phone}</span>
                </div>
              </div>

              {/* Program info */}
              <div className="card border-[var(--border)] rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">О программе</p>
                <div>
                  <p className="text-[10px] text-[var(--muted)] font-semibold mb-0.5">Название</p>
                  <p className="text-sm font-bold">{selected.program_title}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted)] font-semibold mb-0.5">Страна</p>
                  <p className="text-sm">{selected.country}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted)] font-semibold mb-0.5">Описание</p>
                  <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>
                {selected.official_url && (
                  <div>
                    <p className="text-[10px] text-[var(--muted)] font-semibold mb-0.5">Официальный сайт</p>
                    <a
                      href={selected.official_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
                    >
                      <Globe size={12} />
                      {selected.official_url}
                    </a>
                  </div>
                )}
                {selected.extra_info && (
                  <div>
                    <p className="text-[10px] text-[var(--muted)] font-semibold mb-0.5">Дополнительно</p>
                    <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{selected.extra_info}</p>
                  </div>
                )}
              </div>

              {/* Admin comment (if already reviewed) */}
              {selected.status !== "pending" && selected.admin_comment && (
                <div className="card border-[var(--border)] rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={12} className="text-[var(--muted)]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Комментарий администратора</p>
                  </div>
                  <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{selected.admin_comment}</p>
                </div>
              )}

              {/* Review form (only if pending) */}
              {selected.status === "pending" && (
                <div className="card border-[var(--border)] rounded-xl p-4 space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Модерация</p>

                  {reviewError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                      {reviewError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setReviewStatus("approved")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        reviewStatus === "approved"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-emerald-500/30 hover:text-emerald-500"
                      }`}
                    >
                      <CheckCircle size={13} />
                      Одобрить
                    </button>
                    <button
                      onClick={() => setReviewStatus("rejected")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        reviewStatus === "rejected"
                          ? "bg-red-500/10 border-red-500/30 text-red-500"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-red-500/30 hover:text-red-500"
                      }`}
                    >
                      <XCircle size={13} />
                      Отклонить
                    </button>
                  </div>

                  {reviewStatus === "approved" && (
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                      При одобрении будет автоматически создан черновик программы для дальнейшего редактирования.
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-[var(--muted)]">
                      Комментарий {reviewStatus === "rejected" ? "(рекомендуется)" : "(необязательно)"}
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder={reviewStatus === "approved" ? "Спасибо за предложение!" : "Причина отклонения..."}
                      className={inputCls}
                    />
                  </div>

                  <button
                    onClick={handleReview}
                    disabled={reviewing}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                      reviewStatus === "approved"
                        ? "bg-[var(--accent)] text-white hover:bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    {reviewing ? (
                      <><div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Обработка...</>
                    ) : reviewStatus === "approved" ? (
                      <><CheckCircle size={13} /> Одобрить предложение</>
                    ) : (
                      <><XCircle size={13} /> Отклонить предложение</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
