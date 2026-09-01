"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

// Role → portal path
const roleToPath: Record<string, string> = {
  TEACHER: "/teacher/classes",
  PET: "/pet",
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Left Column - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-900 overflow-hidden flex-col justify-between border-r border-emerald-950/50 shadow-[4px_0_24px_rgba(0,0,0,0.1)] z-10 hero-band">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url('/bg-school.png')` }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/60 to-emerald-900/40" />
        
        {/* Top Branding */}
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-4">
            <span className="text-5xl drop-shadow-lg text-white"><i className="fi fi-rr-bank"></i></span>
            <div>
              <h2 className="text-2xl font-black text-white leading-tight tracking-tight drop-shadow-md">Tamil Nadu Schools</h2>
              <p className="!text-amber-400 text-sm font-bold tracking-widest uppercase mt-1 drop-shadow-md">Government of Tamil Nadu</p>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="relative z-10 p-12 pb-16">
          <div className="w-12 h-1.5 bg-amber-400 mb-6 rounded-full" />
          <h1 className="text-4xl font-black text-white leading-tight mb-4 drop-shadow-lg">
            AI Smart Learning <br /> Ecosystem
          </h1>
          <p className="!text-emerald-100 text-base max-w-md font-medium leading-relaxed drop-shadow-md">
            A unified portal connecting students, parents, teachers, and administrators for a transparent and efficient educational experience across the state.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen p-6 sm:p-12 bg-emerald-950 lg:bg-white dark:bg-slate-950 relative overflow-hidden">
        {/* Mobile Background Image (hidden on lg) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay lg:hidden"
          style={{ backgroundImage: `url('/bg-school.png')` }}
        />
        {/* Mobile Gradient Overlay (hidden on lg) */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/80 to-emerald-900/60 lg:hidden" style={{ zIndex: 0 }} />

        {/* Top Header Row */}
        <div className="w-full lg:w-auto flex items-center justify-between gap-4 mb-8 lg:absolute lg:top-8 lg:left-8 lg:right-8 lg:mb-0 px-2 sm:px-0 relative z-10">
          {/* Mobile Branding (Only visible on small screens) */}
          <div className="lg:hidden flex items-center gap-2">
            <span className="text-2xl text-amber-400 lg:text-slate-800 dark:lg:text-white"><i className="fi fi-rr-bank"></i></span>
            <div>
              <h2 className="text-sm font-black text-white lg:text-slate-800 dark:lg:text-white leading-tight">TN Schools</h2>
              <p className="text-[9px] text-amber-300 lg:text-emerald-600 dark:lg:text-emerald-400 font-bold uppercase tracking-wider">Government of Tamil Nadu</p>
            </div>
          </div>

          {/* Back to Webportal */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-100 hover:text-white lg:text-slate-500 lg:hover:text-emerald-600 dark:lg:text-slate-400 dark:lg:hover:text-emerald-400 transition-colors ml-auto z-10"
          >
            <i className="fi fi-rr-arrow-left"></i> Back to Webportal
          </Link>
        </div>

        {/* Center Container for Form */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl lg:shadow-none lg:bg-transparent lg:dark:bg-transparent">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Please sign in to access your portal dashboard.
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl sm:p-1.5 sm:rounded-2xl border border-slate-200/50 dark:border-slate-800 mb-8">
            <button
              type="button"
              onClick={() => { setLoginType("student"); setError(null); }}
              className={`flex-1 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 ${loginType === "student"
                ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
            >
              <i className="fi fi-rr-graduation-cap"></i> Student Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginType("staff"); setError(null); }}
              className={`flex-1 py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 ${loginType === "staff"
                ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
            >
              <i className="fi fi-rr-briefcase"></i> Parents & Staffs
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-xl flex items-start gap-2 mb-6">
              <span className="mt-0.5"><i className="fi fi-rr-triangle-warning"></i></span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {loginType === "staff" ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="staff-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 pr-12 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Registered Phone Number
                  </label>
                  <input
                    id="student-phone"
                    type="tel"
                    required
                    autoComplete="off"
                    placeholder="e.g. 98xxxxxx56"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </>
            )}

            <button
              id="sign-in-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span><i className="fi fi-rr-lock"></i></span>
                  <span>Sign In to Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-[10px] text-slate-500 dark:text-slate-500 mt-6 font-medium">
            {loginType === "staff"
              ? "Use your registered email and password."
              : "Use your roll number and registered phone number."}
            <br />
            <span className="opacity-70 mt-1 block">TN Smart Education Portal v2.0</span>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
