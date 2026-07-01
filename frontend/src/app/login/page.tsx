"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Role → portal path
const roleToPath: Record<string, string> = {
  TEACHER: "/teacher/classes",
  PARENT: "/parent",
  HEADMASTER: "/headmaster",
  BEO: "/block-education-officer",
  DEO: "/district-education-officer",
  COMMISSIONER: "/commissioner",
  MINISTER: "/minister",
  SUPERADMIN: "/super-admin",
  STUDENT: "/student",
};

export default function LoginPage() {
  const [loginType, setLoginType] = useState<"staff" | "student">("student");

  // Staff
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Student
  const [rollNumber, setRollNumber] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (loginType === "student") {
      if (!rollNumber.trim() || !phone.trim()) {
        setError("Please enter both Roll Number and Phone Number.");
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        loginType: "student",
        rollNumber: rollNumber.trim(),
        phone: phone.trim(),
        redirect: false,
      });

      if (res?.error || !res?.ok) {
        setError("Student not found or incorrect phone number. Please check and try again.");
        setLoading(false);
      } else {
        router.push("/student");
        router.refresh();
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError("Please enter both email and password.");
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        loginType: "staff",
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error || !res?.ok) {
        setError("Invalid email or password. Please check your credentials.");
        setLoading(false);
      } else {
        // Fetch user role from backend to redirect correctly
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const body = JSON.stringify({ loginType: "staff", email: email.trim(), password });
          const r = await fetch(`${apiUrl}/api/users/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
          const data = await r.json();
          const role = data?.data?.role as string;
          router.push(roleToPath[role] || "/student");
        } catch {
          router.push("/student");
        }
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl z-10 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-90">
            <span className="text-3xl">🏛️</span>
            <div className="text-left">
              <h2 className="text-sm font-black text-slate-800 dark:text-white leading-tight">TN Schools</h2>
              <p className="text-[10px] text-slate-500 font-medium">AI Smart Learning Ecosystem</p>
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Portal Authentication</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in with your registered credentials
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <button
            type="button"
            onClick={() => { setLoginType("student"); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${loginType === "student"
              ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
          >
            🎓 Student Login
          </button>
          <button
            type="button"
            onClick={() => { setLoginType("staff"); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${loginType === "staff"
              ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
          >
            💼 Parents &amp; Staffs
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {loginType === "staff" ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <input
                  id="staff-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="e.g. teacher@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <input
                  id="staff-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Student Roll Number
                </label>
                <input
                  id="student-roll"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. HM10103"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Registered Phone Number
                </label>
                <input
                  id="student-phone"
                  type="tel"
                  required
                  autoComplete="off"
                  placeholder="e.g. 9655258556"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </>
          )}

          <button
            id="sign-in-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>🔒</span>
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer hint */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600">
          {loginType === "staff"
            ? "Use your registered email and password from the system."
            : "Use your roll number and registered phone number."}
        </p>
      </div>
    </div>
  );
}
