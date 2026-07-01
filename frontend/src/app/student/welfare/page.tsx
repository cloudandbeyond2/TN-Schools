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
  icon: string;
  description: string;
  status: string;
  eligibility: string;
  link?: string;
  linkLabel?: string;
}

const middleSchemes: Scheme[] = [
  { title: "Free Noon Meal Scheme", icon: "🍱", description: "Nutritious hot meals provided daily at school to keep you energized.", status: "Active", eligibility: "Government & Government-Aided Schools (Grades 1-8)" },
  { title: "Free Uniforms & Footwear", icon: "👕", description: "Sets of school uniforms and comfortable shoes provided annually.", status: "Received", eligibility: "All Government School Students (Grades 1-8)" },
  { title: "Free Textbooks & Notebooks", icon: "📚", description: "Complete sets of textbooks and notebooks for the academic year.", status: "Received", eligibility: "All Government & Aided School Students" },
  { title: "Free Bus Pass Scheme", icon: "🚌", description: "Travel freely between your home and school on state transport buses.", status: "Active", eligibility: "All School Students in Uniform/with ID", link: "https://www.tnstc.in", linkLabel: "Bus Pass Info" },
  { title: "Free Bicycles Scheme", icon: "🚲", description: "Provided to class 11 students to help commute easily.", status: "Upcoming in Class 11", eligibility: "All Government School Students in Grade 11" },
];

const highSchemes: Scheme[] = [
  { title: "Free Bus Pass Scheme", icon: "🚌", description: "Travel freely between your home and school on state transport buses.", status: "Active", eligibility: "All School Students in Uniform/with ID", link: "https://www.tnstc.in", linkLabel: "Bus Pass Info" },
  { title: "Free Textbooks & Notebooks", icon: "📚", description: "Complete sets of textbooks, notebooks, and study guides for SSLC Board prep.", status: "Received", eligibility: "All Government & Aided School Students" },
  { title: "Naan Mudhalvan Skill Training", icon: "🧭", description: "Skill development and career guidance platform to build modern soft skills.", status: "Active", eligibility: "All High School Students (Grades 9-10)", link: "https://www.naanmudhalvan.tn.gov.in", linkLabel: "Enroll Portal" },
  { title: "TRUSTS Scholarship Exam", icon: "🏅", description: "Tamil Nadu Rural Students Talent Search Examination with ₹1,000/year allowance.", status: "Eligible (Class 9)", eligibility: "Class 9 Students with Parent Income under ₹2.5L" },
  { title: "7.5% Preferential Reservation", icon: "⚖️", description: "7.5% seat reservation in professional courses for government school students.", status: "Active (Future)", eligibility: "Government School Students studying from Grade 6-12", link: "https://www.tneaonline.org", linkLabel: "TNEA Portal" },
];

const hscSchemes: Scheme[] = [
  { title: "Free Bicycles Scheme", icon: "🚲", description: "Provided to Class 11 students to support rural commutes and ensure attendance.", status: "Received", eligibility: "All Government School Students in Grade 11" },
  { title: "Free Laptops Scheme", icon: "💻", description: "Provided to Class 12 students to bridge the digital divide and support lab projects.", status: "Active", eligibility: "Government & Aided School Students in Grade 12" },
  { title: "Naan Mudhalvan Career Portal", icon: "🚀", description: "Advanced coding, tech skills, and career counseling mentorship programs.", status: "Active", eligibility: "All Higher Secondary Students (Grades 11-12)", link: "https://www.naanmudhalvan.tn.gov.in", linkLabel: "Join Portal" },
  { title: "7.5% College Admission Quota", icon: "🎓", description: "7.5% seat reservation in MBBS/BDS, Engineering, Agriculture, and Law admissions.", status: "Active", eligibility: "Government School Students studying from Grade 6-12", link: "https://www.tneaonline.org", linkLabel: "TNEA Portal" },
  { title: "Pudhumai Penn / Tamil Pudhalvan", icon: "👩‍🎓", description: "Higher Education Assurance scheme providing ₹1,000/month for college students.", status: "Eligible (Post-School)", eligibility: "Girls and boys who studied in Govt schools from Grade 6-12", link: "https://penkalvi.tn.gov.in", linkLabel: "Pudhumai Penn Portal" },
  { title: "Free Bus Pass Scheme", icon: "🚌", description: "Travel freely between your home and school on state transport buses.", status: "Active", eligibility: "All School Students in Uniform/with ID", link: "https://www.tnstc.in", linkLabel: "Bus Pass Info" },
];

export default function UnifiedWelfarePage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Interactive Calculator States
  const [calcGrade, setCalcGrade] = useState("8");
  const [calcGender, setCalcGender] = useState("Female");
  const [calcSchoolType, setCalcSchoolType] = useState("Government");

  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id 
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          setStudent(myStudent || json.data[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [session]);

  const classNum = student ? parseInt(student.class.replace(/\D/g, ""), 10) : 7;
  
  let sectionKey: "middle" | "high" | "hsc" = "middle";
  let sectionLabel = "Middle School (Grades 6-8) Program";
  let activeSchemes = middleSchemes;
  let backDashboardPath = "/student/middle-school";

  if (classNum >= 9 && classNum <= 10) {
    sectionKey = "high";
    sectionLabel = "High School (Grades 9-10) Program";
    activeSchemes = highSchemes;
    backDashboardPath = "/student/high-school";
  } else if (classNum >= 11 && classNum <= 12) {
    sectionKey = "hsc";
    sectionLabel = "Higher Secondary (Grades 11-12) Program";
    activeSchemes = hscSchemes;
    backDashboardPath = "/student/higher-secondary";
  }

  // Pre-fill calculator with active student values if available
  useEffect(() => {
    if (student) {
      setCalcGrade(student.class.replace(/\D/g, "") || "8");
      setCalcGender(student.gender || "Female");
    }
  }, [student]);

  // Dynamic Calculator evaluation
  const calcGradeNum = parseInt(calcGrade, 10);
  const eligibleCalculatorSchemes = [];

  if (calcGradeNum <= 8 && calcSchoolType === "Government") {
    eligibleCalculatorSchemes.push({ title: "Free Noon Meal Scheme", icon: "🍱", desc: "Nutritious daily meals at school." });
    eligibleCalculatorSchemes.push({ title: "Free Uniforms & Footwear", icon: "👕", desc: "School uniform sets and shoes." });
  }
  if (calcSchoolType !== "Private") {
    eligibleCalculatorSchemes.push({ title: "Free Textbooks & Notebooks", icon: "📚", desc: "Complete sets of textbooks and study notebooks." });
  }
  eligibleCalculatorSchemes.push({ title: "Free Bus Pass Scheme", icon: "🚌", desc: "Free state transport bus commuting." });
  if (calcGradeNum === 11 && calcSchoolType === "Government") {
    eligibleCalculatorSchemes.push({ title: "Free Bicycles Scheme", icon: "🚲", desc: "Travel bicycle for Grade 11 students." });
  }
  if (calcGradeNum === 12 && calcSchoolType !== "Private") {
    eligibleCalculatorSchemes.push({ title: "Free Laptops Scheme", icon: "💻", desc: "Laptops for Grade 12 students to support computer lab work." });
  }
  if (calcGradeNum >= 9) {
    eligibleCalculatorSchemes.push({ title: "Naan Mudhalvan Skill Portal", icon: "🧭", desc: "Career mentoring and skill guidance modules." });
  }
  if (calcSchoolType === "Government") {
    eligibleCalculatorSchemes.push({ title: "7.5% College Admission Quota", icon: "🎓", desc: "7.5% seat reservation in Engineering, NEET, Law, and Agriculture." });
  }
  if (calcGradeNum === 9 && calcSchoolType === "Government") {
    eligibleCalculatorSchemes.push({ title: "TRUSTS Scholarship Exam", icon: "🏅", desc: "Eligible to write talent search exam with ₹1,000/year allowance." });
  }
  if (calcGradeNum >= 12 && calcSchoolType === "Government") {
    if (calcGender === "Female") {
      eligibleCalculatorSchemes.push({ title: "Pudhumai Penn Scheme", icon: "👩‍🎓", desc: "₹1,000/month financial assistance throughout college education." });
    } else {
      eligibleCalculatorSchemes.push({ title: "Tamil Pudhalvan Scheme", icon: "👨‍🎓", desc: "₹1,000/month financial assistance for boys entering higher studies." });
    }
  }

  return (
    <PortalLayout
      title="Student Welfare & Benefits"
      subtitle={`Learn about all the amazing welfare schemes provided to you by the Tamil Nadu Government!`}
      avatarLetter={student?.user?.name?.charAt(0) || "S"}
      avatarColor="#10b981"
      themeClass="theme-student"
      accentColor="#10b981"
    >
      <div className="mb-6">
        <Link href={backDashboardPath} className="text-sm font-bold text-black dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2 transition-colors w-fit">
          <span>←</span> Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Calculator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <h2 className="text-lg font-black text-black dark:text-white mb-4 flex items-center gap-2">
              <span className="text-xl">🧮</span> Eligibility Checker
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Enter your details to check exactly which government benefits and welfare schemes you qualify for.
            </p>

            <div className="space-y-4 text-xs font-bold text-black dark:text-slate-200">
              {/* Grade select */}
              <div>
                <label className="block mb-1.5 opacity-80">Your Class/Standard:</label>
                <select 
                  value={calcGrade}
                  onChange={(e) => setCalcGrade(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  {["6", "7", "8", "9", "10", "11", "12"].map(g => (
                    <option key={g} value={g}>Class {g}</option>
                  ))}
                </select>
              </div>

              {/* Gender select */}
              <div>
                <label className="block mb-1.5 opacity-80">Gender:</label>
                <select 
                  value={calcGender}
                  onChange={(e) => setCalcGender(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* School Type select */}
              <div>
                <label className="block mb-1.5 opacity-80">School Type:</label>
                <select 
                  value={calcSchoolType}
                  onChange={(e) => setCalcSchoolType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="Government">Government School</option>
                  <option value="Government-Aided">Government-Aided School</option>
                  <option value="Private">Private School</option>
                </select>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-5">
              <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-3">Qualified Schemes ({eligibleCalculatorSchemes.length})</h3>
              <div className="space-y-3">
                {eligibleCalculatorSchemes.map((s, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/50">
                    <span className="text-xl shrink-0 mt-0.5">{s.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-black dark:text-white">{s.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.desc}</div>
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
                <span className="text-2xl">🌟</span> Government Welfare Schemes
              </h2>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/20 font-black text-[10px] uppercase tracking-wider w-fit">
                {sectionLabel}
              </span>
            </div>
            
            {loading ? (
              <div className="text-center py-20 text-xs text-slate-450 flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Checking your school benefits...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {activeSchemes.map((benefit, idx) => (
                   <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/50 transition-colors group cursor-default">
                      <div className="flex items-start justify-between mb-3">
                         <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {benefit.icon}
                         </div>
                         <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded border 
                           ${benefit.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 
                             benefit.status === 'Received' ? 'text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10' : 
                             'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                           {benefit.status}
                         </span>
                      </div>
                      <h3 className="font-bold text-black dark:text-white mb-1.5">{benefit.title}</h3>
                      <p className="text-xs text-black dark:text-slate-350 leading-relaxed mb-3">{benefit.description}</p>
                      <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-2 flex items-center justify-between gap-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          {benefit.eligibility}
                        </span>
                        {benefit.link && (
                          <a
                            href={benefit.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded-lg"
                          >
                            🔗 {benefit.linkLabel || "Apply"}
                          </a>
                        )}
                      </div>
                   </div>
                 ))}
              </div>
            )}
            
            <div className="mt-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-center">
               <p className="text-xs text-black dark:text-white font-medium">
                 If you have any questions about these benefits or have not received them, please contact your class teacher.
               </p>
            </div>

          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
