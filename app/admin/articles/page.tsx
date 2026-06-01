"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Globe,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  X,
  Upload,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import api from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import { useLangStore } from "../../../store/langStore";
import { translations } from "../../../locales/translations";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url?: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
}

// Simple Cyrillic-to-Latin transliteration helper for slugs
function transliterate(text: string): string {
  const rus = "а-б-в-г-д-е-ё-ж-з-и-й-к-л-м-н-о-п-р-с-т-у-ф-х-ц-ч-ш-щ-ъ-ы-ь-э-ю-я- ".split("-");
  const lat = "a-b-v-g-d-e-yo-zh-z-i-y-k-l-m-n-o-p-r-s-t-u-f-kh-ts-ch-sh-shch--y--e-yu-ya-".split("-");
  rus.push(" ");
  lat.push("-");
  
  let result = text.toLowerCase();
  for (let i = 0; i < rus.length; i++) {
    result = result.split(rus[i]).join(lat[i]);
  }
  return result
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { lang } = useLangStore();
  const navText = translations[lang]?.nav || translations.ru.nav;

  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8;

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Direct access control
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user || !user.is_admin)) {
      router.push("/login");
    }
  }, [isAuthenticated, user, authLoading]);

  // Load articles
  const loadArticles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/articles", {
        params: {
          page,
          size: pageSize,
          search: searchQuery || undefined,
          admin_view: true
        }
      });
      setArticles(res.data.items);
      setTotalPages(Math.ceil(res.data.total / pageSize));
    } catch (err) {
      console.error("Failed to load articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      loadArticles();
    }
  }, [page, searchQuery, isAuthenticated, user]);

  // Handle title changes to auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editId) {
      setSlug(transliterate(val));
    }
  };

  // Open drawer for creation
  const handleCreateNew = () => {
    setEditId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverUrl("");
    setIsPublished(false);
    setErrorMsg("");
    setIsDrawerOpen(true);
  };

  // Open drawer for editing
  const handleEditClick = (article: Article) => {
    setEditId(article.id);
    setTitle(article.title);
    setSlug(article.slug);
    setExcerpt(article.excerpt);
    setContent(article.content);
    setCoverUrl(article.cover_image_url || "");
    setIsPublished(article.is_published);
    setErrorMsg("");
    setIsDrawerOpen(true);
  };

  // Toggle status immediately
  const handleStatusToggle = async (article: Article) => {
    try {
      await api.patch(`/articles/${article.id}`, {
        is_published: !article.is_published
      });
      loadArticles();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      setErrorMsg("Заполните обязательные поля: Заголовок, ЧПУ и Содержимое.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const payload = {
        title,
        slug,
        excerpt,
        content,
        cover_image_url: coverUrl || null,
        is_published: isPublished
      };

      if (editId) {
        await api.patch(`/articles/${editId}`, payload);
      } else {
        await api.post("/articles", payload);
      }

      setIsDrawerOpen(false);
      loadArticles();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Произошла ошибка при сохранении статьи.");
    } finally {
      setSaving(false);
    }
  };

  // Delete article
  const handleDeleteClick = async (id: number) => {
    if (confirm("Вы уверены, что хотите удалить эту статью? Это действие необратимо.")) {
      try {
        await api.delete(`/articles/${id}`);
        loadArticles();
      } catch (err) {
        console.error("Failed to delete article:", err);
      }
    }
  };

  if (authLoading || !isAuthenticated || !user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex justify-center items-center">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col pb-24">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-5 md:px-8 glass border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <ArrowLeft size={14} /> На сайт
          </Link>
          <div className="h-4 w-px bg-[var(--border)]"></div>
          <span className="font-bold text-[14px] tracking-tight">WorldBridge CMS</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
            Admin
          </span>
        </div>
      </nav>

      {/* Main Admin layout */}
      <main className="pt-24 px-5 md:px-8 max-w-6xl mx-auto w-full flex-1 space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Управление статьями</h1>
            <p className="text-xs text-[var(--muted)]">Публикация гайдов, историй переезда и новостей для платформы.</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
          >
            <Plus size={14} /> Добавить статью
          </button>
        </div>

        {/* Toolbar Search */}
        <div className="relative max-w-sm w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] shadow-inner transition-colors"
          />
        </div>

        {/* Article Table inside Glass card */}
        <div className="glass border border-[var(--border)] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--border)]/5 text-[var(--muted)] font-semibold">
                    <th className="p-4">Название</th>
                    <th className="p-4">ЧПУ (Slug)</th>
                    <th className="p-4 text-center">Просмотры</th>
                    <th className="p-4 text-center">Статус</th>
                    <th className="p-4 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/60">
                  {articles.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--border)]/5 transition-colors">
                      <td className="p-4 font-semibold max-w-[200px] md:max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="p-4 font-mono text-[10px] text-[var(--muted)]">
                        {item.slug}
                      </td>
                      <td className="p-4 text-center font-semibold text-[var(--muted)]">
                        {item.views_count}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleStatusToggle(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all ${
                              item.is_published
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                            }`}
                          >
                            {item.is_published ? (
                              <>
                                <CheckCircle size={10} /> Опубликовано
                              </>
                            ) : (
                              <>
                                <XCircle size={10} /> Черновик
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/articles/${item.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                          >
                            <ExternalLink size={12} />
                          </Link>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:border-red-500/30 hover:bg-red-500/5 transition-colors text-red-500/80 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {articles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-xs text-[var(--muted)]">
                        Статьи не найдены.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--muted)]">
                Страница {page} из {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Slide-out Drawer Panel (HTML form) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop blur overlay */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-2xl w-full flex pl-10">
            <div className="w-screen max-w-2xl transform bg-[var(--background)] border-l border-[var(--border)] shadow-2xl flex flex-col animate-slide-left">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between glass">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold">
                    {editId ? "Редактировать статью" : "Создать новую статью"}
                  </h2>
                  <p className="text-[10px] text-[var(--muted)]">Заполните поля и нажмите сохранить для публикации.</p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Drawer Scrollable Body Form */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Заголовок *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Как получить студенческую визу в Германию"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">ЧПУ (Slug) *</label>
                    <input
                      type="text"
                      required
                      placeholder="studencheskaya-viza"
                      value={slug}
                      onChange={(e) => setSlug(transliterate(e.target.value))}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Обложка (URL)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]"
                    />
                  </div>
                </div>

                {coverUrl && (
                  <div className="w-full h-32 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--border)]/10">
                    <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Краткое превью *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Краткое описание статьи для списков и карточек поиска..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Содержимое (HTML) *</label>
                  <textarea
                    required
                    rows={12}
                    placeholder="<p>Текст статьи в HTML разметке...</p>"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]"
                  />
                </div>

                {/* Published Toggle checkbox */}
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold">Опубликовать статью</span>
                    <p className="text-[10px] text-[var(--muted)]">Сделайте статью видимой для всех пользователей.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--accent)]"
                  />
                </div>

                {/* Submit Controls Footer */}
                <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--card)] transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:bg-emerald-500 transition-all disabled:opacity-50"
                  >
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
