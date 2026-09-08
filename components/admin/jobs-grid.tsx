"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MagnifyingGlass, PencilSimple, ArrowSquareOut, Star, MapPin, Phone, Info, Check } from "@phosphor-icons/react";
import type { AdminJob, AdminJobsData } from "@/lib/admin/data";
import { employmentLabels, workModeLabels, experienceLabels, educationLabels } from "@/lib/i18n/messages";
import { EMPLOYMENT_TYPES, WORK_MODES, EXPERIENCE_LEVELS, EDUCATION_LEVELS } from "@/lib/vacancies";
import { normalize } from "@/lib/search";
import { formatCompactSum, formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input, Textarea, Label } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { CheckboxField } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const PAGE = 48;

function salaryText(j: Pick<AdminJob, "salaryMin" | "salaryMax" | "salaryNegotiable">) {
  if (j.salaryNegotiable || (!j.salaryMin && !j.salaryMax)) return "Kelishilgan";
  if (j.salaryMin && j.salaryMax && j.salaryMin !== j.salaryMax) return `${formatCompactSum(j.salaryMin)} – ${formatCompactSum(j.salaryMax)}`;
  return formatCompactSum(j.salaryMax ?? j.salaryMin ?? 0);
}

/** Compact card for one listing. */
function JobCard({ job, sector, mahalla, onEdit, edited }: { job: AdminJob; sector: string; mahalla: string; onEdit: () => void; edited: boolean }) {
  return (
    <article className={cn("group relative flex flex-col rounded-12 border bg-white-0 p-3.5 transition-colors duration-150 hover:border-sub-300", edited ? "border-success-base" : "border-soft-200")}>
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-sand-base px-2 py-0.5 text-[0.6875rem] font-medium leading-4 text-strong-950">{sector}</span>
        <span className="flex items-center gap-1">
          {edited && (
            <span className="inline-flex items-center gap-0.5 text-[0.6875rem] text-success-base" title="Bu sahifada tahrirlangan">
              <Check size={12} aria-hidden="true" /> tahrirlangan
            </span>
          )}
          {job.isFeatured && (
            <span className="inline-flex size-5 items-center justify-center rounded-4 bg-oltin-100 text-oltin-800" title="Alohida vakansiya">
              <Star size={12} aria-hidden="true" />
            </span>
          )}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-2 text-label-sm font-semibold leading-5 text-strong-950">{job.titleUz}</h3>
      <p className="mt-0.5 line-clamp-1 text-label-xs text-sub-600">{job.organization}</p>
      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <div className="min-w-0 text-label-xs text-sub-600">
          <p className="inline-flex max-w-full items-center gap-1 truncate">
            <MapPin size={12} aria-hidden="true" className="shrink-0 text-soft-400" />
            <span className="truncate">{mahalla}</span>
          </p>
          <p className="tabular mt-0.5">{job.publishedAt}</p>
        </div>
        <p className={cn("font-display tabular shrink-0 text-right text-label-sm font-bold", job.salaryNegotiable ? "text-sub-600" : "text-strong-950")}>{salaryText(job)}</p>
      </div>
      <div className="mt-3 flex gap-1.5 border-t border-soft-200 pt-3">
        <button type="button" onClick={onEdit} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-6 bg-strong-950 text-label-xs font-medium text-white-0 hover:bg-surface-800 focus-ring">
          <PencilSimple size={14} aria-hidden="true" />
          Tahrirlash
        </button>
        <Link href={`/vakansiyalar/${job.slug}`} target="_blank" className="inline-flex h-8 items-center justify-center gap-1 rounded-6 border border-soft-200 px-2.5 text-label-xs font-medium text-strong-950 hover:bg-weak-50 focus-ring" aria-label={`${job.titleUz} — saytda ochish`}>
          Ochish <ArrowSquareOut size={12} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function JobsGrid({ data }: { data: AdminJobsData }) {
  const reduce = useReducedMotion();
  const [jobs, setJobs] = useState(data.jobs);
  const [edited, setEdited] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [mahalla, setMahalla] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [editing, setEditing] = useState<AdminJob | null>(null);
  const [draft, setDraft] = useState<AdminJob | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const sectorName = useMemo(() => Object.fromEntries(data.sectors.map((s) => [s.id, s.label])), [data.sectors]);
  const mahallaName = useMemo(() => Object.fromEntries(data.mahallas.map((m) => [m.id, m.label])), [data.mahallas]);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return jobs.filter((j) => {
      if (sector && j.sectorId !== sector) return false;
      if (mahalla && j.mahallaId !== mahalla) return false;
      if (featuredOnly && !j.isFeatured) return false;
      if (nq && !normalize(`${j.titleUz} ${j.titleRu} ${j.organization}`).includes(nq)) return false;
      return true;
    });
  }, [jobs, q, sector, mahalla, featuredOnly]);

  const visible = filtered.slice(0, limit);

  const openEdit = (job: AdminJob) => {
    setEditing(job);
    setDraft({ ...job });
  };
  const closeEdit = () => {
    setEditing(null);
    setDraft(null);
  };
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setJobs((list) => list.map((j) => (j.id === draft.id ? { ...draft, salaryNegotiable: draft.salaryNegotiable || (!draft.salaryMin && !draft.salaryMax) } : j)));
    setEdited((s) => new Set(s).add(draft.id));
    closeEdit();
    setToast("Oʻzgarishlar faqat shu sahifada koʻrinadi — saqlash hali ulanmagan.");
    window.setTimeout(() => setToast(null), 4000);
  };
  const set = <K extends keyof AdminJob>(key: K, value: AdminJob[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-title-h4 sm:text-title-h3">Vakansiyalar</h1>
          <p className="mt-1 text-paragraph-sm text-sub-600">
            <span className="tabular">{filtered.length}</span> / <span className="tabular">{jobs.length}</span> ta eʼlon. Tahrirlash shakli tayyor, saqlash hali ulanmagan.
          </p>
        </div>
        <p className="inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-warning-lighter px-3 text-label-xs font-medium text-warning-dark">
          <Info size={14} aria-hidden="true" />
          Demo rejim: oʻzgarishlar saqlanmaydi
        </p>
      </div>

      {/* toolbar */}
      <div className="mt-5 grid gap-2 rounded-12 border border-soft-200 bg-white-0 p-2 sm:grid-cols-[1fr_11rem_12rem_auto]">
        <Input
          size="medium"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="Lavozim yoki tashkilot"
          aria-label="Qidirish"
          leadingIcon={<MagnifyingGlass size={16} aria-hidden="true" />}
        />
        <NativeSelect size="medium" value={sector} onChange={(e) => { setSector(e.target.value); setLimit(PAGE); }} aria-label="Soha">
          <option value="">Barcha sohalar</option>
          {data.sectors.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </NativeSelect>
        <NativeSelect size="medium" value={mahalla} onChange={(e) => { setMahalla(e.target.value); setLimit(PAGE); }} aria-label="Mahalla">
          <option value="">Barcha mahallalar</option>
          {data.mahallas.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </NativeSelect>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-8 px-2 text-label-sm text-strong-950 hover:bg-weak-50">
          <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} className="size-4 accent-[#a02d22]" />
          Alohida
        </label>
      </div>

      {/* grid */}
      {visible.length === 0 ? (
        <p className="mt-10 text-center text-paragraph-md text-sub-600">Bu filtr boʻyicha eʼlon yoʻq.</p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((j, i) => (
            <motion.li
              key={j.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: Math.min(i, 12) * 0.02 }}
            >
              <JobCard job={j} sector={sectorName[j.sectorId] ?? j.sectorId} mahalla={j.mahallaId ? mahallaName[j.mahallaId] ?? j.mahallaId : "Mahalla koʻrsatilmagan"} onEdit={() => openEdit(j)} edited={edited.has(j.id)} />
            </motion.li>
          ))}
        </ul>
      )}
      {filtered.length > visible.length && (
        <div className="mt-6 text-center">
          <Button variant="neutral" mode="stroke" size="medium" onClick={() => setLimit((l) => l + PAGE)}>
            Yana koʻrsatish ({filtered.length - visible.length})
          </Button>
        </div>
      )}

      {/* edit sheet */}
      <Sheet open={!!editing} onOpenChange={(o) => !o && closeEdit()}>
        <SheetContent side="right" closeLabel="Yopish" className="sm:max-w-lg">
          {draft && (
            <form onSubmit={save} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>Vakansiyani tahrirlash</SheetTitle>
                <SheetDescription>
                  Oson Ish #{draft.sourceUrl.split("/").pop()} · {draft.organization}
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="e-title">Lavozim (oʻzbekcha)</Label>
                    <Input id="e-title" size="medium" value={draft.titleUz} onChange={(e) => set("titleUz", e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="e-title-ru">Lavozim (ruscha)</Label>
                    <Input id="e-title-ru" size="medium" value={draft.titleRu} onChange={(e) => set("titleRu", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="e-org">Tashkilot</Label>
                      <NativeSelect id="e-org" size="medium" value={draft.organizationId} onChange={(e) => set("organizationId", e.target.value)}>
                        {data.organizations.map((o) => (
                          <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                      </NativeSelect>
                    </div>
                    <div>
                      <Label htmlFor="e-mahalla">Mahalla</Label>
                      <NativeSelect id="e-mahalla" size="medium" value={draft.mahallaId ?? ""} onChange={(e) => set("mahallaId", e.target.value || null)}>
                        <option value="">Koʻrsatilmagan</option>
                        {data.mahallas.map((m) => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </NativeSelect>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="e-sector">Soha</Label>
                      <NativeSelect id="e-sector" size="medium" value={draft.sectorId} onChange={(e) => set("sectorId", e.target.value as AdminJob["sectorId"])}>
                        {data.sectors.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </NativeSelect>
                    </div>
                    <div>
                      <Label htmlFor="e-openings">Oʻrinlar soni</Label>
                      <Input id="e-openings" size="medium" type="number" min={1} value={draft.openings} onChange={(e) => set("openings", Math.max(1, Number(e.target.value) || 1))} />
                    </div>
                  </div>
                  <fieldset>
                    <legend className="text-label-sm font-medium text-strong-950">Maosh, soʻm</legend>
                    <div className="mt-1.5 grid grid-cols-2 gap-3">
                      <Input size="medium" type="number" inputMode="numeric" step={100000} min={0} placeholder="dan" aria-label="Maosh, dan" value={draft.salaryMin ?? ""} onChange={(e) => set("salaryMin", e.target.value ? Number(e.target.value) : null)} disabled={draft.salaryNegotiable} />
                      <Input size="medium" type="number" inputMode="numeric" step={100000} min={0} placeholder="gacha" aria-label="Maosh, gacha" value={draft.salaryMax ?? ""} onChange={(e) => set("salaryMax", e.target.value ? Number(e.target.value) : null)} disabled={draft.salaryNegotiable} />
                    </div>
                    <CheckboxField checked={draft.salaryNegotiable} onCheckedChange={(c) => set("salaryNegotiable", c === true)} label="Kelishilgan holda" />
                  </fieldset>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="e-emp">Bandlik turi</Label>
                      <NativeSelect id="e-emp" size="medium" value={draft.employmentType} onChange={(e) => set("employmentType", e.target.value as AdminJob["employmentType"])}>
                        {EMPLOYMENT_TYPES.map((k) => (
                          <option key={k} value={k}>{employmentLabels.uz[k]}</option>
                        ))}
                      </NativeSelect>
                    </div>
                    <div>
                      <Label htmlFor="e-mode">Ish rejimi</Label>
                      <NativeSelect id="e-mode" size="medium" value={draft.workMode} onChange={(e) => set("workMode", e.target.value as AdminJob["workMode"])}>
                        {WORK_MODES.map((k) => (
                          <option key={k} value={k}>{workModeLabels.uz[k]}</option>
                        ))}
                      </NativeSelect>
                    </div>
                    <div>
                      <Label htmlFor="e-exp">Tajriba</Label>
                      <NativeSelect id="e-exp" size="medium" value={draft.experience} onChange={(e) => set("experience", e.target.value as AdminJob["experience"])}>
                        {EXPERIENCE_LEVELS.map((k) => (
                          <option key={k} value={k}>{experienceLabels.uz[k]}</option>
                        ))}
                      </NativeSelect>
                    </div>
                    <div>
                      <Label htmlFor="e-edu">Maʼlumot</Label>
                      <NativeSelect id="e-edu" size="medium" value={draft.educationLevel} onChange={(e) => set("educationLevel", e.target.value as AdminJob["educationLevel"])}>
                        {EDUCATION_LEVELS.map((k) => (
                          <option key={k} value={k}>{educationLabels.uz[k]}</option>
                        ))}
                      </NativeSelect>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="e-phone">Telefon</Label>
                      <Input id="e-phone" size="medium" type="tel" value={draft.phone ?? ""} onChange={(e) => set("phone", e.target.value || null)} leadingIcon={<Phone size={16} aria-hidden="true" />} placeholder="+998" />
                    </div>
                    <div>
                      <Label htmlFor="e-tg">Telegram</Label>
                      <Input id="e-tg" size="medium" value={draft.telegram ?? ""} onChange={(e) => set("telegram", e.target.value || null)} placeholder="https://t.me/…" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="e-contact">Masʼul shaxs</Label>
                    <Input id="e-contact" size="medium" value={draft.contactPerson ?? ""} onChange={(e) => set("contactPerson", e.target.value || null)} />
                  </div>
                  <div>
                    <Label htmlFor="e-desc" hint="Ish beruvchi matni">Tavsif</Label>
                    <Textarea id="e-desc" rows={5} value={draft.description} onChange={(e) => set("description", e.target.value)} autoResize maxRows={12} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="e-date">Eʼlon sanasi</Label>
                      <Input id="e-date" size="medium" type="date" value={draft.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} />
                    </div>
                    <div className="flex items-end">
                      <CheckboxField checked={draft.isFeatured} onCheckedChange={(c) => set("isFeatured", c === true)} label="Alohida vakansiya" />
                    </div>
                  </div>
                  {draft.phone && <p className="text-label-xs text-soft-400">Saytda koʻrinishi: {formatPhone(draft.phone)}</p>}
                </div>
              </SheetBody>
              <SheetFooter className="flex gap-2">
                <Button type="button" variant="neutral" mode="stroke" size="medium" onClick={closeEdit} className="flex-1">
                  Bekor qilish
                </Button>
                <Button type="submit" variant="primary" size="medium" className="flex-[2]">
                  Saqlash
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.p
            role="status"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-10 bg-strong-950 px-4 py-2.5 text-label-sm text-white-0 shadow-regular-md"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
