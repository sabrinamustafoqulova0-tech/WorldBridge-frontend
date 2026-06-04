"use client";

import { useEffect, useState } from "react";
import {
  Plus, Edit2, Trash2, CheckCircle, XCircle,
  Search, X, ExternalLink, ChevronLeft, ChevronRight,
} from "lucide-react";
import api from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import { CountryFlag } from "../../../components/CountryFlag";

interface Program {
  id: number;
  slug: string;
  title: string;
  country_slug: string | null;
  category: string;
  short_description: string;
  deadline: string | null;
  official_url: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  views_count: number;
}

const CATEGORY_OPTIONS = [
  { value: "ausbildung",   label: "Аусбильдунг"     },
  { value: "fsj",          label: "FSJ"              },
  { value: "au_pair",      label: "Au Pair"          },
  { value: "schule",       label: "Школа"            },
  { value: "arbeit",       label: "Работа"           },
  { value: "studium",      label: "Обучение"         },
  { value: "volunteering", label: "Волонтерство"     },
  { value: "internship",   label: "Стажировка"       },
  { value: "language",     label: "Языковые курсы"   },
  { value: "immigration",  label: "Иммиграция"       },
];

const COUNTRY_OPTIONS = [
  { value: "de", label: "Германия"   },
  { value: "fr", label: "Франция"    },
  { value: "be", label: "Бельгия"    },
  { value: "ch", label: "Швейцария"  },
  { value: "at", label: "Австрия"    },
  { value: "pl", label: "Польша"     },
  { value: "cz", label: "Чехия"      },
  { value: "se", label: "Швеция"     },
  { value: "no", label: "Норвегия"   },
  { value: "fi", label: "Финляндия"  },
  { value: "tr", label: "Турция"     },
  { value: "cn", label: "Китай"      },
  { value: "ca", label: "Канада"     },
  { value: "us", label: "США"        },
];

function transliterate(text: string): string {
  const rus = "а-б-в-г-д-е-ё-ж-з-и-й-к-л-м-н-о-п-р-с-т-у-ф-х-ц-ч-ш-щ-ъ-ы-ь-э-ю-я".split("-");
  const lat = "a-b-v-g-d-e-yo-zh-z-i-y-k-l-m-n-o-p-r-s-t-u-f-kh-ts-ch-sh-shch--y--e-yu-ya".split("-");
  rus.push(" ");
  lat.push("-");
  let result = text.toLowerCase();
  for (let i = 0; i < rus.length; i++) {
    result = result.split(rus[i]).join(lat[i]);
  }
  return result.replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminProgramsPage() {
  const { user, isAuthenticated } = useAuthStore();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [countrySlug, setCountrySlug] = useState("");
  const [category, setCategory] = useState("studium");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [officialUrl, setOfficialUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/programs/admin/all", {
        params: { page, size: pageSize, search: searchQuery || undefined },
      });
      setPrograms(res.data.items);
      setTotalPages(Math.ceil(res.data.total / pageSize));
    } catch (err) {
      console.error("Failed to load programs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) loadPrograms();
  }, [page, searchQuery, isAuthenticated, user]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editId) setSlug(transliterate(val));
  };

  const resetForm = () => {
    setEditId(null);
    setTitle(""); setSlug(""); setCountrySlug(""); setCategory("STUDIUM");
    setShortDescription(""); setDescription(""); setDeadline("");
    setOfficialUrl(""); setCoverUrl(""); setIsPublished(false); setErrorMsg("");
  };

  const handleCreateNew = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleEditClick = (p: Program) => {
    setEditId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setCountrySlug(p.country_slug || "");
    setCategory((p.category || "studium").toLowerCase());
    setShortDescription(p.short_description);
    setDescription("");
    setDeadline(p.deadline || "");
    setOfficialUrl(p.official_url || "");
    setCoverUrl(p.cover_image_url || "");
    setIsPublished(p.is_published);
    setErrorMsg("");
    setIsDrawerOpen(true);
  };

  const handleStatusToggle = async (p: Program) => {
    try {
      await api.patch(`/programs/${p.id}`, { is_published: !p.is_published });
      loadPrograms();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !shortDescription) {
      setErrorMsg("Заполните обязательные поля: Название, Slug и Краткое описание.");
      return;
    }
    try {
      setSaving(true);
      setErrorMsg("");

      const descVal = description.trim() || shortDescription.trim() || "—";
      const payload = {
        title: title.trim(),
        slug: slug.trim().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, ""),
        country_slug: countrySlug || null,
        category: category.toLowerCase(),
        level: "beginner",
        short_description: shortDescription.trim().slice(0, 499),
        description: descVal,
        deadline: deadline.trim() || null,
        official_url: officialUrl.trim() || null,
        cover_image_url: coverUrl.trim() || null,
        is_published: isPublished,
      };

      console.log("[Admin] Sending payload:", JSON.stringify(payload, null, 2));

      if (editId) {
        await api.patch(`/programs/${editId}`, payload);
      } else {
        await api.post("/programs", payload);
      }
      setIsDrawerOpen(false);
      loadPrograms();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail.map((d: any) => {
          const field = Array.isArray(d.loc) ? d.loc.filter((x: any) => x !== "body").join(" → ") : "";
          const msg = d.msg || String(d);
          return field ? `${field}: ${msg}` : msg;
        });
        setErrorMsg(messages.join("\n"));
      } else if (typeof detail === "string") {
        setErrorMsg(detail);
      } else {
        setErrorMsg(`Ошибка ${err.response?.status || ""}: Проверьте все обязательные поля.`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Удалить программу? Это действие необратимо.")) {
      try {
        await api.delete(`/programs/${id}`);
        loadPrograms();
      } catch (err) {
        console.error("Failed to delete program:", err);
      }
    }
  };

  const inputCls =
    "w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--muted)]";

  return (
    <div className="min-h-full pb-16">
      <main className="pt-8 px-6 md:px-8 max-w-5xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Управление программами</h1>
            <p className="text-xs text-[var(--muted)]">Создавайте и редактируйте образовательные, карьерные и иммиграционные программы.</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} /> Добавить программу
          </button>
        </div>

        {/* Search */}
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

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background-subtle)] sticky top-0 text-[var(--muted)] font-semibold">
                    <th className="p-4">Название</th>
                    <th className="p-4">Страна</th>
                    <th className="p-4">Категория</th>
                    <th className="p-4 text-center">Статус</th>
                    <th className="p-4 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/60">
                  {programs.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--border)]/5 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold max-w-[180px] md:max-w-xs truncate">{item.title}</div>
                        <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">{item.slug}</div>
                      </td>
                      <td className="p-4">
                        {item.country_slug ? (
                          <CountryFlag slug={item.country_slug} showName size="sm" />
                        ) : (
                          <span className="text-[var(--muted)] text-[11px]">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] font-semibold text-[var(--muted)]">
                          {CATEGORY_OPTIONS.find((c) => c.value === item.category?.toLowerCase())?.label || item.category}
                        </span>
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
                              <><CheckCircle size={10} /> Опубликовано</>
                            ) : (
                              <><XCircle size={10} /> Черновик</>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {item.official_url && (
                            <a
                              href={item.official_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:border-red-500/30 hover:bg-red-500/5 transition-colors text-red-500/80 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {programs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-xs text-[var(--muted)]">
                        Программы не найдены.
                      </td>
                    </tr>
                  )}
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
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Panel — full height, slides from right, панель сама скролится */}
          <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-[var(--background)] border-l border-[var(--border)] shadow-2xl overflow-y-auto animate-slide-left">

            {/* Header — sticky, всегда виден */}
            <div className="sticky top-0 z-10 px-6 py-4 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">
                  {editId ? "Редактировать программу" : "Создать программу"}
                </h2>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Заполните поля и нажмите «Сохранить».</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--border)] transition-colors text-[var(--muted)]"
              >
                <X size={15} />
              </button>
            </div>

            {/* Содержимое — без overflow */}
            <div className="">
              <form onSubmit={handleSave} id="prog-form">
                <div className="px-6 py-5 space-y-5">

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium whitespace-pre-wrap">
                      {errorMsg}
                    </div>
                  )}

                  {/* Название */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Название *</label>
                    <input type="text" required value={title} onChange={handleTitleChange}
                      placeholder="Например: Аусбильдунг — Mechatroniker" className={inputCls} />
                  </div>

                  {/* Slug + Страна */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Slug *</label>
                      <input type="text" required value={slug}
                        onChange={(e) => setSlug(transliterate(e.target.value))}
                        placeholder="ausbildung-mechatroniker" className={`${inputCls} font-mono`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Страна</label>
                      <select value={countrySlug} onChange={(e) => setCountrySlug(e.target.value)} className={inputCls}>
                        <option value="">— Выберите —</option>
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Категория + Дедлайн */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Категория *</label>
                      <select required value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Дедлайн</label>
                      <input type="text" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                        placeholder="31 March 2026" className={inputCls} />
                    </div>
                  </div>

                  {/* Краткое описание */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      Краткое описание * <span className="normal-case font-normal opacity-60">(макс. 500 символов)</span>
                    </label>
                    <textarea required rows={3} maxLength={500} value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Краткое описание для карточки программы..." className={inputCls} />
                  </div>

                  {/* Полное описание */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Полное описание</label>
                    <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Подробное описание программы..." className={inputCls} />
                  </div>

                  {/* Сайт + Обложка */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Официальный сайт</label>
                      <input type="text" value={officialUrl} onChange={(e) => setOfficialUrl(e.target.value)}
                        placeholder="https://..." className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Фото (URL)</label>
                      <input type="text" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..." className={inputCls} />
                    </div>
                  </div>

                  {/* Cover preview */}
                  {coverUrl && (
                    <div className="w-full h-28 rounded-xl overflow-hidden border border-[var(--border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Публикация */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                    <div>
                      <p className="text-xs font-bold">Опубликовать</p>
                      <p className="text-[10px] text-[var(--muted)] mt-0.5">Программа будет видна всем.</p>
                    </div>
                    <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 accent-[var(--accent)]" />
                  </div>

                </div>
              </form>
            </div>

            {/* Footer — fixed at bottom, always visible */}
            <div className="sticky bottom-0 z-10 px-6 py-4 border-t border-[var(--border)] bg-[var(--background)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--card)] transition-all"
              >
                Отмена
              </button>
              <button
                type="submit"
                form="prog-form"
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
              >
                {saving ? "Сохранение..." : editId ? "Обновить" : "Создать программу"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
