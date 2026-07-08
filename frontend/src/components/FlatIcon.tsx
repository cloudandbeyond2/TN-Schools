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
      // Flat illustration of a medical kit / stethoscope
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FDEDEC" />
          <rect x="20" y="24" width="24" height="20" rx="3" fill="#E74C3C" />
          <path d="M28 24V20C28 18.9 28.9 18 30 18H34C35.1 18 36 18.9 36 20V24" stroke="#BDC3C7" strokeWidth="3" />
          {/* Red Cross */}
          <rect x="30" y="30" width="4" height="8" fill="white" />
          <rect x="28" y="32" width="8" height="4" fill="white" />
        </svg>
      );

    case "engineer":
      // Flat illustration of drafting compass and gears
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EBF5FB" />
          <circle cx="32" cy="28" r="12" fill="#BDC3C7" />
          <circle cx="32" cy="28" r="6" fill="#EBF5FB" />
          {/* Ruler/Scale */}
          <rect x="18" y="38" width="28" height="6" rx="2" fill="#F1C40F" />
          <line x1="22" y1="38" x2="22" y2="41" stroke="#D4AC0D" strokeWidth="2" />
          <line x1="28" y1="38" x2="28" y2="41" stroke="#D4AC0D" strokeWidth="2" />
          <line x1="34" y1="38" x2="34" y2="41" stroke="#D4AC0D" strokeWidth="2" />
          <line x1="40" y1="38" x2="40" y2="41" stroke="#D4AC0D" strokeWidth="2" />
        </svg>
      );

    case "ias":
    case "civilservices":
      // Flat illustration of government building / emblem shield
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FEF9E7" />
          {/* Shield */}
          <path d="M18 20V32C18 41.5 25.5 48 32 50C38.5 48 46 41.5 46 32V20L32 14L18 20Z" fill="#F39C12" />
          <path d="M32 14L46 20V32C46 41.5 38.5 48 32 50V14Z" fill="#E67E22" />
          {/* Star */}
          <polygon points="32,22 35,28 41,29 37,34 38,40 32,37 26,40 27,34 23,29 29,28" fill="white" />
        </svg>
      );

    case "tnpsc":
      // Flat illustration of Tamil temple tower silhouette / gateway logo
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#E8F8F5" />
          {/* Temple Gopuram Silhouette */}
          <path d="M22 48H42V44H22V48Z" fill="#16A085" />
          <path d="M24 44H40V36H24V44Z" fill="#1ABC9C" />
          <path d="M26 36H38V28H26V36Z" fill="#48C9B0" />
          <path d="M28 28H36V20H28V28Z" fill="#76D7C4" />
          <polygon points="32,14 29,20 35,20" fill="#16A085" />
        </svg>
      );

    case "defence":
      // Flat badge illustration (gold star + police shield outline)
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EAEDED" />
          <path d="M20 18L32 12L44 18V32C44 41 38 47 32 49C26 47 20 41 20 32V18Z" fill="#34495E" />
          <polygon points="32,20 35,26 41,27 37,32 38,38 32,35 26,38 27,32 23,27 29,26" fill="#F1C40F" />
        </svg>
      );

    case "banking":
      // Flat illustration of a safety vault / safe
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
      // Flat screen / computer terminal
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
      // Flat green plant growing from brown soil
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#E8F8F5" />
          {/* Soil */}
          <path d="M14 44C20 42 44 42 50 44V48H14V44Z" fill="#8B5A2B" />
          {/* Sprout */}
          <path d="M32 44V22" stroke="#27AE60" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 28C26 26 24 18 24 18C24 18 32 20 34 26" fill="#2ECC71" />
          <path d="M32 34C38 32 40 26 40 26C40 26 34 28 32 32" fill="#2ECC71" />
        </svg>
      );

    case "lawyer":
      // Flat scales of justice
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FEF9E7" />
          {/* Balance beam */}
          <line x1="18" y1="26" x2="46" y2="26" stroke="#D4AC0D" strokeWidth="3" strokeLinecap="round" />
          <line x1="32" y1="20" x2="32" y2="44" stroke="#D4AC0D" strokeWidth="4" />
          <rect x="24" y="44" width="16" height="4" rx="1" fill="#B2BABB" />
          {/* Left scale */}
          <path d="M18 26L14 38H22L18 26Z" fill="#F1C40F" />
          {/* Right scale */}
          <path d="M46 26L42 38H50L46 26Z" fill="#F1C40F" />
        </svg>
      );

    case "teacher":
      // Flat illustration of a blackboard / desk screen
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#EBF5FB" />
          <rect x="16" y="20" width="32" height="22" rx="2" fill="#8B5A2B" />
          <rect x="18" y="22" width="28" height="18" fill="#27AE60" />
          {/* Chalk writing */}
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

    default:
      // Fallback science/guidance icon
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
