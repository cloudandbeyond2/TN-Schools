import React from "react";

interface FlatIconProps {
  name: string;
  className?: string;
}

export function FlatIcon({ name, className = "w-10 h-10" }: FlatIconProps) {
  // Normalize name to match keys
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  switch (key) {
    case "doctor":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FDEDEC" />
          <rect x="20" y="24" width="24" height="20" rx="3" fill="#E74C3C" />
          <path d="M28 24V20C28 18.9 28.9 18 30 18H34C35.1 18 36 18.9 36 20V24" stroke="#BDC3C7" strokeWidth="3" />
          <rect x="30" y="30" width="4" height="8" fill="white" />
          <rect x="28" y="32" width="8" height="4" fill="white" />
        </svg>
      );

    case "engineer":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EBF5FB" />
          <circle cx="32" cy="28" r="12" fill="#BDC3C7" />
          <circle cx="32" cy="28" r="6" fill="#EBF5FB" />
          <rect x="18" y="38" width="28" height="6" rx="2" fill="#F1C40F" />
          <line x1="22" y1="38" x2="22" y2="41" stroke="#D4AC0D" strokeWidth="2" />
          <line x1="28" y1="38" x2="28" y2="41" stroke="#D4AC0D" strokeWidth="2" />
          <line x1="34" y1="38" x2="34" y2="41" stroke="#D4AC0D" strokeWidth="2" />
          <line x1="40" y1="38" x2="40" y2="41" stroke="#D4AC0D" strokeWidth="2" />
        </svg>
      );

    case "ias":
    case "civilservices":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FEF9E7" />
          <path d="M18 20V32C18 41.5 25.5 48 32 50C38.5 48 46 41.5 46 32V20L32 14L18 20Z" fill="#F39C12" />
          <path d="M32 14L46 20V32C46 41.5 38.5 48 32 50V14Z" fill="#E67E22" />
          <polygon points="32,22 35,28 41,29 37,34 38,40 32,37 26,40 27,34 23,29 29,28" fill="white" />
        </svg>
      );

    case "tnpsc":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#E8F8F5" />
          <path d="M22 48H42V44H22V48Z" fill="#16A085" />
          <path d="M24 44H40V36H24V44Z" fill="#1ABC9C" />
          <path d="M26 36H38V28H26V36Z" fill="#48C9B0" />
          <path d="M28 28H36V20H28V28Z" fill="#76D7C4" />
          <polygon points="32,14 29,20 35,20" fill="#16A085" />
        </svg>
      );

    case "defence":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EAEDED" />
          <path d="M20 18L32 12L44 18V32C44 41 38 47 32 49C26 47 20 41 20 32V18Z" fill="#34495E" />
          <polygon points="32,20 35,26 41,27 37,32 38,38 32,35 26,38 27,32 23,27 29,26" fill="#F1C40F" />
        </svg>
      );

    case "banking":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#E8F8F5" />
          <rect x="18" y="18" width="28" height="28" rx="4" fill="#95A5A6" />
          <rect x="21" y="21" width="22" height="22" rx="2" fill="#7F8C8D" />
          <circle cx="32" cy="32" r="6" fill="#F1C40F" />
          <rect x="31" y="22" width="2" height="20" fill="#BDC3C7" />
          <rect x="22" y="31" width="20" height="2" fill="#BDC3C7" />
        </svg>
      );

    case "software":
    case "coding":
    case "laptop":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EBF5FB" />
          <rect x="16" y="20" width="32" height="24" rx="3" fill="#2C3E50" />
          <path d="M16 23C16 21.3431 17.3431 20 19 20H45C46.6569 20 48 21.3431 48 23V25H16V23Z" fill="#34495E" />
          <circle cx="21" cy="22.5" r="1.5" fill="#E74C3C" />
          <circle cx="25" cy="22.5" r="1.5" fill="#F1C40F" />
          <circle cx="29" cy="22.5" r="1.5" fill="#2ECC71" />
          <path d="M22 28L25 31L22 34" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="27" y1="34" x2="33" y2="34" stroke="#F1C40F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "agriculture":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#E8F8F5" />
          <path d="M14 44C20 42 44 42 50 44V48H14V44Z" fill="#8B5A2B" />
          <path d="M32 44V22" stroke="#27AE60" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 28C26 26 24 18 24 18C24 18 32 20 34 26" fill="#2ECC71" />
          <path d="M32 34C38 32 40 26 40 26C40 26 34 28 32 32" fill="#2ECC71" />
        </svg>
      );

    case "lawyer":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FEF9E7" />
          <line x1="18" y1="26" x2="46" y2="26" stroke="#D4AC0D" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="20" x2="32" y2="44" stroke="#D4AC0D" strokeWidth="4" />
          <rect x="24" y="44" width="16" height="4" rx="1" fill="#B2BABB" />
          <path d="M18 26L14 38H22L18 26Z" fill="#F1C40F" />
          <path d="M46 26L42 38H50L46 26Z" fill="#F1C40F" />
        </svg>
      );

    case "teacher":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EBF5FB" />
          <rect x="16" y="20" width="32" height="22" rx="2" fill="#8B5A2B" />
          <rect x="18" y="22" width="28" height="18" fill="#27AE60" />
          <line x1="22" y1="26" x2="28" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="31" x2="36" y2="31" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="36" x2="30" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "designthinking":
    case "brain":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#E8F0FE" />
          <path d="M26 24C22.6863 24 20 26.6863 20 30C20 32.3137 21.3137 34.3137 23.25 35.25L24 40H30V24H26Z" fill="#FF7096" />
          <path d="M38 24C41.3137 24 44 26.6863 44 30C44 32.3137 42.6863 34.3137 40.75 35.25L40 40H34V24H38Z" fill="#FF85A2" />
          <path d="M24 40H40V46C40 47.1046 39.1046 48 38 48H26C24.8954 48 24 47.1046 24 46V40Z" fill="#BDC3C7" />
          <path d="M28 48H36V50H28V48Z" fill="#7F8C8D" />
          <circle cx="32" cy="24" r="8" fill="#FEEA35" />
          <path d="M32 12V16" stroke="#FFA726" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 20L20 18" stroke="#FFA726" strokeWidth="2" strokeLinecap="round" />
          <path d="M40 20L44 18" stroke="#FFA726" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "problemsolving":
    case "puzzle":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EAF2F8" />
          <path d="M18 24H28C30.2 24 31 22.2 31 20C31 17.8 30.2 16 28 16C25.8 16 25 17.8 25 20H18V38H25C25 40.2 25.8 42 28 42C30.2 42 31 40.2 31 38C31 35.8 30.2 34 28 34H18V24Z" fill="#3498DB" />
          <path d="M28 24H46V34H38C35.8 34 35 35.8 35 38C35 40.2 35.8 42 38 42C40.2 42 41 40.2 41 38H46V24H28Z" fill="#E67E22" />
        </svg>
      );

    case "prototyping":
    case "makerprojects":
    case "tools":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FEF9E7" />
          <path d="M16 36C16 27.1634 23.1634 20 32 20C40.8366 20 48 27.1634 48 36H16Z" fill="#F1C40F" />
          <path d="M30 20H34V30H30V20Z" fill="#D4AC0D" />
          <rect x="14" y="34" width="36" height="4" rx="2" fill="#E0B008" />
          <path d="M42 42L48 48C49.5 49.5 47.5 51.5 46 50L40 44L42 42Z" fill="#95A5A6" />
          <circle cx="43" cy="43" r="4" fill="#7F8C8D" />
        </svg>
      );

    case "electronics":
    case "plug":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#E8F8F5" />
          <rect x="18" y="18" width="28" height="28" rx="4" fill="#2ECC71" />
          <rect x="22" y="22" width="20" height="20" rx="2" fill="#27AE60" />
          <rect x="25" y="14" width="4" height="4" fill="#F1C40F" />
          <rect x="35" y="14" width="4" height="4" fill="#F1C40F" />
          <rect x="25" y="46" width="4" height="4" fill="#F1C40F" />
          <rect x="35" y="46" width="4" height="4" fill="#F1C40F" />
          <rect x="14" y="25" width="4" height="4" fill="#F1C40F" />
          <rect x="14" y="35" width="4" height="4" fill="#F1C40F" />
          <rect x="46" y="25" width="4" height="4" fill="#F1C40F" />
          <rect x="46" y="35" width="4" height="4" fill="#F1C40F" />
        </svg>
      );

    case "innovationchallenges":
    case "trophy":
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FDEDEC" />
          <path d="M22 46H42V48C42 49.1046 41.1046 50 40 50H24C22.8954 50 22 49.1046 22 48V46Z" fill="#95A5A6" />
          <rect x="28" y="40" width="8" height="6" fill="#BDC3C7" />
          <path d="M20 20H44V32C44 38.6274 38.6274 44 32 44C25.3726 44 20 38.6274 20 32V20Z" fill="#F1C40F" />
          <path d="M32 20V44" stroke="#F39C12" strokeWidth="2" />
          <path d="M20 24H16V30C16 33 18.5 35 20 35" stroke="#F1C40F" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M44 24H48V30C48 33 45.5 35 44 35" stroke="#F1C40F" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      );

    // --- Question Bank Icons ---
    case "mcq":
      // A flat blue checkbox
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EBF5FB" />
          <rect x="18" y="18" width="28" height="28" rx="6" fill="#3498DB" />
          <path d="M25 32L30 37L39 25" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "previousyearquestions":
      // A calendar with a date clock
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FDEDEC" />
          <rect x="18" y="22" width="28" height="24" rx="4" fill="#E74C3C" />
          <rect x="18" y="28" width="28" height="18" rx="2" fill="#ECF0F1" />
          {/* Calendar holes */}
          <rect x="23" y="18" width="4" height="6" rx="2" fill="#7F8C8D" />
          <rect x="37" y="18" width="4" height="6" rx="2" fill="#7F8C8D" />
          {/* Grid lines */}
          <circle cx="25" cy="34" r="2" fill="#BDC3C7" />
          <circle cx="32" cy="34" r="2" fill="#BDC3C7" />
          <circle cx="39" cy="34" r="2" fill="#BDC3C7" />
          <circle cx="25" cy="40" r="2" fill="#BDC3C7" />
          <circle cx="32" cy="40" r="2" fill="#E74C3C" />
          <circle cx="39" cy="40" r="2" fill="#BDC3C7" />
        </svg>
      );

    case "diagrampractice":
      // Drawing board/canvas with a pencil
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#E8F8F5" />
          <rect x="18" y="20" width="28" height="24" rx="3" fill="#16A085" />
          <rect x="21" y="23" width="22" height="18" fill="#F1C40F" />
          {/* Drawing paths */}
          <path d="M26 36C28 32 32 28 38 32" stroke="#16A085" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case "shortlonganswers":
      // Document pad / list of papers
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#F5EEF8" />
          <rect x="18" y="18" width="28" height="28" rx="3" fill="#9B59B6" />
          <rect x="21" y="21" width="22" height="22" rx="1" fill="white" />
          <line x1="25" y1="26" x2="39" y2="26" stroke="#9B59B6" strokeWidth="2" />
          <line x1="25" y1="31" x2="39" y2="31" stroke="#9B59B6" strokeWidth="2" />
          <line x1="25" y1="36" x2="35" y2="36" stroke="#9B59B6" strokeWidth="2" />
        </svg>
      );

    case "byclass":
      // Graduation cap
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EBF5FB" />
          <polygon points="32,18 48,26 32,34 16,26" fill="#2980B9" />
          <path d="M22 30V38C22 41 26.5 43 32 43C37.5 43 42 41 42 38V30" fill="#1F618D" />
          {/* Tassel */}
          <path d="M44 26V35" stroke="#F1C40F" strokeWidth="2" />
          <circle cx="44" cy="36" r="2" fill="#F1C40F" />
        </svg>
      );

    case "bysubject":
      // Stack of books
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#E8F8F5" />
          <rect x="18" y="20" width="28" height="6" fill="#E67E22" rx="1" />
          <rect x="18" y="28" width="28" height="6" fill="#2ECC71" rx="1" />
          <rect x="18" y="36" width="28" height="6" fill="#3498DB" rx="1" />
        </svg>
      );

    case "bychapter":
      // Bookmark tag
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FEF9E7" />
          <path d="M24 16H40V48L32 40L24 48V16Z" fill="#E67E22" />
          <circle cx="32" cy="24" r="3" fill="white" />
        </svg>
      );

    case "identity":
    case "profile":
      // User Profile & ID Card Icon
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EEF2FF" />
          <rect x="18" y="16" width="28" height="32" rx="4" fill="#6366F1" />
          <circle cx="32" cy="28" r="6" fill="#EEF2FF" />
          <path d="M22 42C22 37.5817 26.4772 34 32 34C37.5228 34 42 37.5817 42 42H22Z" fill="#A5B4FC" />
        </svg>
      );

    case "learning":
    case "academics":
      // Open Book & Graduation Icon
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#ECFDF5" />
          <path d="M16 22L32 14L48 22L32 30L16 22Z" fill="#10B981" />
          <path d="M22 26V34C22 37 26.5 39 32 39C37.5 39 42 37 42 34V26" fill="#059669" />
          <rect x="44" y="22" width="3" height="12" rx="1" fill="#F59E0B" />
        </svg>
      );

    case "experience":
    case "cocurricular":
      // Star & Sports Medal Icon
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FFFBEB" />
          <circle cx="32" cy="32" r="16" fill="#F59E0B" />
          <polygon points="32,20 35.5,27 43,28 37.5,33.5 39,41 32,37 25,41 26.5,33.5 21,28 28.5,27" fill="#FEF3C7" />
        </svg>
      );

    case "portfoliotab":
    case "projects":
      // Folder & Projects Icon
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#F3E8FF" />
          <path d="M16 24C16 21.7909 17.7909 20 20 20H28L32 24H44C46.2091 24 48 25.7909 48 28V42C48 44.2091 46.2091 46 44 46H20C17.7909 46 16 44.2091 16 42V24Z" fill="#8B5CF6" />
          <path d="M16 28H48V42C48 44.2091 46.2091 46 44 46H20C17.7909 46 16 44.2091 16 42V28Z" fill="#A855F7" />
        </svg>
      );

    case "growth":
    case "growthjourney":
    case "timeline":
      // Ascending Growth Trend & Rocket Icon
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EFF6FF" />
          <rect x="18" y="38" width="6" height="12" rx="2" fill="#93C5FD" />
          <rect x="28" y="30" width="6" height="20" rx="2" fill="#60A5FA" />
          <rect x="38" y="20" width="6" height="30" rx="2" fill="#2563EB" />
          <path d="M16 34L26 26L34 30L46 16" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#F4F6F7" />
          <circle cx="32" cy="32" r="16" fill="#3498DB" />
          <circle cx="32" cy="32" r="8" fill="#5DADE2" />
          <circle cx="32" cy="32" r="4" fill="#FFFFFF" />
        </svg>
      );
  }
}
