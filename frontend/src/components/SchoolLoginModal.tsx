"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X } from "lucide-react";

type LoginMode = "student" | "parent";

interface SchoolLoginModalProps {
  mode: LoginMode;
  schoolName?: string;
  accentColor?: string;
  onClose: () => void;
}

export default function SchoolLoginModal({
  mode,
  schoolName,
  accentColor = "#059669",
  onClose,
}: SchoolLoginModalProps) {
  const router = useRouter();

  // Student fields
  const [rollNumber, setRollNumber] = useState("");
  const [phone, setPhone] = useState("");

  // Parent fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isStudent = mode === "student";
  const title = isStudent ? "Student Login" : "Parent Login";
  const emoji = isStudent ? "🎓" : "👪";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isStudent) {
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
        setError("Student not found or incorrect phone number. Please try again.");
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
        router.push("/parent");
        router.refresh();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 space-y-5 relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-md"
            style={{ background: `${accentColor}1a`, border: `1px solid ${accentColor}33` }}
          >
            {emoji}
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
          {schoolName && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{schoolName}</p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl text-xs font-semibold bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isStudent ? (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 10A001"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
                  style={{ ["--tw-ring-color" as any]: accentColor }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Parent / Registered Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit phone number"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
                  style={{ ["--tw-ring-color" as any]: accentColor }}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
                  style={{ ["--tw-ring-color" as any]: accentColor }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 pr-10 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
                    style={{ ["--tw-ring-color" as any]: accentColor }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-60"
            style={{ background: accentColor }}
          >
            {loading ? "Signing in..." : `Sign In as ${isStudent ? "Student" : "Parent"}`}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400">
          Trouble signing in? Contact the school office.
        </p>
      </div>
    </div>
  );
}
