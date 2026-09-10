"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, BookOpen, UserCircle, Briefcase, FileText, LayoutDashboard,
  MessageCircle, Sparkles, Languages, CheckCircle2, Shield,
  FlaskConical, Globe, Calculator, BookType, ChevronRight, Activity, Zap,
  Moon, Sun, MapPin, Mail, Phone, Send
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NewLandingPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const getPortalLink = () => {
    if (!session?.user) return "/login";
    const role = (session.user as any).role || "STUDENT";
    if (role === "SUPERADMIN") return "/super-admin";
    if (role === "TEACHER") return "/teacher";
    if (role === "PARENT") return "/parent";
    if (role === "HEADMASTER") return "/headmaster";
    if (role === "BEO") return "/block-education-officer";
    if (role === "DEO") return "/district-education-officer";
    if (role === "COMMISSIONER") return "/commissioner";
    if (role === "MINISTER") return "/minister";
    return "/student";
  };

  const [roleTab, setRoleTab] = useState(0);
  const [lang, setLang] = useState<"EN" | "TA">("EN");
  const [aiTypingText, setAiTypingText] = useState("");

  const aiFullText = "இதன் அர்த்தம்: ஒளிச்சேர்க்கை (Photosynthesis) என்பது தாவரங்கள் சூரிய ஒளியைப் பயன்படுத்தி உணவைத் தயாரிக்கும் முறையாகும்.";

  useEffect(() => {
    setMounted(true);
    let index = 0;
    const interval = setInterval(() => {
      setAiTypingText(aiFullText.slice(0, index));
      index++;
      if (index > aiFullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const roles = [
    { name: "Student", desc: "Interactive lessons & progress tracking tailored to your pace.", icon: <GraduationCap size={24} /> },
    { name: "Teacher", desc: "AI-assisted grading & lesson planning for smarter classrooms.", icon: <UserCircle size={24} /> },
    { name: "Headmaster", desc: "School-wide performance analytics & staff management.", icon: <Briefcase size={24} /> },
    { name: "BEO", desc: "Block-level insights & resource allocation dashboard.", icon: <LayoutDashboard size={24} /> },
    { name: "DEO", desc: "District-level compliance & academic monitoring.", icon: <FileText size={24} /> },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-[#0B0914] text-[#1E1B2E] dark:text-gray-200 font-sans selection:bg-[#EDE9FE] dark:selection:bg-[#6D28D9]/50 selection:text-[#4C1D95] dark:selection:text-white overflow-x-hidden transition-colors duration-300">

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-[#0B0914]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6D28D9] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#6D28D9]/20">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold dark:text-white tracking-tight">TN EduAI</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-full flex items-center">
              <button
                onClick={() => setLang("EN")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "EN" ? 'bg-white dark:bg-[#6D28D9] text-[#4C1D95] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("TA")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${lang === "TA" ? 'bg-white dark:bg-[#6D28D9] text-[#4C1D95] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                TA
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Login / Dashboard */}
            <Link
              href={getPortalLink()}
              className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-sm ml-2"
            >
              {session?.user ? "Dashboard" : "Sign In"}
            </Link>
          </div>
        </div>
      </header>

      {/* 1. Hero Section - Cinematic */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="Students using AI"
            fill
            className="object-cover object-center opacity-30 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAFC] via-[#FAFAFC]/95 to-[#FAFAFC]/50 dark:from-[#0B0914] dark:via-[#0B0914]/95 dark:to-[#0B0914]/50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAFAFC] dark:to-[#0B0914]"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 w-full">
          <div className="flex-1 space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6D28D9]/10 border border-[#6D28D9]/20 text-[#6D28D9] dark:text-[#a78bfa] text-xs font-bold tracking-wide uppercase">
              <Sparkles size={14} /> Tamil Nadu State Board
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-[#4C1D95] dark:text-white leading-[1.1]">
              <span className="font-tamil text-[#6D28D9] dark:text-[#a78bfa]">எதிர்காலக் கல்வி</span><br />
              Intelligent Learning ecosystem.
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl backdrop-blur-md bg-white/40 dark:bg-black/40 p-5 rounded-2xl border border-white/60 dark:border-white/10 shadow-sm">
              A state-wide digital learning ecosystem delivering personalized AI tutoring, continuous tracking, and governed outcomes for 52+ lakh students.
            </p>

          </div>

          {/* Hero Demo Visual (Floating Glassmorphism) */}
          <div className="flex-1 w-full max-w-md lg:max-w-none relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/80 dark:bg-[#1A1435]/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/80 dark:border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#6D28D9]/20 blur-[60px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4C1D95]/20 blur-[50px] rounded-full"></div>

              <div className="flex items-start gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 border border-white/50 dark:border-white/10 shadow-sm">
                  <UserCircle size={28} className="text-gray-600 dark:text-gray-300" />
                </div>
                <div className="bg-white/90 dark:bg-white/5 rounded-2xl rounded-tl-none p-5 text-[#1E1B2E] dark:text-gray-200 font-tamil text-sm md:text-base border border-gray-100 dark:border-white/5 shadow-sm">
                  இது என்ன அர்த்தம்? (What does this mean?)
                </div>
              </div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#6D28D9] flex items-center justify-center shrink-0 shadow-lg shadow-[#6D28D9]/40 border border-[#6D28D9]/50">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div className="bg-[#EDE9FE]/90 dark:bg-[#6D28D9]/20 border border-[#6D28D9]/20 dark:border-[#6D28D9]/30 rounded-2xl rounded-tl-none p-5 text-[#1E1B2E] dark:text-gray-100 font-tamil text-sm md:text-base leading-relaxed min-h-[120px] w-full shadow-sm backdrop-blur-sm">
                  {aiTypingText}
                  <span className="animate-pulse inline-block w-1.5 h-5 bg-[#6D28D9] dark:bg-[#a78bfa] ml-1 align-middle"></span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* 3. Role-based portals */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#4C1D95] dark:text-white mb-6">One Platform, 9 Dedicated Portals</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Tailored interfaces delivering the exact tools and insights needed for every stakeholder in the ecosystem.</p>
        </div>

        <div className="flex flex-col items-center">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {roles.map((role, idx) => (
              <button
                key={role.name}
                onClick={() => setRoleTab(idx)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border ${roleTab === idx
                    ? 'bg-[#6D28D9] text-white border-[#6D28D9] shadow-lg shadow-[#6D28D9]/20'
                    : 'bg-white dark:bg-[#1A1435] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-[#6D28D9]/50 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
              >
                {role.icon} {role.name}
              </button>
            ))}
          </div>

          {/* Content Cross-fade */}
          <div className="w-full max-w-4xl relative h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={roleTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 bg-white dark:bg-[#1A1435] border border-gray-200 dark:border-white/10 shadow-2xl shadow-black/5 rounded-3xl overflow-hidden flex flex-col"
              >
                {/* Mockup Topbar */}
                <div className="h-12 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-white/20" />
                  <div className="ml-4 text-xs text-gray-400 font-bold uppercase tracking-wider">{roles[roleTab].name} Portal</div>
                </div>
                {/* Mockup Body */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-transparent relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(109,40,217,0.05),transparent)] dark:bg-[radial-gradient(ellipse_at_center,rgba(109,40,217,0.15),transparent)] pointer-events-none"></div>
                  <div className="w-24 h-24 bg-[#EDE9FE] dark:bg-[#6D28D9]/20 rounded-3xl flex items-center justify-center text-[#6D28D9] dark:text-[#a78bfa] mb-8 shadow-inner border border-white/50 dark:border-transparent">
                    {roles[roleTab].icon}
                  </div>
                  <h3 className="text-3xl font-bold text-[#1E1B2E] dark:text-white mb-4">{roles[roleTab].name} Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md text-lg leading-relaxed">{roles[roleTab].desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 4. AI Doubt-Solver Deep-Dive */}
      <section className="bg-[#EDE9FE]/50 dark:bg-[#120E24] py-32 border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#d97706] dark:text-[#F59E0B] text-xs font-bold mb-8 tracking-wider uppercase">
              <Sparkles size={16} /> AI-Powered RAG
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#4C1D95] dark:text-white mb-8 leading-tight">Ask anything from your specific syllabus.</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg leading-relaxed">
              Not a generic chatbot. Our AI tutor grounds its answers strictly in the Tamil Nadu State Board textbooks, ensuring students get syllabus-accurate help when they need it most.
            </p>
            <ul className="space-y-6">
              <li className="flex gap-4 text-gray-800 dark:text-gray-200 font-semibold text-lg">
                <CheckCircle2 className="text-[#6D28D9] dark:text-[#a78bfa] shrink-0 mt-0.5" size={24} /> Chapter-specific context retrieval.
              </li>
              <li className="flex gap-4 text-gray-800 dark:text-gray-200 font-semibold text-lg">
                <CheckCircle2 className="text-[#6D28D9] dark:text-[#a78bfa] shrink-0 mt-0.5" size={24} /> Hallucination-free academic support.
              </li>
              <li className="flex gap-4 text-gray-800 dark:text-gray-200 font-semibold text-lg">
                <CheckCircle2 className="text-[#6D28D9] dark:text-[#a78bfa] shrink-0 mt-0.5" size={24} /> Bilingual explanations (Tamil & English).
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-[#1A1435] p-8 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-white/10 relative">
            <div className="absolute -top-5 -right-5 bg-white dark:bg-[#2D2454] px-5 py-3 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 flex gap-2 items-center">
              <BookOpen size={18} className="text-[#6D28D9] dark:text-[#a78bfa]" /> Class 10 Science
            </div>

            <div className="space-y-6 mt-4">
              {/* User message */}
              <div className="flex flex-col items-end">
                <div className="bg-gray-100 dark:bg-white/5 text-[#1E1B2E] dark:text-gray-200 px-5 py-4 rounded-3xl rounded-br-sm max-w-[80%] text-base shadow-sm">
                  Can you explain the Laws of Motion simply?
                </div>
              </div>

              {/* AI Message */}
              <div className="flex flex-col items-start">
                <div className="bg-[#6D28D9] text-white px-5 py-4 rounded-3xl rounded-bl-sm max-w-[85%] text-base shadow-md">
                  Newton's three laws describe how forces affect movement.<br /><br />
                  1. An object stays at rest unless pushed or pulled.<br />
                  2. Force equals mass times acceleration (F=ma).<br />
                  3. For every action, there is an equal and opposite reaction.
                </div>
                {/* Citation */}
                <div className="mt-3 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-lg border border-gray-100 dark:border-white/10 flex items-center gap-2">
                  <FileText size={14} className="text-gray-400" />
                  Source: Chapter 1 - Laws of Motion, Page 2.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Content Generation at Scale */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#4C1D95] dark:text-white mb-6">Content mapped to the curriculum</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">Comprehensive subject coverage across the entire K-12 spectrum, broken down into standardized, digestible modules.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { name: "Science", icon: <FlaskConical size={36} /> },
            { name: "Mathematics", icon: <Calculator size={36} /> },
            { name: "Tamil", icon: <BookType size={36} /> },
            { name: "English", icon: <Globe size={36} /> }
          ].map((subject, idx) => (
            <div key={idx} className="bg-white dark:bg-[#1A1435] border border-gray-100 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-xl dark:hover:shadow-2xl transition-all hover:-translate-y-1 group">
              <div className="w-20 h-20 rounded-2xl bg-[#FAFAFC] dark:bg-white/5 text-[#6D28D9] dark:text-[#a78bfa] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                {subject.icon}
              </div>
              <h4 className="font-bold text-[#1E1B2E] dark:text-white text-xl mb-3">{subject.name}</h4>
              <p className="text-xs font-bold text-[#6D28D9] dark:text-[#a78bfa] bg-[#EDE9FE] dark:bg-[#6D28D9]/20 px-4 py-1.5 rounded-full">
                23 Chapters · 4 Modes
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Latest Articles */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold font-serif text-[#1E1B2E] dark:text-white mb-3">Latest Articles</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">where young readers can embark on a journey through the most.</p>
          </div>
          <button className="bg-[#2b906a] hover:bg-[#237757] text-white px-6 py-3 rounded-lg font-semibold transition-colors shrink-0 shadow-sm">
            Read All Articles
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Featured Article */}
          <div className="bg-white dark:bg-[#1A1435] rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-white/10">
            <div className="relative w-full h-[250px] md:h-[320px] rounded-2xl overflow-hidden mb-6">
              <img src="https://images.unsplash.com/photo-1507676184212-d0330a151f14?auto=format&fit=crop&w=800&q=80" alt="Featured Article" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <span className="bg-[#e6f4ed] dark:bg-green-900/30 text-[#2b906a] dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">Basic Islam</span>
                <span className="bg-[#f0edff] dark:bg-purple-900/30 text-[#6D28D9] dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold">Learn Quran</span>
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">August 7,2023</span>
            </div>
            <h3 className="text-2xl font-bold font-serif text-[#1E1B2E] dark:text-white mb-3">Exploring the Path of Faith and Wisdom in Islam</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
              a journey filled with profound insights, timeless teachings, and a celebration of faith. Here, we embark on...
            </p>
          </div>

          {/* Right Column Articles */}
          <div className="bg-white dark:bg-[#1A1435] rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-white/10 flex flex-col justify-between gap-6">
            {/* List Item 1 */}
            <div className="flex gap-5 pb-6 border-b border-gray-100 dark:border-white/5">
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80" alt="Article 1" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <div className="flex gap-2">
                    <span className="bg-[#e6f4ed] dark:bg-green-900/30 text-[#2b906a] dark:text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold">Basic Islam</span>
                    <span className="bg-[#f0edff] dark:bg-purple-900/30 text-[#6D28D9] dark:text-purple-400 px-2.5 py-1 rounded-full text-[10px] font-bold">Learn Quran</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">August 7,2023</span>
                </div>
                <h4 className="text-lg md:text-xl font-bold font-serif text-[#1E1B2E] dark:text-white leading-snug">Nurturing Young Hearts with Knowledge</h4>
              </div>
            </div>

            {/* List Item 2 */}
            <div className="flex gap-5 pb-6 border-b border-gray-100 dark:border-white/5">
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=400&q=80" alt="Article 2" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <div className="flex gap-2">
                    <span className="bg-[#e6f4ed] dark:bg-green-900/30 text-[#2b906a] dark:text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold">Basic Islam</span>
                    <span className="bg-[#f0edff] dark:bg-purple-900/30 text-[#6D28D9] dark:text-purple-400 px-2.5 py-1 rounded-full text-[10px] font-bold">Learn Quran</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">August 7,2023</span>
                </div>
                <h4 className="text-lg md:text-xl font-bold font-serif text-[#1E1B2E] dark:text-white leading-snug">Daily Exploring the Quran with Children</h4>
              </div>
            </div>

            {/* List Item 3 */}
            <div className="flex gap-5">
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80" alt="Article 3" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                  <div className="flex gap-2">
                    <span className="bg-[#e6f4ed] dark:bg-green-900/30 text-[#2b906a] dark:text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold">Basic Islam</span>
                    <span className="bg-[#f0edff] dark:bg-purple-900/30 text-[#6D28D9] dark:text-purple-400 px-2.5 py-1 rounded-full text-[10px] font-bold">Learn Quran</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">August 7,2023</span>
                </div>
                <h4 className="text-lg md:text-xl font-bold font-serif text-[#1E1B2E] dark:text-white leading-snug">Everyday Teaching Kids the Beauty of the Quran</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Impact/Outcomes */}
      <section className="py-24 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-[#1A1435] rounded-[2.5rem] p-10 border border-gray-100 dark:border-white/10 shadow-2xl dark:shadow-black/50 relative">
            <h4 className="text-xl font-bold text-[#1E1B2E] dark:text-white mb-8 flex items-center gap-3">
              <Activity className="text-[#6D28D9]" /> Student Progress
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-10">
              {/* Progress Ring Graphic */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="text-gray-100 dark:text-white/5 stroke-current" strokeWidth="10" fill="none" />
                  <circle cx="50" cy="50" r="40" className="text-[#6D28D9] stroke-current" strokeWidth="10" fill="none" strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-[#4C1D95] dark:text-white">75%</span>
                  <span className="text-xs uppercase font-bold text-gray-400 mt-1">Mastery</span>
                </div>
              </div>
              <div className="space-y-6 flex-1 w-full">
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                    <span>Physics (11th)</span>
                    <span className="text-emerald-500 dark:text-emerald-400">Ready</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6D28D9] w-[85%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                    <span>Chemistry (11th)</span>
                    <span className="text-[#F59E0B]">Needs Focus</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] w-[45%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#4C1D95] dark:text-white leading-tight">Actionable outcomes over vanity metrics.</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            Monitor true academic proficiency, identify learning gaps early, and guide students toward appropriate 11th/12th stream selections and competitive exam preparations.
          </p>
          <div className="flex gap-5 items-center bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 inline-flex">
            <div className="w-14 h-14 rounded-xl bg-[#EDE9FE] dark:bg-[#6D28D9]/20 flex items-center justify-center text-[#6D28D9] dark:text-[#a78bfa]">
              <Zap size={28} />
            </div>
            <div>
              <div className="font-bold text-[#1E1B2E] dark:text-white text-lg">Predictive Insights</div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Data-driven interventions for educators.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Compliance/Trust Band */}
      <section className="bg-white dark:bg-[#0B0914] border-y border-gray-100 dark:border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">Enterprise-Grade Security & Compliance</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-70 grayscale dark:opacity-50">
            <div className="flex items-center gap-3 font-bold text-gray-600 dark:text-white text-lg">
              <Shield size={24} /> DPDP Act Compliant
            </div>
            <div className="flex items-center gap-3 font-bold text-gray-600 dark:text-white text-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>
              MeitY Empanelled AI
            </div>
            <div className="flex items-center gap-3 font-bold text-gray-600 dark:text-white text-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
              Cloud Hosted (India)
            </div>
          </div>
        </div>
      </section>

      {/* 9. Contact Us Section */}
      <section className="bg-white dark:bg-[#120E24] py-24 border-y border-gray-100 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#4C1D95] dark:text-white leading-tight">Our Address</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-md">
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                 <div className="mt-1 text-[#6D28D9] dark:text-[#a78bfa]"><MapPin size={24} /></div>
                 <div className="text-gray-700 dark:text-gray-300 font-medium">9/4/C Ring Road, Garden Street<br/>Dhaka, Bangladesh-1200</div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-[#6D28D9] dark:text-[#a78bfa]"><Mail size={24} /></div>
                 <div className="text-gray-700 dark:text-gray-300 font-medium">eduai@tn.gov.in</div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-[#6D28D9] dark:text-[#a78bfa]"><Phone size={24} /></div>
                 <div className="text-gray-700 dark:text-gray-300 font-medium">+91 44 2827 8796</div>
              </div>
            </div>
            
            {/* Decorative element (optional, adapting from image) */}
            <div className="absolute bottom-[-50px] right-0 opacity-20 dark:opacity-10 pointer-events-none">
               <Sparkles size={120} className="text-[#6D28D9]" />
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-[#FAFAFC] dark:bg-[#1A1435] p-8 md:p-10 rounded-[2.5rem] shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-gray-100 dark:border-white/10">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <input type="text" placeholder="Guardian Name*" className="w-full bg-white dark:bg-[#0B0914] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[#1E1B2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/50 transition-all" required />
                 <input type="tel" placeholder="Phone Number*" className="w-full bg-white dark:bg-[#0B0914] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[#1E1B2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/50 transition-all" required />
               </div>
               <input type="email" placeholder="Email*" className="w-full bg-white dark:bg-[#0B0914] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[#1E1B2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/50 transition-all" required />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <input type="text" placeholder="Child Name*" className="w-full bg-white dark:bg-[#0B0914] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[#1E1B2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/50 transition-all" required />
                 <input type="text" placeholder="Age of Child*" className="w-full bg-white dark:bg-[#0B0914] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[#1E1B2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/50 transition-all" required />
               </div>
               <textarea placeholder="Message*" rows={4} className="w-full bg-white dark:bg-[#0B0914] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-[#1E1B2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/50 transition-all resize-none" required></textarea>
               
               <button type="submit" className="w-full bg-[#6D28D9] hover:bg-[#5b21b6] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#6D28D9]/30 transition-colors text-lg">
                 Submit
               </button>
            </form>
          </div>
        </div>
      </section>

      {/* 10. Multi-column Footer */}
      <footer className="bg-white dark:bg-[#05030A] pt-20 pb-10 border-t border-gray-100 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            
            {/* Logo & Description */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#6D28D9] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#6D28D9]/20">
                   <GraduationCap size={24} />
                </div>
                <span className="text-2xl font-bold text-[#4C1D95] dark:text-white tracking-tight">TN EduAI</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed pr-8">
                TN EduAI is an innovative and engaging educational platform designed to make learning fun and accessible for children across the state.
              </p>
              <div className="flex gap-4">
                 <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[#4C1D95] dark:text-gray-300 hover:bg-[#6D28D9] hover:text-white transition-colors"><FaFacebook size={18} /></button>
                 <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[#4C1D95] dark:text-gray-300 hover:bg-[#6D28D9] hover:text-white transition-colors"><FaInstagram size={18} /></button>
                 <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[#4C1D95] dark:text-gray-300 hover:bg-[#6D28D9] hover:text-white transition-colors"><FaTwitter size={18} /></button>
                 <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[#4C1D95] dark:text-gray-300 hover:bg-[#6D28D9] hover:text-white transition-colors"><FaYoutube size={18} /></button>
              </div>
            </div>

            {/* Links Columns */}
            <div>
               <h4 className="font-bold text-[#1E1B2E] dark:text-white text-lg mb-6">Useful Links</h4>
               <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                 <li><a href="#" className="hover:text-[#6D28D9] transition-colors">School Portals</a></li>
                 <li><a href="#" className="hover:text-[#6D28D9] transition-colors">About Program</a></li>
                 <li><a href="#" className="hover:text-[#6D28D9] transition-colors">Resources</a></li>
                 <li><a href="#" className="hover:text-[#6D28D9] transition-colors">Digital Library</a></li>
                 <li><a href="#" className="hover:text-[#6D28D9] transition-colors">Photo Gallery</a></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-[#1E1B2E] dark:text-white text-lg mb-6">Our Company</h4>
               <ul className="space-y-4 text-gray-600 dark:text-gray-400">
                 <li><a href="#" className="hover:text-[#6D28D9] transition-colors">About us</a></li>
                 <li><a href="#" className="hover:text-[#6D28D9] transition-colors">Media</a></li>
                 <li><a href="#" className="hover:text-[#6D28D9] transition-colors">Blog</a></li>
                 <li><a href="#" className="hover:text-[#6D28D9] transition-colors">Contact us</a></li>
               </ul>
            </div>

            {/* Subscribe */}
            <div>
               <h4 className="font-bold text-[#1E1B2E] dark:text-white text-lg mb-6">Subscribe News</h4>
               <div className="relative mb-6">
                 <input type="email" placeholder="Email address" className="w-full bg-[#FAFAFC] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full pl-5 pr-12 py-3 text-[#1E1B2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/50 transition-all" />
                 <button className="absolute right-1 top-1 bottom-1 w-10 bg-[#6D28D9] hover:bg-[#5b21b6] text-white rounded-full flex items-center justify-center transition-colors">
                   <Send size={16} />
                 </button>
               </div>
               <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] flex items-center justify-center shrink-0"><Mail size={14} /></div>
                   <span className="text-gray-600 dark:text-gray-400 text-sm">eduai@tn.gov.in</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] flex items-center justify-center shrink-0"><Phone size={14} /></div>
                   <span className="text-gray-600 dark:text-gray-400 text-sm">+91 44 2827 8796</span>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm font-medium text-gray-400 dark:text-gray-500">
            <div>© 2026 TN EduAI. All rights reserved.</div>
            <div className="mt-4 md:mt-0 space-x-6">
              <a href="#" className="hover:text-[#6D28D9] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#6D28D9] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
