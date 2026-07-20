"use client";
import { CheckCircle, Building2, Settings, Star, Pencil, X } from "lucide-react";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  schoolId: string;
  schoolName: string;
  emisId: string;
  subject: string;
  subjects: string[];
  qualification: string;
  joiningDate: string;
  address?: string;
  gender?: string;
  dob?: string;
}

export default function TeacherProfilePage() {
  const { lang } = usePortalLanguage();
  const { data: session, update: updateSession } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const userId = (session?.user as any)?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [qualification, setQualification] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  const fetchProfile = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/profile/${userId}`);
      const result = await res.json();
      if (result.success && result.data) {
        const data: ProfileData = result.data;
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        setSubjectInput(data.subject);
        setQualification(data.qualification);
        setJoiningDate(data.joiningDate);
        setAddress(data.address || "");
        setGender(data.gender || "");
        setDob(data.dob || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      Swal.fire({
        icon: "error",
        title: "Load Failed",
        text: "Could not fetch your profile details from the database.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/teacher/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subjects: subjectInput.split(",").map((s) => s.trim()),
          qualification,
          joiningDate,
          address,
          gender,
          dob,
        }),
      });

      const result = await res.json();
      if (result.success) {
        if (session && session.user && name !== session.user.name) {
          await updateSession({
            ...session,
            user: {
              ...session.user,
              name,
            },
          });
        }

        Swal.fire({
          icon: "success",
          title: lang === "தமிழ்" ? "விவரப்படிவு புதுப்பிக்கப்பட்டது!" : "Profile Updated!",
          text: lang === "தமிழ்" ? "உங்கள் விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன." : "Your profile details have been saved successfully.",
          timer: 2000,
          showConfirmButton: false,
        });

        setIsEditing(false);
        fetchProfile();
      } else {
        Swal.fire({
          icon: "error",
          title: lang === "தமிழ்" ? "சேமிப்பு தோல்வி" : "Save Failed",
          text: result.error || "Could not save profile details.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred while saving.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (n: string) => {
    if (!n) return "T";
    return n
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <PortalLayout title={lang === "தமிழ்" ? "என் விவரப்படிவு" : "My Profile"} subtitle={lang === "தமிழ்" ? "உங்கள் தனிப்பட்ட கல்வி தகுதிகள் காணுங்கள் மற்றும் திருத்துங்கள்." : "View and edit your personal educational credentials."}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        {/* Left Card: Profile overview */}
        <div className="theme-card p-6 border border-[var(--border)] flex flex-col items-center text-center relative overflow-hidden">
          {loading ? (
            <div className="py-20 text-xs text-[var(--text-muted)]">{lang === "தமிழ்" ? "சான்றிதழ்கள் ஏற்றுகிறது..." : "Loading credentials..."}</div>
          ) : profile ? (
            <>
              {/* Header background card decoration */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-amber-500/20 to-orange-500/20 dark:from-amber-500/5 dark:to-orange-500/5 z-0" />

              <div
                className="w-24 h-24 rounded-full text-white text-3xl font-black flex items-center justify-center shadow-md border-4 border-[var(--bg-card)] relative z-10 mt-6 mb-4"
                style={{ background: "linear-gradient(135deg, var(--primary) 0%, #d97706 100%)" }}
              >
                {getInitials(profile.name)}
              </div>

              <div className="relative z-10 w-full">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <h2 className="text-lg font-bold text-[var(--text-heading)]">{profile.name}</h2>
                  <span className="text-xs" title="EMIS Verified Staff"><CheckCircle className="w-4 h-4 inline mr-1 text-emerald-500" /></span>
                </div>

                <p className="text-xs font-semibold text-[var(--primary)] px-2.5 py-0.5 bg-[var(--primary)]/10 rounded-full inline-block mb-4 border border-[var(--primary)]/20">
                  {profile.role}
                </p>

                <p className="text-xs text-[var(--text-muted)] font-medium mb-1 flex items-center justify-center gap-1.5">
                  <span><Building2 className="w-4 h-4 inline-block mr-1 text-inherit" /></span> {profile.schoolName}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] font-semibold truncate mb-6">
                  {profile.email}
                </p>

                <hr className="border-[var(--border)] mb-5" />

                {/* Meta details list */}
                <div className="w-full text-left space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] font-medium">{lang === "தமிழ்" ? "EMIS ஊழியர் ID" : "EMIS Staff ID"}</span>
                    <span className="font-bold text-[var(--text-heading)] select-all">{profile.emisId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] font-medium">{lang === "தமிழ்" ? "கற்பிக்கும் பாடங்கள்" : "Subjects Taught"}</span>
                    <span className="font-bold text-[var(--text-heading)] max-w-[150px] truncate" title={profile.subject}>
                      {profile.subject}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] font-medium">{lang === "தமிழ்" ? "தகுதி" : "Qualification"}</span>
                    <span className="font-bold text-[var(--text-heading)]">{profile.qualification}</span>
                  </div>
                  {profile.joiningDate && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)] font-medium">{lang === "தமிழ்" ? "சேர்ந்த தேதி" : "Joining Date"}</span>
                      <span className="font-bold text-[var(--text-heading)]">{profile.joiningDate}</span>
                    </div>
                  )}
                  {profile.gender && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)] font-medium">{lang === "தமிழ்" ? "பாலினம்" : "Gender"}</span>
                      <span className="font-bold text-[var(--text-heading)]">{profile.gender}</span>
                    </div>
                  )}
                  {profile.dob && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)] font-medium">{lang === "தமிழ்" ? "பிறந்த தேதி" : "Date of Birth"}</span>
                      <span className="font-bold text-[var(--text-heading)]">{profile.dob}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)] font-medium">{lang === "தமிழ்" ? "முகவரி" : "Residential Address"}</span>
                      <span className="font-bold text-[var(--text-heading)] max-w-[150px] truncate" title={profile.address}>
                        {profile.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-xs text-red-400 italic">{lang === "தமிழ்" ? "விவரப்படிவு ஏற்றல் தோல்வி." : "Failed to load profile."}</div>
          )}
        </div>

        {/* Right Columns: Edit form */}
        <div className="xl:col-span-2 theme-card p-6 border border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4"><Settings className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "விவரப்படிவு விவரங்கள்" : "Profile Details"}</h2>

          {loading ? (
            <div className="py-32 text-center text-xs text-[var(--text-muted)]">
              {lang === "தமிழ்" ? "தகவல்கள் ஏற்றுகிறது..." : "Loading fields..."}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "முழு பெயர்" : "Full Name"}</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Star Bala"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "மின்னஞ்சல் முகவரி" : "Email Address"}</label>
                  <input
                    type="email"
                    required
                    disabled={!isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. teacher@emis.tn.gov.in"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "தொலைபேசி எண்" : "Phone Number"}</label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "கல்வித் தகுதி" : "Academic Qualification"}</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. M.Sc., B.Ed., M.Phil."
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "பாட நிபுணதை (கமாவால் பிரிக்கவும்)" : "Subject Specialties (comma separated)"}</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    placeholder="e.g. Science, Physics, Chemistry"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "சேர்ந்த தேதி" : "Joining Date"}</label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "பாலினம்" : "Gender"}</label>
                  <select
                    disabled={!isEditing}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="">{lang === "தமிழ்" ? "பாலினம் தேர்வு" : "Select Gender"}</option>
                    <option value="Male">{lang === "தமிழ்" ? "ஆண்" : "Male"}</option>
                    <option value="Female">{lang === "தமிழ்" ? "பெண்" : "Female"}</option>
                    <option value="Other">{lang === "தமிழ்" ? "பிற" : "Other"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "பிறந்த தேதி" : "Date of Birth"}</label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "வசிப்பிட முகவரி" : "Residential Address"}</label>
                <textarea
                  disabled={!isEditing}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your permanent/temporary address details"
                  rows={2}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-75 disabled:cursor-not-allowed resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "நியமிக்கப்பட்ட பள்ளி (படிக்க மட்டும்)" : "Assigned Registry School (Read-Only)"}</label>
                <input
                  type="text"
                  disabled
                  value={profile?.schoolName || "Tamil Nadu School Registry"}
                  className="w-full bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-muted)] cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-[var(--primary)] hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "விவரப்படிவு திருத்து" : "Edit Profile"}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        fetchProfile();
                      }}
                      className="px-6 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--sidebar-item-hover-bg)] font-bold rounded-xl text-xs transition-all"
                    >
                      <X className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "ரத்து" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-[var(--primary)] hover:bg-amber-600 disabled:bg-[var(--bg-card)] disabled:text-[var(--text-muted)] text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
                    >
                      {saving ? (lang === "தமிழ்" ? "சேமிக்கிறது..." : "Saving...") : (lang === "தமிழ்" ? " விவரங்களை சேமி" : " Save Profile Details")}
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>

      </div>
    </PortalLayout>
  );
}
