import { useState, useEffect } from "react";
import translations from "./teacher-translations.json";

export function usePortalLanguage() {
  const [lang, setLang] = useState<"English" | "தமிழ்">("English");

  useEffect(() => {
    const savedLang = localStorage.getItem("portal-language");
    if (savedLang === "English" || savedLang === "தமிழ்") {
      setLang(savedLang);
    }

    const handleLangChange = () => {
      const nextLang = localStorage.getItem("portal-language");
      if (nextLang === "English" || nextLang === "தமிழ்") {
        setLang(nextLang);
      }
    };

    window.addEventListener("portal-language-change", handleLangChange);
    return () => {
      window.removeEventListener("portal-language-change", handleLangChange);
    };
  }, []);

  const t = (key: keyof typeof translations["English"]): string => {
    const dict = (translations as any)[lang] || translations["English"];
    return dict[key] || (translations["English"] as any)[key] || key;
  };

  return { lang, t };
}
