"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Static help content                                                */
/* ------------------------------------------------------------------ */

type Faq = { q: string; a: string; cat: string };

const CATEGORIES = [
  { id: "all", label: "All", icon: "fi fi-rr-apps" },
  { id: "getting-started", label: "Getting Started", icon: "fi fi-rr-rocket-lunch" },
  { id: "account", label: "Account & Login", icon: "fi fi-rr-lock" },
  { id: "learning", label: "AI Learning Tools", icon: "fi fi-rr-graduation-cap" },
  { id: "technical", label: "Technical Issues", icon: "fi fi-rr-bug" },
  { id: "privacy", label: "Data & Privacy", icon: "fi fi-rr-shield-check" },
];

const FAQS: Faq[] = [
  {
    cat: "getting-started",
    q: "How do I log in to my portal for the first time?",
    a: "Use the credentials issued by your school or department. Students and parents log in with the EMIS number and the default password shared by the class teacher, and are prompted to set a new password on first sign-in. Teachers and officers use their official email and department-issued password.",
  },
  {
    cat: "getting-started",
    q: "Which portal is right for my role?",
    a: "Each role has its own dashboard: Student, Parent, Teacher, Headmaster, Block Education Officer, District Education Officer, Commissioner and Minister. After signing in you are taken to the portal matching your account role automatically. If you see the wrong dashboard, sign out and sign back in, then contact support.",
  },
  {
    cat: "getting-started",
    q: "Can I switch the interface language to Tamil?",
    a: "Yes. Use the language toggle in the top bar to switch between English and தமிழ். Your choice is remembered on this device for future visits.",
  },
  {
    cat: "account",
    q: "I forgot my password. How do I reset it?",
    a: "On the login screen choose 'Forgot password' to receive a reset link on your registered email or mobile. Students and parents can also ask their class teacher or headmaster to trigger a password reset from the school portal.",
  },
  {
    cat: "account",
    q: "My EMIS number is not recognised at login.",
    a: "This usually means the student record has not yet been mapped in the school registry. Ask your class teacher or headmaster to confirm the EMIS entry is active for the current academic year, then try again after a few minutes.",
  },
  {
    cat: "account",
    q: "How do I update my profile details?",
    a: "Open the profile menu in the top-right corner and choose your profile page. Personal contact details can be edited there; official fields such as class, school and EMIS mapping are managed by your school or department and require a request to the headmaster office.",
  },
  {
    cat: "learning",
    q: "How does the AI Tutor work?",
    a: "The AI Tutor answers subject questions, explains concepts step by step and generates practice questions aligned to the Class 6–12 syllabus. Open it from the Learning Hub in your student portal, pick a subject, and ask in English or Tamil.",
  },
  {
    cat: "learning",
    q: "How do I access the Digital Library and lab resources?",
    a: "The Digital Library, Science Lab Support and 3D model viewers are available from the Academics / Learning Hub section of your portal. Content is grouped by class and subject. If a resource does not load, check your connection and refresh the page.",
  },
  {
    cat: "learning",
    q: "Are AI-generated lessons and infographics reviewed?",
    a: "Centrally published lessons, infographics and lab content are curated by the state content team before release. Teachers can also generate draft material in the AI Content Studio, which is clearly marked as a draft until approved and published.",
  },
  {
    cat: "technical",
    q: "The page is slow or a section won't load. What should I do?",
    a: "First refresh the page. If the problem continues, clear your browser cache, make sure you are on a supported browser (latest Chrome, Edge or Safari), and check your internet connection. If it still fails, note the page name and time and raise a request below.",
  },
  {
    cat: "technical",
    q: "Which browsers and devices are supported?",
    a: "The platform works on the latest versions of Chrome, Edge, Firefox and Safari, on desktop, laptop and tablet. A stable internet connection is recommended for AI tools, video and 3D content.",
  },
  {
    cat: "technical",
    q: "I'm not receiving notifications.",
    a: "Notifications appear in the bell icon in the top bar. If they seem missing, confirm you are logged in to the correct account and that your registered email and mobile number are up to date in your profile.",
  },
  {
    cat: "privacy",
    q: "Who can see my child's academic data?",
    a: "Student data is visible only to the student, their linked parents, their assigned teachers and their headmaster, plus the education officers responsible for that school within the official hierarchy. Access follows the role you are signed in with.",
  },
  {
    cat: "privacy",
    q: "How is my data kept secure?",
    a: "Access is protected by individual accounts and role-based permissions, and sessions are secured with authentication tokens. Sensitive credentials are never shown in plain form. Report any suspicious account activity to support immediately.",
  },
];

const GUIDES = [
  {
    icon: "fi fi-rr-sign-in-alt",
    title: "First-time sign in",
    desc: "Log in with your EMIS number or official email and set a secure password.",
  },
  {
    icon: "fi fi-rr-graduation-cap",
    title: "Using the AI Tutor",
    desc: "Ask syllabus questions in English or Tamil and generate practice sets.",
  },
  {
    icon: "fi fi-rr-books",
    title: "Digital Library & Labs",
    desc: "Browse class-wise resources, science lab support and 3D models.",
  },
  {
    icon: "fi fi-rr-user-gear",
    title: "Manage your profile",
    desc: "Update contact details and keep your notifications working.",
  },
];

const CONTACTS = [
  {
    icon: "fi fi-rr-phone-call",
    label: "State Helpline",
    value: "1800-425-1010",
    hint: "Toll-free, Mon–Sat",
    href: "tel:18004251010",
  },
  {
    icon: "fi fi-rr-envelope",
    label: "Email Support",
    value: "support@tnschools.gov.in",
    hint: "Response within 1 working day",
    href: "mailto:support@tnschools.gov.in",
  },
  {
    icon: "fi fi-rr-marker",
    label: "Directorate Office",
    value: "DPI Campus, College Road, Chennai – 600 006",
    hint: "Tamil Nadu School Education Dept.",
    href: null,
  },
  {
    icon: "fi fi-rr-clock",
    label: "Support Hours",
    value: "9:30 AM – 5:30 PM IST",
    hint: "Monday to Saturday",
    href: null,
  },
];

const REQUEST_CATEGORIES = [
  "Login or account access",
  "AI learning tools",
  "Digital library / labs",
  "Attendance or marks",
  "Technical / performance issue",
  "Data & privacy",
  "Other",
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SupportPage() {
  const { data: session } = useSession();
  const user = (session?.user as any) || {};

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: REQUEST_CATEGORIES[0],
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketRef, setTicketRef] = useState("");
  const [error, setError] = useState("");

  const roleLabel = useMemo(() => {
    const r = String(user.role || "").toUpperCase();
    const map: Record<string, string> = {
      STUDENT: "Student",
      PARENT: "Parent",
      TEACHER: "Teacher",
      PET: "Physical Education Teacher",
      HEADMASTER: "Headmaster",
      BEO: "Block Education Officer",
      DEO: "District Education Officer",
      COMMISSIONER: "Commissioner",
      MINISTER: "Minister",
      SUPERADMIN: "Super Admin",
    };
    return map[r] || "User";
  }, [user.role]);

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const matchCat = activeCat === "all" || f.cat === activeCat;
      const matchQuery =
        !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [query, activeCat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.message.trim()) {
      setError("Please enter your name and describe your issue.");
      return;
    }
    if (
      form.email &&
      form.email.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      setError("Please enter a valid email address, or leave it blank.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/api/support", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          contact: form.email.trim(),
          category: form.category,
          message: form.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setError(
          data?.error || "Could not submit your request. Please try again."
        );
        return;
      }
      setTicketRef(data?.data?.ticketRef || "");
      setSubmitted(true);
    } catch {
      setError(
        "Network error — please check your connection and try again, or call the helpline."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";

  return (
    <PortalLayout title="Help & Support" subtitle="Guides, answers and a direct line to the support team">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        {/* Hero + search */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 p-8 md:p-10 text-white shadow-btn-primary">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/5" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <i className="fi fi-rr-life-ring" /> Help Center
            </span>
            <h1 className="mt-4 text-2xl md:text-3xl font-black leading-tight">
              How can we help you today?
            </h1>
            <p className="mt-2 max-w-xl text-sm md:text-base text-white/85">
              Search common questions, follow a quick-start guide, or send the
              support team a request. We're here Monday to Saturday.
            </p>
            <div className="relative mt-6 max-w-xl">
              <i className="fi fi-rr-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles, e.g. reset password, AI Tutor…"
                className="w-full rounded-2xl border-0 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 shadow-lg outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white/60"
                aria-label="Search help articles"
              />
            </div>
          </div>
        </section>

        {/* Quick-start guides */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-[var(--text-heading)]">
            Quick-start guides
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GUIDES.map((g) => (
              <div
                key={g.title}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-theme-card transition hover:-translate-y-0.5 hover:border-[var(--primary)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] text-lg transition group-hover:bg-[var(--primary)] group-hover:text-white">
                  <i className={g.icon} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-[var(--text-heading)]">
                  {g.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                  {g.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-[var(--text-heading)]">
              Frequently asked questions
            </h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition " +
                    (activeCat === c.id
                      ? "bg-[var(--primary)] text-white shadow-btn-primary"
                      : "border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] hover:border-[var(--primary)]")
                  }
                >
                  <i className={c.icon} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
                <i className="fi fi-rr-search text-2xl text-[var(--text-muted)]" />
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  No results for “{query}”. Try a different term or send us a
                  request below.
                </p>
              </div>
            )}
            {filteredFaqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={f.q}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-theme-card"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-[var(--text-heading)]">
                      {f.q}
                    </span>
                    <i
                      className={
                        "fi fi-rr-angle-small-down shrink-0 text-[var(--text-muted)] transition-transform " +
                        (isOpen ? "rotate-180" : "")
                      }
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-[var(--text-main)]">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact + request form */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Contact details */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-heading)]">
              Contact the team
            </h2>
            <div className="space-y-3">
              {CONTACTS.map((c) => {
                const inner = (
                  <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-theme-card transition hover:border-[var(--primary)]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <i className={c.icon} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        {c.label}
                      </div>
                      <div className="text-sm font-bold text-[var(--text-heading)] break-words">
                        {c.value}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {c.hint}
                      </div>
                    </div>
                  </div>
                );
                return c.href ? (
                  <a key={c.label} href={c.href} className="block">
                    {inner}
                  </a>
                ) : (
                  <div key={c.label}>{inner}</div>
                );
              })}
            </div>
          </div>

          {/* Request form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-7 shadow-theme-card">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/15 text-[var(--success)] text-2xl">
                    <i className="fi fi-rr-check" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[var(--text-heading)]">
                    Request received
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
                    Thanks, {form.name.split(" ")[0] || "there"}. Our support
                    team will reach out
                    {form.email ? ` at ${form.email}` : ""} within one working
                    day. Your reference category is “{form.category}”.
                  </p>
                  {ticketRef && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-4 py-2">
                      <i className="fi fi-rr-ticket text-[var(--primary)]" />
                      <span className="text-xs text-[var(--text-muted)]">
                        Ticket reference
                      </span>
                      <span className="text-sm font-bold text-[var(--text-heading)]">
                        {ticketRef}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setTicketRef("");
                      setError("");
                      setForm({
                        name: "",
                        email: "",
                        category: REQUEST_CATEGORIES[0],
                        message: "",
                      });
                    }}
                    className="mt-6 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] transition hover:border-[var(--primary)]"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-[var(--text-heading)]">
                    Send a support request
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <i className="fi fi-rr-user text-[var(--primary)]" />
                    Signed in as {roleLabel}
                    {user.name ? ` · ${user.name}` : ""}
                  </p>

                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-heading)]">
                          Your name <span className="text-[var(--danger)]">*</span>
                        </label>
                        <input
                          className={inputCls}
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-heading)]">
                          Email or mobile
                        </label>
                        <input
                          className={inputCls}
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          placeholder="How we should reach you"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[var(--text-heading)]">
                        Category
                      </label>
                      <select
                        className={inputCls}
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                      >
                        {REQUEST_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[var(--text-heading)]">
                        How can we help?{" "}
                        <span className="text-[var(--danger)]">*</span>
                      </label>
                      <textarea
                        rows={5}
                        className={inputCls + " resize-none"}
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        placeholder="Describe your issue or question. Include the page name and what you expected to happen."
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-xl bg-[var(--danger)]/10 px-4 py-2.5 text-xs font-medium text-[var(--danger)]">
                        <i className="fi fi-rr-exclamation" />
                        {error}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white shadow-btn-primary transition hover:shadow-btn-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <i
                          className={
                            submitting
                              ? "fi fi-rr-spinner animate-spin"
                              : "fi fi-rr-paper-plane"
                          }
                        />
                        {submitting ? "Submitting…" : "Submit request"}
                      </button>
                      <span className="text-xs text-[var(--text-muted)]">
                        Or call{" "}
                        <a
                          href="tel:18004251010"
                          className="font-semibold text-[var(--primary)]"
                        >
                          1800-425-1010
                        </a>
                      </span>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-4 text-center sm:flex-row sm:text-left shadow-theme-card">
          <p className="text-xs text-[var(--text-muted)]">
            Looking for something else? Head back to your dashboard to continue
            where you left off.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text-main)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <i className="fi fi-rr-home" />
            Back to home
          </Link>
        </div>
      </div>
    </PortalLayout>
  );
}
