"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

interface Scheme {
  title: string;
  titleTa: string;
  icon: string;
  description: string;
  descriptionTa: string;
  status: string;
  statusTa: string;
  eligibility: string;
  eligibilityTa: string;
  link?: string;
  linkLabel?: string;
  linkLabelTa?: string;
}

function generateSchemes(grade: number, gender: string, schoolType: string): Scheme[] {
  const schemes: Scheme[] = [];

  if (grade <= 8 && schoolType === "Government") {
    schemes.push({ 
      title: "Free Noon Meal Scheme", titleTa: "சத்துணவு திட்டம்",
      icon: "fi fi-sr-restaurant", 
      description: "Nutritious hot meals provided daily at school to keep you energized.", descriptionTa: "பள்ளி மாணவர்களுக்கு சத்தான சூடான உணவு வழங்கப்படுகிறது.", 
      status: "Active", statusTa: "செயலில்",
      eligibility: "Government Schools (Grades 1-8)", eligibilityTa: "அரசுப் பள்ளிகள் (வகுப்பு 1-8)" 
    });
    schemes.push({ 
      title: "Free Uniforms & Footwear", titleTa: "இலவச சீருடை மற்றும் காலணிகள்",
      icon: "fi fi-sr-tshirt", 
      description: "Sets of school uniforms and comfortable shoes provided annually.", descriptionTa: "பள்ளி சீருடைகள் மற்றும் காலணிகள் வழங்கப்படுகின்றன.", 
      status: "Received", statusTa: "பெறப்பட்டது",
      eligibility: "Government School Students (Grades 1-8)", eligibilityTa: "அரசுப் பள்ளி மாணவர்கள் (வகுப்பு 1-8)" 
    });
  }

  if (schoolType !== "Private") {
    schemes.push({ 
      title: "Free Textbooks & Notebooks", titleTa: "இலவச பாடப்புத்தகங்கள் மற்றும் நோட்டுப் புத்தகங்கள்",
      icon: "fi fi-sr-book-alt", 
      description: "Complete sets of textbooks and notebooks for the academic year.", descriptionTa: "கல்வியாண்டிற்கான முழுமையான பாடப்புத்தகங்கள் மற்றும் நோட்டுப் புத்தகங்கள்.", 
      status: "Received", statusTa: "பெறப்பட்டது",
      eligibility: "Government & Aided School Students", eligibilityTa: "அரசு மற்றும் உதவிபெறும் பள்ளி மாணவர்கள்" 
    });
  }

  schemes.push({ 
    title: "Free Bus Pass Scheme", titleTa: "இலவச பேருந்துப் பயண அட்டை",
    icon: "fi fi-sr-bus-alt", 
    description: "Travel freely between your home and school on state transport buses.", descriptionTa: "வீட்டிற்கும் பள்ளிக்கும் அரசுப் பேருந்துகளில் இலவசமாகப் பயணிக்கலாம்.", 
    status: "Active", statusTa: "செயலில்",
    eligibility: "All School Students", eligibilityTa: "அனைத்து பள்ளி மாணவர்கள்", 
    link: "https://www.tnstc.in", linkLabel: "Bus Pass Info", linkLabelTa: "பேருந்து பயண தகவல்" 
  });

  if (grade === 11 && schoolType === "Government") {
    schemes.push({ 
      title: "Free Bicycles Scheme", titleTa: "இலவச மிதிவண்டி திட்டம்",
      icon: "fi fi-sr-rocket", 
      description: "Provided to class 11 students to help commute easily.", descriptionTa: "பள்ளிக்கு எளிதாக பயணிக்க 11ஆம் வகுப்பு மாணவர்களுக்கு வழங்கப்படுகிறது.", 
      status: "Received", statusTa: "பெறப்பட்டது",
      eligibility: "Government School Students in Grade 11", eligibilityTa: "11ஆம் வகுப்பு அரசுப் பள்ளி மாணவர்கள்" 
    });
  }

  if (grade === 12 && schoolType !== "Private") {
    schemes.push({ 
      title: "Free Laptops Scheme", titleTa: "இலவச மடிக்கணினி திட்டம்",
      icon: "fi fi-sr-computer", 
      description: "Provided to Class 12 students to bridge the digital divide and support lab projects.", descriptionTa: "மடிக்கணினி மூலம் டிஜிட்டல் கற்றலை ஊக்குவிக்க வழங்கப்படுகிறது.", 
      status: "Active", statusTa: "செயலில்",
      eligibility: "Government & Aided School Students in Grade 12", eligibilityTa: "12ஆம் வகுப்பு அரசு மற்றும் உதவிபெறும் பள்ளி மாணவர்கள்" 
    });
  }

  if (grade >= 9) {
    schemes.push({ 
      title: "Naan Mudhalvan Skill Training", titleTa: "நான் முதல்வன் திறன் பயிற்சி",
      icon: "fi fi-sr-bullseye", 
      description: "Skill development and career guidance platform to build modern soft skills.", descriptionTa: "திறன் மேம்பாடு மற்றும் தொழில் வழிகாட்டுதல் திட்டம்.", 
      status: "Active", statusTa: "செயலில்",
      eligibility: "High School & HSC Students", eligibilityTa: "உயர்நிலை மற்றும் மேல்நிலைப் பள்ளி மாணவர்கள்", 
      link: "https://www.naanmudhalvan.tn.gov.in", linkLabel: "Enroll Portal", linkLabelTa: "பதிவு செய்க" 
    });
  }

  if (grade === 12 && schoolType === "Government") {
    schemes.push({ 
      title: "7.5% Preferential Reservation", titleTa: "7.5% முன்னுரிமை இடஒதுக்கீடு",
      icon: "fi fi-sr-scale", 
      description: "7.5% seat reservation in professional courses for government school students.", descriptionTa: "தொழிற்கல்வி படிப்புகளில் அரசுப் பள்ளி மாணவர்களுக்கு 7.5% இடஒதுக்கீடு.", 
      status: "Active", statusTa: "செயலில்",
      eligibility: "Government School Students (Grades 6-12)", eligibilityTa: "அரசுப் பள்ளி மாணவர்கள் (வகுப்பு 6-12)", 
      link: "https://www.tneaonline.org", linkLabel: "TNEA Portal", linkLabelTa: "TNEA இணையதளம்" 
    });
  }

  if (grade === 9 && schoolType === "Government") {
    schemes.push({ 
      title: "TRUSTS Scholarship Exam", titleTa: "டிரஸ்ட் உதவித்தொகை தேர்வு",
      icon: "fi fi-sr-medal", 
      description: "Tamil Nadu Rural Students Talent Search Examination with ₹1,000/year allowance.", descriptionTa: "ஊரக மாணவர்களுக்கான திறனறித் தேர்வு, ஆண்டிற்கு ₹1,000 உதவித்தொகை.", 
      status: "Eligible (Class 9)", statusTa: "தகுதியுடையவர்",
      eligibility: "Class 9 Students with Parent Income under ₹2.5L", eligibilityTa: "ஆண்டு வருமானம் ₹2.5L க்கும் குறைவான 9ஆம் வகுப்பு மாணவர்கள்" 
    });
  }

  if (grade >= 12 && schoolType === "Government") {
    if (gender === "Female") {
       schemes.push({ 
         title: "Pudhumai Penn Scheme", titleTa: "புதுமைப் பெண் திட்டம்",
         icon: "fi fi-sr-graduation-cap", 
         description: "Higher Education Assurance scheme providing ₹1,000/month for college students.", descriptionTa: "கல்லூரி மாணவிகளுக்கு மாதம் ₹1,000 வழங்கும் உயர்கல்வி உறுதி திட்டம்.", 
         status: "Eligible (Post-School)", statusTa: "தகுதியுடையவர்",
         eligibility: "Girls who studied in Govt schools", eligibilityTa: "அரசுப் பள்ளிகளில் பயின்ற மாணவிகள்", 
         link: "https://penkalvi.tn.gov.in", linkLabel: "Apply", linkLabelTa: "விண்ணப்பிக்கவும்" 
       });
    } else {
       schemes.push({ 
         title: "Tamil Pudhalvan Scheme", titleTa: "தமிழ்ப் புதல்வன் திட்டம்",
         icon: "fi fi-sr-graduation-cap", 
         description: "₹1,000/month financial assistance for boys entering higher studies.", descriptionTa: "உயர்கல்வி படிக்கும் மாணவர்களுக்கு மாதம் ₹1,000 நிதியுதவி.", 
         status: "Eligible (Post-School)", statusTa: "தகுதியுடையவர்",
         eligibility: "Boys who studied in Govt schools", eligibilityTa: "அரசுப் பள்ளிகளில் பயின்ற மாணவர்கள்" 
       });
    }
  }

  return schemes;
}

export default function UnifiedWelfarePage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"EN" | "TA">("EN");

  // Interactive Calculator States
  const [calcGrade, setCalcGrade] = useState("8");
  const [calcGender, setCalcGender] = useState("Female");
  const [calcSchoolType, setCalcSchoolType] = useState("Government");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!session?.user) {
          // If no session yet, fallback to first student to show some data, but do not stop loading
          const res = await fetch(`${API_BASE}/api/students`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            setStudent(json.data[0]);
          }
          return;
        }

        let foundStudent: any = null;
        const studentId = (session.user as any).studentId;
        const userId = (session.user as any).id;

        // 1. Try fetching by studentId
        if (studentId) {
          const res = await fetch(`${API_BASE}/api/students`);
          const json = await res.json();
          if (json.success) {
            foundStudent = json.data.find((s: any) => s.id === studentId);
          }
        }

        // 2. Try fetching by userId (id field on session.user)
        if (!foundStudent && userId) {
          const res = await fetch(`${API_BASE}/api/students?userId=${userId}`);
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            foundStudent = json.data[0];
          }
        }

        // 3. Try fetching by rollNumber from email
        if (!foundStudent && session.user.email) {
          const rollNumber = session.user.email.split("@")[0];
          if (rollNumber) {
            const schoolId = (session.user as any).schoolId;
            const res = await fetch(`${API_BASE}/api/students?schoolId=${schoolId}`);
            const json = await res.json();
            if (json.success && json.data) {
              foundStudent = json.data.find(
                (s: any) => s.rollNumber?.toLowerCase() === rollNumber.toLowerCase()
              );
            }
          }
        }

        // 4. Default fallback
        if (!foundStudent) {
          const res = await fetch(`${API_BASE}/api/students`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            foundStudent = json.data[0];
          }
        }

        if (foundStudent) {
          setStudent(foundStudent);
        }
      } catch (err) {
        console.error("Failed to load student for welfare benefits:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [session]);

  // Pre-fill calculator with active student values if available
  useEffect(() => {
    if (student) {
      setCalcGrade(student.class.replace(/\D/g, "") || "8");
      setCalcGender(student.gender || "Female");
    }
  }, [student]);

  // Dynamic Calculator evaluation
  const calcGradeNum = parseInt(calcGrade, 10);
  
  let sectionKey: "middle" | "high" | "hsc" = "middle";
  let sectionLabel = "Middle School (Grades 6-8) Program";
  let backDashboardPath = "/student/middle-school";

  if (calcGradeNum >= 9 && calcGradeNum <= 10) {
    sectionKey = "high";
    sectionLabel = "High School (Grades 9-10) Program";
    backDashboardPath = "/student/high-school";
  } else if (calcGradeNum >= 11 && calcGradeNum <= 12) {
    sectionKey = "hsc";
    sectionLabel = "Higher Secondary (Grades 11-12) Program";
    backDashboardPath = "/student/higher-secondary";
  }

  const eligibleCalculatorSchemes = generateSchemes(calcGradeNum, calcGender, calcSchoolType);

  return (
    <PortalLayout
      title={lang === "EN" ? "Student Welfare & Benefits" : "மாணவர் நலத் திட்டங்கள்"}
      subtitle={lang === "EN" ? "Learn about all the amazing welfare schemes provided to you by the Tamil Nadu Government!" : "தமிழ்நாடு அரசு உங்களுக்கு வழங்கும் அனைத்து நலத்திட்டங்கள் பற்றிய விவரங்கள்!"}
      avatarLetter={student?.user?.name?.charAt(0) || "S"}
      avatarColor="#7c3aed"
      themeClass="theme-student"
      accentColor="#7c3aed"
    >
      {/* 🎁 Hero Banner – Welfare & Benefits */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 glass rounded-3xl p-5 border border-violet-200 dark:border-violet-800/40 bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-violet-950/30 dark:via-slate-900/60 dark:to-blue-950/30 backdrop-blur-md shadow-sm">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wide mb-1 flex items-center gap-2">
            <i className="fi fi-sr-hand-holding-heart text-violet-600 dark:text-violet-400 flex items-center" />
            {lang === "EN" ? "Welfare & Benefits" : "நலத் திட்டங்கள்"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {lang === "EN" 
              ? "Learn about all the amazing welfare schemes provided to you by the Tamil Nadu Government!" 
              : "தமிழ்நாடு அரசு உங்களுக்கு வழங்கும் அனைத்து நலத்திட்டங்கள் பற்றிய விவரங்கள்!"}
          </p>
        </div>
        {/* Right - chips */}
        <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 shrink-0 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 font-bold text-xs rounded-xl border border-violet-200/40 dark:border-violet-700/30 whitespace-nowrap">
            <i className="fi fi-sr-diploma flex items-center text-xs" />
            {lang === "EN" ? "Eligibility Checker" : "தகுதி சரிபார்ப்பு"}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold text-xs rounded-xl border border-blue-200/40 dark:border-blue-700/30 whitespace-nowrap">
            <i className="fi fi-sr-gift flex items-center text-xs" />
            {lang === "EN" ? "Government Schemes" : "அரசு நலத்திட்டங்கள்"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <Link href={backDashboardPath} className="text-sm font-bold text-black dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2 transition-colors w-fit">
          <span>←</span> {lang === "EN" ? "Back to Dashboard" : "டாஷ்போர்டுக்கு திரும்பு"}
        </Link>
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700/50">
          <button 
            onClick={() => setLang("EN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === "EN" ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLang("TA")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === "TA" ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-black dark:hover:text-white'}`}
          >
            தமிழ்
          </button>
        </div>
      </div>

      {loading ? (
        <div className="w-full flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 animate-pulse">Loading personalized benefits...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Interactive Calculator */}
          <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <h2 className="text-lg font-black text-black dark:text-white mb-4 flex items-center gap-2">
              <i className="fi fi-sr-settings-sliders text-emerald-500 text-xl"></i> {lang === "EN" ? "Eligibility Checker" : "தகுதி சரிபார்ப்பு"}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {lang === "EN" ? "Your personal details determine which schemes you qualify for." : "நீங்கள் தகுதிபெறும் திட்டங்கள் உங்கள் விவரங்களின் அடிப்படையில் தீர்மானிக்கப்படும்."}
            </p>

            <div className="space-y-4 text-xs font-bold text-black dark:text-slate-200">
              {/* Grade display */}
              <div>
                <label className="block mb-1.5 opacity-80">{lang === "EN" ? "Your Class/Standard:" : "வகுப்பு:"}</label>
                <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[13px] font-black text-black dark:text-white">
                  {lang === "EN" ? "Class" : "வகுப்பு"} {calcGrade}
                </div>
              </div>

              {/* Gender display */}
              <div>
                <label className="block mb-1.5 opacity-80">{lang === "EN" ? "Gender:" : "பாலினம்:"}</label>
                <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[13px] font-black text-black dark:text-white">
                  {calcGender === "Male" && lang === "TA" ? "ஆண்" : calcGender === "Female" && lang === "TA" ? "பெண்" : calcGender === "Other" && lang === "TA" ? "மற்றவை" : calcGender}
                </div>
              </div>

              {/* School Type display */}
              <div>
                <label className="block mb-1.5 opacity-80">{lang === "EN" ? "School Type:" : "பள்ளி வகை:"}</label>
                <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[13px] font-black text-black dark:text-white">
                  {calcSchoolType === "Government" && lang === "TA" ? "அரசுப் பள்ளி" : calcSchoolType === "Government-Aided" && lang === "TA" ? "அரசு உதவிபெறும் பள்ளி" : calcSchoolType === "Private" && lang === "TA" ? "தனியார் பள்ளி" : calcSchoolType}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-5">
              <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-3">{lang === "EN" ? "Qualified Schemes" : "தகுதியான திட்டங்கள்"} ({eligibleCalculatorSchemes.length})</h3>
              <div className="space-y-3">
                {eligibleCalculatorSchemes.map((s, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/50">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <i className={`${s.icon} text-emerald-600 dark:text-emerald-400 text-sm`}></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-black dark:text-white">{lang === "EN" ? s.title : s.titleTa}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{lang === "EN" ? s.description : s.descriptionTa}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Benefits List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                <i className="fi fi-sr-star text-amber-400 text-2xl"></i> {lang === "EN" ? "Government Welfare Schemes" : "அரசு நலத்திட்டங்கள்"}
              </h2>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/20 font-black text-[10px] uppercase tracking-wider w-fit">
                {lang === "EN" ? sectionLabel : sectionKey === "middle" ? "நடுநிலைப்பள்ளித் திட்டம்" : sectionKey === "high" ? "உயர்நிலைப்பள்ளித் திட்டம்" : "மேல்நிலைப்பள்ளித் திட்டம்"}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {eligibleCalculatorSchemes.map((benefit, idx) => (
                   <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/50 transition-colors group cursor-default">
                      <div className="flex items-start justify-between mb-3">
                         <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform text-slate-700 dark:text-slate-300 shadow-sm">
                            <i className={benefit.icon}></i>
                         </div>
                         <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded border 
                           ${benefit.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 
                             benefit.status === 'Received' ? 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10' : 
                             'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                           {lang === "EN" ? benefit.status : benefit.statusTa}
                         </span>
                      </div>
                      <h3 className="font-bold text-black dark:text-white mb-1.5">{lang === "EN" ? benefit.title : benefit.titleTa}</h3>
                      <p className="text-xs text-black dark:text-slate-350 leading-relaxed mb-3">{lang === "EN" ? benefit.description : benefit.descriptionTa}</p>
                      <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-2 flex items-center justify-between gap-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {lang === "EN" ? benefit.eligibility : benefit.eligibilityTa}
                        </span>
                        {benefit.link && (
                          <a
                            href={benefit.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded-lg"
                          >
                            🔗 {lang === "EN" ? (benefit.linkLabel || "Apply") : (benefit.linkLabelTa || "விண்ணப்பிக்கவும்")}
                          </a>
                        )}
                      </div>
                   </div>
                 ))}
            </div>

            <div className="mt-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-center">
               <p className="text-xs text-black dark:text-white font-medium">
                 {lang === "EN" ? "If you have any questions about these benefits or have not received them, please contact your class teacher." : "இந்தத் திட்டங்கள் குறித்த சந்தேகங்கள் ஏதேனும் இருப்பின் அல்லது இவற்றைப் பெறவில்லை எனில், உங்கள் வகுப்பு ஆசிரியரைத் தொடர்புகொள்ளவும்."}
               </p>
            </div>

          </div>
        </div>

      </div>
      )}
    </PortalLayout>
  );
}
