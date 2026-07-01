"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Sparkles, 
  VolumeX, 
  Search, 
  Languages, 
  X, 
  BookMarked,
  Sliders,
  Type,
  Sun,
  Moon,
  Info,
  Play,
  Pause,
  RotateCcw,
  Smile
} from "lucide-react";

// Dynamically resolve API base to support local or proxy environments
const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

interface Page {
  id: string;
  pageNumber: number;
  contentEnglish: string;
  contentTamil: string;
  illustration: string;
}

interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  pages: Page[];
}

interface StoryBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
  color: string;
  language: string;
  moral: string;
  xpReward: number;
  gradeLevel?: string;
  progress: number;
  completed: boolean;
  currentChapter: number;
  currentPage: number;
  totalChapters: number;
}

// Highly comprehensive interactive dictionary / glossary for lookups
const glossary: { [key: string]: { ipa: string; tamil: string; definition: string; example: string } } = {
  abdul: { ipa: "/æbˈdʊl/", tamil: "அப்துல்", definition: "A common Arabic name meaning 'servant of'.", example: "Dr. APJ Abdul Kalam was a great leader." },
  kalam: { ipa: "/kəˈlɑːm/", tamil: "கலாம்", definition: "A name meaning 'speech' or 'conversation'.", example: "Kalam loved talking to students." },
  island: { ipa: "/ˈaɪ.lənd/", tamil: "தீவு", definition: "A piece of land surrounded by water.", example: "Rameswaram is a beautiful island town." },
  seagulls: { ipa: "/ˈsiː.ɡʌlz/", tamil: "கடற்பறவைகள்", definition: "Large web-footed seabirds with white, black, or grey feathers.", example: "The seagulls flew high over the ocean waves." },
  effortlessly: { ipa: "/ˈɛf.ərt.ləs.li/", tamil: "எளிதாக / சிரமமின்றி", definition: "In a manner requiring no physical or mental exertion.", example: "Birds soar effortlessly high above the waves." },
  infinite: { ipa: "/ˈɪn.fɪ.nət/", tamil: "எல்லையற்ற", definition: "Limitless or endless in space, source, or size.", example: "He dreamed of flying into the infinite sky." },
  railway: { ipa: "/ˈreɪ.weɪ/", tamil: "இரயில் பாதை", definition: "A track made of steel rails along which trains run.", example: "He ran to the railway station." },
  distributed: { ipa: "/dɪˈstrɪb.juː.tɪd/", tamil: "விநியோகித்தார்", definition: "Shared or spread out among a group of people.", example: "He distributed newspapers across the town." },
  labor: { ipa: "/ˈleɪ.bər/", tamil: "உழைப்பு", definition: "Work, especially hard physical work.", example: "He learned the value of honest labor." },
  discipline: { ipa: "/ˈdɪs.ə.plɪn/", tamil: "ஒழுக்கம்", definition: "The practice of training people to obey rules.", example: "Discipline is key to success." },
  aerospace: { ipa: "/ˈer.oʊ.speɪs/", tamil: "விண்வெளித் துறை", definition: "Technology concerned with aviation and space flight.", example: "He studied aerospace engineering." },
  scholarship: { ipa: "/ˈskɑː.lər.ʃɪp/", tamil: "கல்வி உதவித்தொகை", definition: "A grant made to support a student's education.", example: "His scholarship was in danger." },
  transcended: { ipa: "/trænˈsɛn.dɪd/", tamil: "முறியடிக்கப்படும் / வெல்லப்படும்", definition: "Went beyond the limits of something.", example: "Great dreams are always transcended." },
  anklet: { ipa: "/ˈæŋ.klət/", tamil: "காற்சிலம்பு", definition: "A piece of jewelry worn around the ankle.", example: "Kannagi had a precious golden anklet." },
  grief: { ipa: "/ɡriːf/", tamil: "துக்கம் / பெருங்கவலை", definition: "Deep sorrow, especially caused by someone's death.", example: "Kannagi was in deep grief." },
  accused: { ipa: "/əˈkjuːzd/", tamil: "குற்றம் சாட்டப்பட்டார்", definition: "Charged with a crime or wrongdoing.", example: "Kovalan was falsely accused." },
  executed: { ipa: "/ˈek.sə.kjuː.tɪd/", tamil: "தூக்கிலிடப்பட்டார்", definition: "Put to death, especially as a legal penalty.", example: "The king ordered him to be executed." },
  rubies: { ipa: "/ˈruː.biz/", tamil: "மாணிக்கங்கள்", definition: "Precious red gemstones.", example: "Her anklets contained red rubies." },
  pearls: { ipa: "/pɜːrlz/", tamil: "முத்துக்கள்", definition: "Smooth, lustrous round structures formed inside shells of oysters.", example: "The Queen's anklet was filled with pearls." },
  throne: { ipa: "/θroʊn/", tamil: "அரியணை", definition: "A ceremonial chair for a sovereign or ruler.", example: "The king fell from his throne." },
  genius: { ipa: "/ˈdʒiːnjəs/", tamil: "மேதை", definition: "Exceptional intellectual or creative ability.", example: "Ramanujan was a raw mathematical genius." },
  destitute: { ipa: "/ˈdɛstɪˌtuːt/", tamil: "வறுமை / ஆதரவற்ற நிலை", definition: "Extremely poor and lacking basic necessities.", example: "He was destitute and lacked support in college." },
  theorems: { ipa: "/ˈθiːərəmz/", tamil: "தேற்றங்கள்", definition: "Mathematical statements that have been proven.", example: "His letters contained pages of complex theorems." },
  relentlessly: { ipa: "/rɪˈlɛntləsli/", tamil: "இடைவிடாமல்", definition: "In an intense, harsh, or unforgiving way; without stopping.", example: "He worked relentlessly with G.H. Hardy." },
  partition: { ipa: "/pɑːrˈtɪʃən/", tamil: "பிரிவினை சூத்திரங்கள்", definition: "A way of writing an integer as a sum of positive integers.", example: "They proved extraordinary partition formulas." },
  equation: { ipa: "/ɪˈkweɪʒən/", tamil: "சமன்பாடு", definition: "A mathematical statement showing that two expressions are equal.", example: "To Ramanujan, an equation represents a thought of God." },
  infinity: { ipa: "/ɪnˈfɪn.ə.ti/", tamil: "முடிவிலி", definition: "A number or quantity that is larger than any real number.", example: "He is the man who knew infinity." },
  nedunchezhian: { ipa: "/nɛdʊnˌtʃɛʐɪjən/", tamil: "நெடுஞ்செழியன்", definition: "The historic Pandyan King who ruled Madurai in the Silappadikaram epic.", example: "King Nedunchezhian ordered Kovalan to be executed." }
};

// Curated Reading Themes
const themes = {
  day: {
    bg: "bg-[#faf8f5] dark:bg-[#16171a]",
    text: "text-slate-800 dark:text-slate-100",
    border: "border-slate-200 dark:border-slate-800/80",
    pageBg: "bg-[#fdfbf9] dark:bg-[#1d1e22]",
    subText: "text-slate-500 dark:text-slate-450",
    cardBg: "bg-white dark:bg-[#23242a]",
    shadow: "shadow-lg shadow-slate-200/50 dark:shadow-none"
  },
  sepia: {
    bg: "bg-[#f4ecd8] dark:bg-[#251e12]",
    text: "text-[#5b4636] dark:text-[#ebcca5]",
    border: "border-[#e0d3b6] dark:border-[#382d1c]",
    pageBg: "bg-[#fbf5e6] dark:bg-[#2d2417]",
    subText: "text-[#7c6351] dark:text-[#bd9c81]",
    cardBg: "bg-[#faf1dc] dark:bg-[#342a1a]",
    shadow: "shadow-lg shadow-[#e0d3b6]/20 dark:shadow-none"
  },
  night: {
    bg: "bg-[#0b0f19] dark:bg-[#06080d]",
    text: "text-slate-200 dark:text-slate-350",
    border: "border-slate-850 dark:border-slate-900",
    pageBg: "bg-[#111827] dark:bg-[#0c0f16]",
    subText: "text-slate-450 dark:text-slate-500",
    cardBg: "bg-[#182235] dark:bg-[#131722]",
    shadow: "shadow-lg shadow-black/40"
  }
};

const bookQuizzes: { 
  [key: string]: { 
    question: string; 
    questionTamil: string;
    options: { key: string; text: string; textTamil: string }[] 
  } 
} = {
  "Wings of Fire": {
    question: "What is the main lesson APJ Abdul Kalam shares regarding failures in projects like the SLV-3 launch?",
    questionTamil: "SLV-3 ஏவுதல் போன்ற திட்டங்களில் ஏற்படும் தோல்விகள் குறித்து ஏ.பி.ஜே.அப்துல் கலாம் பகிர்ந்து கொள்ளும் முக்கிய பாடம் என்ன?",
    options: [
      { key: "wrong-1", text: "Failures demonstrate that aerospace studies are far too difficult for students.", textTamil: "தோல்விகள் விண்வெளி ஆய்வுகள் மாணவர்களுக்கு மிகவும் கடினமானவை என்பதைக் காட்டுகின்றன." },
      { key: "correct", text: "Failure is not the ultimate end, but the very first step towards learning.", textTamil: "தோல்வி என்பது இறுதி முடிவு அல்ல, அது கற்றலுக்கான முதல் படியாகும்." },
      { key: "wrong-2", text: "You must avoid designing complex projects to prevent failures entirely.", textTamil: "தோல்விகளை முற்றிலும் தவிர்க்க நீங்கள் சிக்கலான திட்டங்களை வடிவமைப்பதைத் தவிர்க்க வேண்டும்." }
    ]
  },
  "Tenali Raman and the Brinjals": {
    question: "How did Tenali Raman save himself and his family from the King's punishment?",
    questionTamil: "தெனாலி ராமன் மன்னரின் தண்டனையிலிருந்து தன்னையும் தன் குடும்பத்தையும் எவ்வாறு காப்பாற்றினார்?",
    options: [
      { key: "wrong-1", text: "By running away from the Vijayanagara kingdom immediately.", textTamil: "விஜயநகர ராஜ்ஜியத்தை விட்டு உடனடியாக தப்பி ஓடியதன் மூலம்." },
      { key: "correct", text: "By using his quick wit to make the truth sound like a child's dream.", textTamil: "தனது புத்திசாலித்தனத்தைப் பயன்படுத்தி, உண்மையை ஒரு குழந்தையின் கனவு போல மாற்றியதன் மூலம்." },
      { key: "wrong-2", text: "By bribing the guards with the stolen brinjal curry.", textTamil: "திருடப்பட்ட கத்தரிக்காய் கறியைக் கொண்டு காவலர்களுக்கு லஞ்சம் கொடுத்ததன் மூலம்." }
    ]
  },
  "Damon and Pythias": {
    question: "What did Damon's willingness to stand execution for Pythias prove?",
    questionTamil: "பிதியாஸுக்காக மரண தண்டனையை ஏற்க டேமன் முன்வந்தது எதை நிரூபித்தது?",
    options: [
      { key: "correct", text: "True friendship is built on absolute trust, loyalty, and self-sacrifice.", textTamil: "உண்மையான நட்பு என்பது முழுமையான நம்பிக்கை, விசுவாசம் மற்றும் தியாகத்தின் மீது கட்டமைக்கப்படுகிறது." },
      { key: "wrong-1", text: "Tyrant kings are easy to fool with clever promises.", textTamil: "கொடுங்கோல் மன்னர்களை தந்திரமான வாக்குறுதிகள் மூலம் எளிதாக ஏமாற்ற முடியும் என்பதை." },
      { key: "wrong-2", text: "Running away from prison is always the safest option.", textTamil: "சிறையிலிருந்து தப்பி ஓடுவது எப்போதும் பாதுகாப்பான வழி என்பதை." }
    ]
  },
  "Rani Laxmibai's Courage": {
    question: "Why is Rani Laxmibai remembered as a legendary hero in Indian history?",
    questionTamil: "இந்திய வரலாற்றில் ராணி லட்சுமிபாய் ஏன் ஒரு புகழ்பெற்ற நாயகியாக நினைவுகூரப்படுகிறார்?",
    options: [
      { key: "wrong-1", text: "She chose to surrender Jhansi to avoid battle.", textTamil: "போரைத் தவிர்க்க அவர் ஜான்சியை ஆங்கிலேயர்களிடம் ஒப்படைக்க முடிவு செய்தார்." },
      { key: "correct", text: "She stood fearlessly against injustice, defending her homeland until her last breath.", textTamil: "அவர் அநீதிக்கு எதிராக அச்சமின்றி நின்று, இறுதி மூச்சு வரை தனது தாயகத்தைக் காத்தார்." },
      { key: "wrong-2", text: "She was the first woman to invent modern gunpowder weapons.", textTamil: "அவர் நவீன வெடிமருந்து ஆயுதங்களைக் கண்டுபிடித்த முதல் பெண்மணி ஆவார்." }
    ]
  },
  "The Magic Pot": {
    question: "What led to the greedy King's downfall in the story of the Magic Pot?",
    questionTamil: "மாயக் குடம் கதையில் பேராசை பிடித்த மன்னனின் வீழ்ச்சிக்கு எது வழிவகுத்தது?",
    options: [
      { key: "wrong-1", text: "The farmer hid the gold coins inside the palace walls.", textTamil: "விவசாயி தங்க நாணயங்களை அரண்மனைச் சுவர்களுக்குள் மறைத்து வைத்தது." },
      { key: "correct", text: "His own greed made him slip into the duplicating pot, creating a hundred fighting kings.", textTamil: "அவரது பேராசையினால் குடத்திற்குள் விழுந்ததால், நூறு சண்டையிடும் மன்னர்கள் உருவானது." },
      { key: "wrong-2", text: "He did not know how to cultivate the crops in Subha's field.", textTamil: "சுபாவின் வயலில் பயிர்களை எவ்வாறு பயிரிடுவது என்று அவருக்குத் தெரியாதது." }
    ]
  },
  "The Hero of Haarlem": {
    question: "What moral duty did young Hans show when he plugged the hole in the dike?",
    questionTamil: "அணையின் துளையை அடைத்தபோது இளம் ஹான்ஸ் காட்டிய ஒழுக்கநெறி என்ன?",
    options: [
      { key: "correct", text: "A single act of alert responsibility can protect a whole community from disaster.", textTamil: "ஒரு சிறிய பொறுப்பான செயல் முழு சமூகத்தையும் பேரழிவிலிருந்து காப்பாற்றும்." },
      { key: "wrong-1", text: "Playing in the North Sea is dangerous for young children.", textTamil: "இளம் குழந்தைகள் வடகடல் பகுதியில் விளையாடுவது மிகவும் ஆபத்தானது." },
      { key: "wrong-2", text: "Only trained adults are capable of repairing leaking walls.", textTamil: "அணை கசிவுகளை சரிசெய்ய பயிற்சி பெற்ற பெரியவர்களால் மட்டுமே முடியும்." }
    ]
  },
  "The Legend of Kannagi": {
    question: "What ethical value does Nedunchezhian's collapse in the court establish?",
    questionTamil: "அரசவையில் நெடுஞ்செழியன் மயங்கி விழுந்தது எந்த ஒழுக்க நெறியை நிறுவுகிறது?",
    options: [
      { key: "wrong-1", text: "The Queen's pearls are the most valuable assets of the Kingdom.", textTamil: "அரசியின் சிலம்பே ராஜ்ஜியத்தின் மிக மதிப்புமிக்க சொத்து என்பதை." },
      { key: "wrong-2", text: "Guards must always obey orders quickly without asking questions.", textTamil: "காவலர்கள் எப்போதும் கேள்வி கேட்காமல் உத்தரவுகளுக்குக் கீழ்ப்படிய வேண்டும் என்பதை." },
      { key: "correct", text: "Dharma and justice will prevail, and even kings must yield to the truth.", textTamil: "தர்மமும் நீதியும் வெல்லும், மன்னர்களும் கூட உண்மைக்கு தலைவணங்க வேண்டும் என்பதை." }
    ]
  },
  "The Wisdom of King Solomon": {
    question: "How did King Solomon identify the baby's true mother?",
    questionTamil: "சாலமன் அரசன் குழந்தையின் உண்மையான தாயை எவ்வாறு கண்டறிந்தார்?",
    options: [
      { key: "wrong-1", text: "By asking the court guards to search their homes for baby clothes.", textTamil: "குழந்தையின் ஆடைகளைத் தேட காவலர்களுக்கு உத்தரவிட்டதன் மூலம்." },
      { key: "correct", text: "He knew the real mother would sacrifice her custody to save her child's life.", textTamil: "உண்மையான தாய் குழந்தையின் உயிரைக் காப்பாற்ற தன் உரிமையை விட்டுக்கொடுப்பாள் என்பதை அவர் அறிந்தார்." },
      { key: "wrong-2", text: "By cutting the child in half to satisfy both claims fairly.", textTamil: "குழந்தையை இரண்டாக வெட்டி இருவருக்கும் சமமாகப் பகிர்ந்தளித்ததன் மூலம்." }
    ]
  },
  "Subramania Bharati": {
    question: "What was Subramania Bharatiyar's primary weapon in fighting inequality and colonial rule?",
    questionTamil: "அநீதி மற்றும் அடிமைத்தனத்திற்கு எதிராக போராட சுப்பிரமணிய பாரதியாரின் முதன்மை ஆயுதமாக இருந்தது எது?",
    options: [
      { key: "correct", text: "His revolutionary Tamil poems and songs that inspired national unity.", textTamil: "தேசிய ஒற்றுமையை ஊக்குவித்த அவரது புரட்சிகரமான தமிழ் கவிதைகளும் பாடல்களும்." },
      { key: "wrong-1", text: "A secret army of warriors that fought in Madurai.", textTamil: "மதுரையில் ஆங்கிலேயரை எதிர்த்துப் போராடிய அவரது ரகசிய இராணுவம்." },
      { key: "wrong-2", text: "His wealth and trading ships across the Mediterranean.", textTamil: "மத்திய தரைக்கடல் பகுதி முழுவதும் வணிகம் செய்த அவரது செல்வச் செழிப்பு." }
    ]
  },
  "The Windmill Boy": {
    question: "What does William Kamkwamba's story teach us about solving local problems?",
    questionTamil: "உள்ளூர் பிரச்சினைகளைத் தீர்ப்பது குறித்து வில்லியம் காம்குவாம்பாவின் கதை நமக்கு என்ன கற்பிக்கிறது?",
    options: [
      { key: "wrong-1", text: "You must wait for expensive foreign machinery to build electricity grids.", textTamil: "மின்சாரம் தயாரிக்க வைலையுயர்ந்த வெளிநாட்டு இயந்திரங்களுக்காக காத்திருக்க வேண்டும்." },
      { key: "correct", text: "Resourcefulness and curiosity can turn scrap metal into life-saving energy.", textTamil: "விடாமுயற்சியும் ஆர்வமும் இருந்தால் இரும்பு கழிவுகளைக் கூட மின்சாரமாக மாற்ற முடியும்." },
      { key: "wrong-2", text: "Starvation can be solved by importing crops from neighboring libraries.", textTamil: "பட்டினியைப் போக்க பக்கத்து கிராமங்களிலிருந்து உணவை இறக்குமதி செய்ய வேண்டும்." }
    ]
  },
  "The Merchant of Venice": {
    question: "What main argument did Portia make in the courtroom to save Antonio?",
    questionTamil: "அன்டோனியோவைக் காப்பாற்ற போர்ஷியா நீதிமன்றத்தில் முன்வைத்த முக்கிய வாதம் என்ன?",
    options: [
      { key: "correct", text: "Justice must be tempered with mercy, which falls like gentle rain from heaven.", textTamil: "நீதி என்பது கருணையோடு இருக்க வேண்டும், அது வானிலிருந்து பொழியும் மழை போன்றது." },
      { key: "wrong-1", text: "A pound of flesh is too expensive to buy in the markets of Venice.", textTamil: "வெனிஸ் சந்தையில் ஒரு பவுண்டு சதை வாங்குவது மிகவும் கடினமானது." },
      { key: "wrong-2", text: "Shylock should double the interest rate on the original gold loan.", textTamil: "ஷைலாக் அசல் தங்கக் கடனுக்கான வட்டி விகிதத்தை இரட்டிப்பாக்க வேண்டும்." }
    ]
  },
  "Helen Keller's Light": {
    question: "What was the crucial turning point in Helen Keller's educational journey?",
    questionTamil: "ஹெலன் கெல்லரின் கல்விப் பயணத்தில் மிக முக்கியமான திருப்புமுனையாக அமைந்தது எது?",
    options: [
      { key: "wrong-1", text: "Moving to a larger house with a water well in the garden.", textTamil: "தோட்டதில் கிணறு உள்ள ஒரு பெரிய வீட்டிற்கு குடிபெயர்ந்தது." },
      { key: "correct", text: "Understanding the connection between physical water and the spelled word W-A-T-E-R.", textTamil: "உண்மையான நீருக்கும், உள்ளங்கையில் எழுதப்பட்ட W-A-T-E-R என்ற வார்த்தைக்கும் உள்ள தொடர்பைப் புரிந்துகொண்டது." },
      { key: "wrong-2", text: "Learning how to navigate the blind school without a cane.", textTamil: "உதவிக் கோல் இல்லாமல் கண் தெரியாதோர் பள்ளியில் நடக்கக் கற்றுக்கொண்டது." }
    ]
  },
  "The Man Who Knew Infinity": {
    question: "Which of the following aligns with Srinivasa Ramanujan's philosophy on mathematical equations?",
    questionTamil: "கணித சமன்பாடுகள் குறித்த சீனிவாச இராமானுஜனின் கொள்கையோடு ஒத்துப்போவது எது?",
    options: [
      { key: "correct", text: "An equation has no meaning unless it expresses a thought of God.", textTamil: "ஒரு சமன்பாடு என்பது இறைவனின் சிந்தனையை வெளிப்படுத்தாவிட்டால் அதற்குப் பொருளே இல்லை." },
      { key: "wrong-1", text: "A number is only interesting if it helps purchase commercial properties.", textTamil: "வியாபாரத்திற்காகப் பயன்பட்டால் மட்டுமே ஒரு எண் சுவாரஸ்யமானது." },
      { key: "wrong-2", text: "Perseverance is unnecessary if you are naturally talented in mathematics.", textTamil: "கணிதத்தில் திறமை இருந்தால் விடாமுயற்சி தேவைப்படாது." }
    ]
  },
  "Raja Raja Chola's Crown": {
    question: "Why did Arulmozhi Varman (Raja Raja Chola) initially refuse the Chola crown?",
    questionTamil: "அருண்மொழிவர்மன் (ராஜராஜ சோழன்) ஆரம்பத்தில் சோழ மகுடத்தை ஏன் ஏற்க மறுத்தார்?",
    options: [
      { key: "wrong-1", text: "He preferred to build temples rather than rule the empire.", textTamil: "நாட்டை ஆள்வதை விட கோயில்களைக் கட்டவே அவர் விரும்பினார்." },
      { key: "correct", text: "He respected family hierarchy, choosing to crown his elder uncle Uttama Chola first.", textTamil: "அவர் குடும்ப நெறிமுறைகளை மதித்து, தனது பெரியப்பா உத்தம சோழனுக்கு முதலில் மகுடம் சூட்ட விரும்பினார்." },
      { key: "wrong-2", text: "He feared the responsibility of leading the Chola naval ships.", textTamil: "சோழ கடற்படையை வழிநடத்தும் பொறுப்புக்கு அவர் பயந்தார்." }
    ]
  },
  "The Trial of Socrates": {
    question: "What core philosophical belief did Socrates defend during his court trial?",
    questionTamil: "நீதிமன்ற விசாரணையின் போது சாக்ரடீஸ் பாதுகாத்த முக்கிய தத்துவக் கொள்கை எது?",
    options: [
      { key: "correct", text: "The unexamined life is not worth living, and truth must be spoken without fear.", textTamil: "ஆராயப்படாத வாழ்க்கை வாழ்வதற்கு தகுதியற்றது, உண்மையை அச்சமின்றி பேச வேண்டும்." },
      { key: "wrong-1", text: "Rulers must always be obeyed blindly to maintain order in Athens.", textTamil: "ஏதென்ஸில் ஒழுங்கை நிலைநாட்ட ஆட்சியாளர்களுக்கு எப்போதும் கண்மூடித்தனமாக கீழ்ப்படிய வேண்டும்." },
      { key: "wrong-2", text: "Hemlock poison has a sweet taste that cures all physical illnesses.", textTamil: "ஹெம்லாக் விஷம் என்பது உடலின் அனைத்து நோய்களையும் குணப்படுத்தும் ஒரு மருந்து." }
    ]
  },
  "Marie Curie's Isolation": {
    question: "What did Marie Curie's work in the drafty wooden shed demonstrate?",
    questionTamil: "மரக் கொட்டகையில் மேரி கியூரியின் கடின உழைப்பு எதை நிரூபித்தது?",
    options: [
      { key: "wrong-1", text: "Paris has the best weather for conducting scientific experiments.", textTamil: "அறிவியல் பரிசோதனைகளை மேற்கொள்ள பாரிஸ் சிறந்த வானிலை கொண்டது." },
      { key: "correct", text: "Relentless dedication and passion can isolate radium even under terrible conditions.", textTamil: "கடுமையான சூழ்நிலையிலும் விடாமுயற்சியும் ஆர்வமும் இருந்தால் ரேடியத்தைப் பிரித்தெடுக்க முடியும்." },
      { key: "wrong-2", text: "Pure radium glows because it is heated by coal furnaces.", textTamil: "தூய ரேடியம் நிலக்கரி அடுப்புகளால் சூடாக்கப்படுவதால் ஒளிர்கிறது." }
    ]
  },
  "Ali Cogia's Olives": {
    question: "How was the merchant's theft of Ali Cogia's gold coins exposed?",
    questionTamil: "அலி கோஜியாவின் தங்க நாணயங்கள் திருடப்பட்டது எவ்வாறு அம்பலமானது?",
    options: [
      { key: "wrong-1", text: "By counting the number of gold coins left inside the temple treasury.", textTamil: "கோயில் கருவூலத்தில் மீதமுள்ள தங்க நாணயங்களை எண்ணியதன் மூலம்." },
      { key: "correct", text: "By consulting olive merchants who proved the olives were fresh, not years old.", textTamil: "ஆலிவ் பழங்கள் புதியவை, பல வருடங்கள் பழமையானவை அல்ல என்று ஆலிவ் வியாபாரிகள் நிரூபித்ததன் மூலம்." },
      { key: "wrong-2", text: "By checking the seal on the olive jar with magnifying glasses.", textTamil: "பூதக்கண்ணாடி மூலம் ஆலிவ் ஜாடியின் முத்திரையை சரிபார்த்ததன் மூலம்." }
    ]
  },
  "Sir CV Raman's Ocean": {
    question: "What led C.V. Raman to discover why the sea is deep blue?",
    questionTamil: "கடல் ஏன் நீல நிறமாக இருக்கிறது என்பதைக் கண்டறிய சி.வி.ராமனுக்கு உதவியது எது?",
    options: [
      { key: "correct", text: "His refusal to accept Lord Rayleigh's sky reflection theory, testing it with a pocket instrument.", textTamil: "வானத்தின் பிரதிபலிப்பு என்ற பழைய கூற்றை ஏற்காமல், எளிய கருவி கொண்டு சோதித்தது." },
      { key: "wrong-1", text: "The bright reflection of sunlight from the clouds over the Mediterranean Sea.", textTamil: "மத்திய தரைக்கடலில் மேகங்களிலிருந்து வந்த பிரகாசமான சூரிய ஒளி." },
      { key: "wrong-2", text: "Diving into the ocean to collect samples of blue algae.", textTamil: "நீல பாசிகளை சேகரிக்க கடலுக்குள் மூழ்கி ஆராய்ந்தது." }
    ]
  }
};

const fallbackQuiz = {
  question: "What is the primary moral value illustrated in this chapter?",
  questionTamil: "இந்த அத்தியாயம் விளக்கும் முதன்மை ஒழுக்கநெறி மதிப்பு என்ன?",
  options: [
    { key: "correct", text: "Perseverance, honesty, and moral duty lead to meaningful success.", textTamil: "விடாமுயற்சி, நேர்மை மற்றும் ஒழுக்கக் கடமை ஆகியவை அர்த்தமுள்ள வெற்றிக்கு வழிவகுக்கும்." },
    { key: "wrong-1", text: "Success is determined entirely by luck and external factors.", textTamil: "வெற்றி என்பது முற்றிலும் அதிர்ஷ்டம் மற்றும் வெளிப்புற காரணிகளால் தீர்மானிக்கப்படுகிறது." },
    { key: "wrong-2", text: "Taking shortcuts is acceptable if it helps achieve goals faster.", textTamil: "இலக்குகளை விரைவாக அடைய குறுக்குவழிகளைப் பயன்படுத்துவது ஏற்றுக்கொள்ளத்தக்கது." }
  ]
};



export default function StoryBooksPage() {
  const { data: session, status } = useSession();
  const [books, setBooks] = useState<StoryBook[]>([]);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Extract student class from session if available, default to "6"
  const studentClassStr = (session?.user as any)?.class || "6";


  // Reader Flow Stages
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [isBookOpened, setIsBookOpened] = useState(false); // Controls opening hardcover animation
  
  // Navigation Index
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Monolingual Toggle (English ONLY or Tamil ONLY - No interleaved bilingual clutter)
  const [readerMode, setReaderMode] = useState<"english" | "tamil">("english");
  
  // Custom Typography & Layout Settings
  const [themeMode, setThemeMode] = useState<"day" | "sepia" | "night">("day");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl">("md");
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showVocabDrawer, setShowVocabDrawer] = useState(false);

  // Floating Glossary Card Trigger
  const [activeLookupWord, setActiveLookupWord] = useState<any | null>(null);
  const [lookupCardPos, setLookupCardPos] = useState({ x: 0, y: 0 });
  const [savedWords, setSavedWords] = useState<string[]>([]);

  // Text-To-Speech (TTS) Narration States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Moral Check Quiz Reflection Challenge
  const [showMoralQuiz, setShowMoralQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Responsive device width listener (tablet/mobile anchor toggle)
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsTabletOrMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch all books with reading progress
  async function fetchBooks() {
    if (status === "loading") return;
    const studentId = (session?.user as any)?.id || "demo-student";
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/stories?studentId=${studentId}`);
      const json = await res.json();
      if (json.success) {
        setBooks(json.data);
      }
    } catch (err) {
      console.error("Error loading library books:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Load Saved Words Notebook from Session Storage on startup
  useEffect(() => {
    fetchBooks();
    const stored = localStorage.getItem("tn_saved_vocabulary");
    if (stored) {
      setSavedWords(JSON.parse(stored));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);


  // Save vocabulary item
  const handleSaveWord = (word: string) => {
    if (savedWords.includes(word)) {
      Swal.fire({
        title: "Already Saved",
        text: `"${word}" is already in your vocabulary notebook!`,
        icon: "info",
        confirmButtonColor: "#0891b2"
      });
      return;
    }
    const updated = [...savedWords, word];
    setSavedWords(updated);
    localStorage.setItem("tn_saved_vocabulary", JSON.stringify(updated));
    Swal.fire({
      title: "Saved! 📓",
      html: `Added <b>"${word}"</b> to your Vocabulary Notebook.`,
      icon: "success",
      toast: true,
      position: "top-end",
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleRemoveWord = (word: string) => {
    const updated = savedWords.filter(w => w !== word);
    setSavedWords(updated);
    localStorage.setItem("tn_saved_vocabulary", JSON.stringify(updated));
  };

  // Open Book hard-cover view
  const handleOpenBookIntro = async (bookId: string) => {
    const studentId = (session?.user as any)?.id || "demo-student";
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/stories/${bookId}?studentId=${studentId}`);
      const json = await res.json();
      if (json.success) {
        setSelectedBook(json.data);
        setIsBookOpened(false); // Cover stays closed until click
        
        // Find index corresponding to saved progress
        const savedChapter = json.data.progress?.currentChapter || 1;
        const savedPage = json.data.progress?.currentPage || 1;

        let chIdx = 0;
        let pgIdx = 0;
        json.data.chapters.forEach((ch: any, cIdx: number) => {
          if (ch.chapterNumber === savedChapter) {
            chIdx = cIdx;
            ch.pages.forEach((pg: any, pIdx: number) => {
              if (pg.pageNumber === savedPage) {
                pgIdx = pIdx;
              }
            });
          }
        });

        setActiveChapterIndex(chIdx);
        setActivePageIndex(pgIdx);
        setShowMoralQuiz(false);
        setSelectedAnswer(null);
        setActiveLookupWord(null);
        handleStopSpeech();
      }
    } catch (err) {
      Swal.fire("Error", "Could not load book content", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Clean Stop TTS Speech
  const handleStopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveSentenceIdx(-1);
    currentUtteranceRef.current = null;
  };

  // Close Book reader
  const handleCloseBook = () => {
    handleStopSpeech();
    setSelectedBook(null);
    setIsBookOpened(false);
    fetchBooks();
  };

  // Resolve current active elements
  const currentChapter = selectedBook?.chapters[activeChapterIndex];
  const currentPage = currentChapter?.pages[activePageIndex];

  // Resolve total page sequence inside story
  const allPagesInBook: { page: Page; chapterNum: number; chapterTitle: string; pageIndex: number; chapterIndex: number }[] = [];
  selectedBook?.chapters.forEach((ch: any, cIdx: number) => {
    ch.pages.forEach((pg: any, pIdx: number) => {
      allPagesInBook.push({
        page: pg,
        chapterNum: ch.chapterNumber,
        chapterTitle: ch.title,
        pageIndex: pIdx,
        chapterIndex: cIdx
      });
    });
  });

  const currentPageIndexInBook = allPagesInBook.findIndex(
    item => item.page.id === currentPage?.id
  );

  // Set reader mode to English or Tamil
  const handleToggleLanguage = (mode: "english" | "tamil") => {
    handleStopSpeech();
    setReaderMode(mode);
    setActiveLookupWord(null);
  };

  // Navigate forward & save progress
  const handleNextPage = async () => {
    if (!selectedBook) return;
    handleStopSpeech();
    setActiveLookupWord(null);

    // If final page, open Quiz Reflection challenge
    if (currentPageIndexInBook === allPagesInBook.length - 1) {
      if (selectedBook.progress?.completed) {
        handleCloseBook();
      } else {
        setShowMoralQuiz(true);
      }
      return;
    }

    const nextItem = allPagesInBook[currentPageIndexInBook + 1];
    setActiveChapterIndex(nextItem.chapterIndex);
    setActivePageIndex(nextItem.pageIndex);

    // Save Progress to Backend
    const progressPercent = Math.round(((currentPageIndexInBook + 2) / allPagesInBook.length) * 100);
    const studentId = (session?.user as any)?.id || "demo-student";
    
    await fetch(`${API_BASE}/api/stories/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        storyBookId: selectedBook.id,
        currentChapter: nextItem.chapterNum,
        currentPage: nextItem.page.pageNumber,
        completed: false,
        progressPercent
      })
    });
  };

  const handlePrevPage = () => {
    if (currentPageIndexInBook <= 0) return;
    handleStopSpeech();
    setActiveLookupWord(null);

    const prevItem = allPagesInBook[currentPageIndexInBook - 1];
    setActiveChapterIndex(prevItem.chapterIndex);
    setActivePageIndex(prevItem.pageIndex);
  };

  // Confetti Animation Canvas Trigger
  const triggerConfetti = () => {
    const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: any[] = [];
    const colors = ["#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];
    
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.6) * 16 - 8,
        r: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6
      });
    }
    
    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      
      particles.forEach((p) => {
        if (p.alpha > 0) {
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.25; // gravity
          p.vx *= 0.98; // drag
          p.alpha -= 0.008;
          
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
          ctx.restore();
          
          p.rotation += p.rotationSpeed;
        }
      });
      
      if (active) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    
    render();
  };

  // Submit Moral Challenge Quiz
  const handleSubmitMoralQuiz = async () => {
    if (!selectedBook) return;

    if (selectedAnswer !== "correct") {
      Swal.fire({
        title: "Think again! 🤔",
        text: "Read the options closely and choose the true moral message of the story.",
        icon: "warning",
        confirmButtonColor: "#0891b2"
      });
      return;
    }

    // Success! Story completed
    const studentId = (session?.user as any)?.id || "demo-student";
    try {
      const res = await fetch(`${API_BASE}/api/stories/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          storyBookId: selectedBook.id,
          currentChapter: selectedBook.chapters[selectedBook.chapters.length - 1].chapterNumber,
          currentPage: currentChapter.pages[currentChapter.pages.length - 1].pageNumber,
          completed: true,
          progressPercent: 100
        })
      });
      const json = await res.json();
      if (json.success) {
        // Trigger Canvas Confetti
        triggerConfetti();
        
        Swal.fire({
          title: "Outstanding Achievement! 🏆✨",
          html: `<div class="space-y-3 py-2">
            <p class="font-bold text-slate-800 dark:text-slate-100 text-base">You have completed "${selectedBook.title}"!</p>
            <div class="bg-cyan-50 dark:bg-cyan-950/30 p-3 rounded-2xl border border-cyan-200/50">
               <span class="block text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">Rewards Claimed</span>
               <span class="block text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">+${selectedBook.xpReward} XP Gained! 📚</span>
            </div>
            <p class="text-xs text-slate-450 mt-1">Excellent work reading with focus and looking up new words!</p>
          </div>`,
          icon: "success",
          confirmButtonColor: "#0891b2",
          confirmButtonText: "Return to Library"
        }).then(() => {
          handleCloseBook();
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Word Click/Tap Lookup Processor
  const handleWordLookup = (cleanWord: string, originalWord: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const parentContainer = event.currentTarget.closest(".reading-page-content");
    const parentRect = parentContainer?.getBoundingClientRect();

    const lookupData = glossary[cleanWord];
    if (lookupData) {
      setActiveLookupWord({
        word: originalWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ""),
        ...lookupData
      });
      // Floating card location relative to page container
      setLookupCardPos({
        x: rect.left - (parentRect?.left || 0) + (rect.width / 2) - 130, // center on word
        y: rect.top - (parentRect?.top || 0) - 150 // float above word
      });
    }
  };

  // Interactive English Text Word Parsing
  const renderInteractiveText = (text: string) => {
    const tokens = text.split(/(\s+)/);
    return tokens.map((token, idx) => {
      if (token.trim() === "") {
        return <span key={idx}>{token}</span>;
      }
      const cleanWord = token.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
      
      const inGlossary = !!glossary[cleanWord];
      
      if (inGlossary) {
        return (
          <span 
            key={idx}
            onClick={(e) => handleWordLookup(cleanWord, token, e)}
            className="cursor-pointer border-b border-dashed border-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/5 transition-all px-0.5 rounded font-semibold select-none text-[15px] md:text-[17px] leading-relaxed"
            title="Click to define and translate"
          >
            {token}
          </span>
        );
      }
      return <span key={idx} className="text-[15px] md:text-[17px] leading-relaxed">{token}</span>;
    });
  };

  // TTS Narrator
  const handleTTSPlay = () => {
    const text = readerMode === "english" ? currentPage?.contentEnglish : currentPage?.contentTamil;
    if (!text) return;

    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    handleStopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Voice Selector
    const voices = window.speechSynthesis.getVoices();
    if (readerMode === "tamil") {
      utterance.lang = "ta-IN";
      const taVoice = voices.find(v => v.lang.toLowerCase().startsWith("ta") || v.name.toLowerCase().includes("tamil"));
      if (taVoice) utterance.voice = taVoice;
    } else {
      utterance.lang = "en-US";
      const enVoice = voices.find(v => v.lang.includes("en") && (v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Natural")));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.rate = speechRate;

    // Sentence highlight handler
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    let charAccumulator = 0;
    const sentenceRanges = sentences.map((s: string) => {
      const start = charAccumulator;
      const end = charAccumulator + s.length;
      charAccumulator += s.length;
      return { start, end };
    });


    utterance.onboundary = (event) => {
      if (event.name === "sentence" || event.name === "word") {
        const charIndex = event.charIndex;
        const idx = sentenceRanges.findIndex((r: { start: number; end: number }) => charIndex >= r.start && charIndex < r.end);
        if (idx !== -1) {
          setActiveSentenceIdx(idx);
        }
      }
    };


    utterance.onend = () => {
      handleStopSpeech();
    };

    utterance.onerror = () => {
      handleStopSpeech();
    };

    currentUtteranceRef.current = utterance;
    setIsSpeaking(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleTTSPause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleSpeechRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    if (isSpeaking && !isPaused) {
      // Re-trigger speech synthesis to apply rate changes immediately
      handleTTSPlay();
    }
  };

  // Resolve current active theme styles
  const activeTheme = themes[themeMode];

  // Resolve custom typography values
  const fontStyleClass = fontFamily === "serif" ? "font-serif" : "font-sans";
  const fontSizeStyle = 
    fontSize === "sm" ? "text-sm md:text-base" :
    fontSize === "lg" ? "text-lg md:text-xl" :
    fontSize === "xl" ? "text-xl md:text-2xl" :
    "text-base md:text-lg"; // default md

  // Filtered bookshelf catalog - strictly display books matching the student's grade level
  const filteredBooks = books.filter(b => {
    const matchFilter = filter === "All" || b.genre === filter;
    const matchClass = b.gradeLevel === studentClassStr;
    const matchSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        b.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchClass && matchSearch;
  });

  // Resolve unique categories available for the student's class
  const classBooks = books.filter(b => b.gradeLevel === studentClassStr);
  const availableGenres = books.length > 0 
    ? ["All", ...Array.from(new Set(classBooks.map(b => b.genre)))] 
    : ["All", "Biography", "Classics", "Science"];

  // If active filter is no longer available, reset to "All"
  useEffect(() => {
    if (books.length > 0) {
      const classBooks = books.filter(b => b.gradeLevel === studentClassStr);
      const genres = ["All", ...Array.from(new Set(classBooks.map(b => b.genre)))];
      if (!genres.includes(filter)) {
        setFilter("All");
      }
    }
  }, [books, studentClassStr, filter]);




  return (
    <PortalLayout
      title="Interactive Digital Library"
      subtitle="Deep moral literature & biographies for young scholars. Earn XP and level up your comprehension!"
      avatarLetter="A"
      avatarColor="#0891b2"
      themeClass="theme-student"
      accentColor="#0891b2"
    >
      {/* Canvas for full-screen confetti */}
      <canvas id="confetti-canvas" className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

      {/* Main Container */}
      <div className="relative">
        
        {/* Navigation Breadcrumb (Only show when catalog is open) */}
        {!selectedBook && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-md shadow-slate-100/10">
                <span className="text-2xl">📖</span>
                <div>
                   <span className="block text-[9px] uppercase font-bold text-slate-400 leading-none">Scholar Reading Level</span>
                   <span className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">Avid Reader (Level 4)</span>
                </div>
             </div>
          </div>
        )}

        {/* VIEW 1: REGULAR CATALOG BOOKS CATALOG */}
        {!selectedBook && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            
            {/* Sidebar Left Filters */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="hidden lg:block bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Categories</h3>
                  <div className="space-y-1.5">
                    {availableGenres.map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                          filter === cat 
                            ? "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/30" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
              </div>

              {/* Saved Words Panel */}
              <div className="hidden lg:block bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                       <BookMarked className="w-4 h-4 text-cyan-600" />
                       <span>My Glossary</span>
                    </h3>
                    <span className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full text-[10px] font-black">
                      {savedWords.length}
                    </span>
                  </div>
                  
                  {savedWords.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic leading-relaxed">
                      Double-click on difficult words inside any book to view translation/meanings and save them here!
                    </p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {savedWords.map((word) => (
                        <div key={word} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
                          <div>
                            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 font-serif">{word}</span>
                            <span className="block text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">{glossary[word.toLowerCase()]?.tamil || "Definition saved"}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveWord(word)} 
                            className="p-1 text-slate-350 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            title="Remove word"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Statistics Panel */}
              <div className="hidden lg:block bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Comprehension Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-900">
                       <span className="block text-[9px] uppercase font-bold text-slate-400">Completed</span>
                       <span className="block text-lg font-black text-cyan-600 dark:text-cyan-400 mt-1">
                         {books.filter(b => b.completed).length}
                       </span>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-900">
                       <span className="block text-[9px] uppercase font-bold text-slate-400">XP Accumulated</span>
                       <span className="block text-lg font-black text-amber-500 mt-1">
                         {books.filter(b => b.completed).reduce((sum, b) => sum + b.xpReward, 0)} XP
                       </span>
                     </div>
                  </div>
              </div>

            </div>


            {/* Books Shelf Grid */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                 <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">

                   <span>📚</span> Classic Literature & Biographies Catalog
                 </h2>
                 <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search literature titles, authors..." 
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all font-medium"
                    />
                 </div>
              </div>

              {/* Mobile Categories Scroll Filter */}
              <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-1.5 select-none scrollbar-none">
                 {availableGenres.map((cat) => {
                   const isActive = filter === cat;
                   return (
                     <button
                       key={cat}
                       onClick={() => setFilter(cat)}
                       className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap border ${
                         isActive
                           ? "bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-600/10"
                           : "bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                       }`}
                     >
                       {cat}
                     </button>
                   );
                 })}
              </div>



              {isLoading ? (
                <div className="text-center py-32 text-xs text-slate-400 flex flex-col items-center gap-3">
                  <div className="w-9 h-9 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-semibold text-slate-500">Opening Tamil Nadu smart digital library shelf...</span>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-450 text-xs font-semibold">
                  No books matching current criteria. Explore other categories!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                   {filteredBooks.map((book) => (
                     <div 
                       key={book.id} 
                       onClick={() => handleOpenBookIntro(book.id)}
                       className="bg-white dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all group flex flex-col h-full cursor-pointer shadow-sm relative overflow-hidden"
                     >
                        {/* Realistic Cover Graphics */}
                        <div className={`w-full aspect-[16/11] rounded-2xl bg-gradient-to-br ${book.color} flex flex-col items-center justify-center relative overflow-hidden shadow-md mb-4`}>
                           {/* Textured Overlay */}
                           <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
                           <div className="absolute inset-0 border-l border-white/20 shadow-inner"></div>
                           <div className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">{book.cover}</div>
                           
                           {/* Class Level Badge */}
                           {book.gradeLevel && (
                             <div className="absolute bottom-2.5 left-2.5 bg-cyan-600/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black uppercase text-white tracking-widest leading-none">
                                Class {book.gradeLevel}
                             </div>
                           )}

                           {/* Label Tag */}
                           <div className="absolute bottom-2.5 right-2.5 bg-black/35 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase text-white tracking-widest leading-none">
                              {book.genre}
                           </div>

                           {book.completed && (
                             <div className="absolute top-2.5 right-2.5 w-7 h-7 bg-cyan-600 rounded-full flex items-center justify-center text-white text-xs border border-white/50 shadow-md font-bold">
                               ✓
                             </div>
                           )}
                        </div>

                        {/* Title Info */}
                        <div className="flex-1 flex flex-col justify-between">
                           <div>
                             <h3 className="font-serif font-black text-slate-800 dark:text-slate-100 text-base leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                               {book.title}
                             </h3>
                             <p className="text-[11px] text-slate-400 font-bold mt-1.5">By {book.author}</p>
                           </div>
                           
                           <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                              <div className="flex justify-between items-end mb-1 text-[10px]">
                                 <span className="font-bold text-slate-400">
                                   {book.progress === 0 ? "Unread" : book.progress === 100 ? "Completed" : "In Progress"}
                                 </span>
                                 {book.progress > 0 && <span className="text-cyan-600 dark:text-cyan-400 font-black">{book.progress}%</span>}
                              </div>
                              
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <div 
                                   className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300" 
                                   style={{ width: `${book.progress}%` }}
                                 ></div>
                              </div>
                              
                              <div className="mt-2.5 flex items-center justify-between text-[9px] font-bold text-slate-400">
                                 <span>{book.totalChapters} Chapters</span>
                                 <span className="text-amber-500 flex items-center gap-0.5">
                                   <Award className="w-3 h-3" /> +{book.xpReward} XP
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {/* Mobile Stats & Glossary panels at the bottom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:hidden mt-8">
                 {/* Saved Words Panel */}
                 <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                     <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                       <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <BookMarked className="w-4 h-4 text-cyan-600" />
                          <span>My Glossary</span>
                       </h3>
                       <span className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full text-[10px] font-black">
                         {savedWords.length}
                       </span>
                     </div>
                     
                     {savedWords.length === 0 ? (
                       <p className="text-[11px] text-slate-400 italic leading-relaxed">
                         Double-click on difficult words inside any book to view translation/meanings and save them here!
                       </p>
                     ) : (
                       <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                         {savedWords.map((word) => (
                           <div key={word} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
                             <div>
                               <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 font-serif">{word}</span>
                               <span className="block text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">{glossary[word.toLowerCase()]?.tamil || "Definition saved"}</span>
                             </div>
                             <button 
                               onClick={() => handleRemoveWord(word)} 
                               className="p-1 text-slate-350 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                               title="Remove word"
                             >
                               <X className="w-3 h-3" />
                             </button>
                           </div>
                         ))}
                       </div>
                     )}
                 </div>

                 {/* Statistics Panel */}
                 <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                     <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Comprehension Stats</h3>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-900">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Completed</span>
                          <span className="block text-lg font-black text-cyan-600 dark:text-cyan-400 mt-1">
                            {books.filter(b => b.completed).length}
                          </span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-center border border-slate-100 dark:border-slate-900">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">XP Accumulated</span>
                          <span className="block text-lg font-black text-amber-500 mt-1">
                            {books.filter(b => b.completed).reduce((sum, b) => sum + b.xpReward, 0)} XP
                          </span>
                        </div>
                     </div>
                 </div>
              </div>

            </div>


          </div>
        )}

        {/* VIEW 2: BOOK COVER INTRO VIEW (CLOSED BOOK) */}
        {selectedBook && !isBookOpened && (
          <div className="max-w-2xl mx-auto py-12 animate-in zoom-in duration-300">
            <div className={`rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-2xl overflow-hidden`}>
              <div className={`bg-gradient-to-br ${selectedBook.color} p-12 text-center text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                <div className="absolute -left-20 -top-20 w-56 h-56 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute -right-20 -bottom-20 w-56 h-56 bg-black/10 rounded-full blur-2xl"></div>
                
                <button 
                  onClick={handleCloseBook}
                  className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/35 rounded-xl text-white transition-colors border border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-8xl mb-6 select-none animate-bounce">{selectedBook.cover}</div>
                <h1 className="text-3xl font-serif font-black tracking-tight drop-shadow-md leading-tight mb-2">
                  {selectedBook.title}
                </h1>
                <p className="text-xs uppercase tracking-widest font-black text-white/80">
                  Written by {selectedBook.author}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 space-y-6 text-slate-700 dark:text-slate-300 text-xs">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-900">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 leading-none">Genre</span>
                    <span className="block text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">{selectedBook.genre}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-900">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 leading-none">XP Reward</span>
                    <span className="block text-sm font-extrabold text-amber-500 mt-1">+{selectedBook.xpReward} XP</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-900">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 leading-none">Reading Mode</span>
                    <span className="block text-sm font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">Bilingual</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Introduction & Objectives</h3>
                  <p className="text-[12px] leading-relaxed text-slate-650 font-medium">
                     Explore these professional stories which are part of your literature curriculum. Learn vocabulary terms in English with instant pronunciations, Tamil meanings, and complete audio narration to develop advanced linguistic skills.
                  </p>
                </div>

                {selectedBook.progress?.completed && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                     <span className="text-xl">🏆</span>
                     <p className="font-bold">You completed reading this book and claimed its XP rewards!</p>
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    onClick={() => setIsBookOpened(true)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold py-3.5 rounded-2xl shadow-xl shadow-cyan-600/20 hover:shadow-cyan-600/30 text-sm active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Book & Start Reading</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ACTIVE BOOK READER VIEW */}
        {selectedBook && isBookOpened && (
          <div className={`min-h-[640px] rounded-3xl border transition-all duration-300 relative flex flex-col justify-between overflow-hidden shadow-2xl ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text}`}>
            
            {/* 1. Header Toolbar */}
            <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${activeTheme.border} bg-black/5 dark:bg-white/5`}>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCloseBook}
                  className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all"
                  title="Close book"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div>
                   <h2 className="text-sm md:text-base font-serif font-black tracking-tight leading-tight flex items-center gap-2">
                      <span className="select-none">{selectedBook.cover}</span>
                      <span>{selectedBook.title}</span>
                   </h2>
                   <div className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-60">
                      Chapter {currentChapter?.chapterNumber}: {currentChapter?.title} · Page {currentPage?.pageNumber}
                   </div>
                </div>
              </div>

              {/* Toolbar Actions */}
              <div className="flex items-center gap-2">
                {/* Language Switch Toggle */}
                {!showMoralQuiz && (
                  <div className="flex items-center bg-black/10 dark:bg-white/15 p-0.5 rounded-xl border border-black/5 dark:border-white/5">
                    <button
                      onClick={() => handleToggleLanguage("english")}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all tracking-wider ${
                        readerMode === "english" 
                          ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" 
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      English Only
                    </button>
                    <button
                      onClick={() => handleToggleLanguage("tamil")}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all tracking-wider ${
                        readerMode === "tamil" 
                          ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" 
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      தமிழ் மட்டும்
                    </button>
                  </div>
                )}

                {/* Settings Panel Toggle */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowSettingsDropdown(!showSettingsDropdown);
                      setShowVocabDrawer(false);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      showSettingsDropdown ? "bg-black/10 dark:bg-white/15" : "hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                    title="Formatting settings"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  
                  {/* Styling Customizer Settings Card */}
                  <AnimatePresence>
                    {showSettingsDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute right-0 mt-2.5 w-64 p-5 rounded-2xl border shadow-xl z-30 ${activeTheme.cardBg} ${activeTheme.border} ${activeTheme.text}`}
                      >
                         <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4 border-b pb-2 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                            <span>Reader Preferences</span>
                         </h4>

                         {/* Theme Selectors */}
                         <div className="space-y-3.5 text-[11px] font-bold">
                            <div className="space-y-1.5">
                               <label className="text-[9px] uppercase font-bold text-slate-400">Background Tone</label>
                               <div className="grid grid-cols-3 gap-2">
                                  {[
                                    { key: "day", label: "Day", icon: <Sun className="w-3 h-3 mr-1" /> },
                                    { key: "sepia", label: "Sepia", icon: <Smile className="w-3 h-3 mr-1" /> },
                                    { key: "night", label: "Night", icon: <Moon className="w-3 h-3 mr-1" /> }
                                  ].map(item => (
                                     <button
                                       key={item.key}
                                       onClick={() => setThemeMode(item.key as any)}
                                       className={`py-1.5 rounded-lg border flex items-center justify-center transition-all ${
                                         themeMode === item.key 
                                           ? "bg-cyan-500 text-white border-cyan-500 shadow-sm shadow-cyan-500/20" 
                                           : "border-slate-200 dark:border-slate-800 hover:bg-black/5 dark:hover:bg-white/5"
                                       }`}
                                     >
                                       {item.icon}
                                       <span>{item.label}</span>
                                     </button>
                                  ))}
                               </div>
                            </div>

                            {/* Font Family Selector */}
                            <div className="space-y-1.5">
                               <label className="text-[9px] uppercase font-bold text-slate-400 font-sans">Font Style</label>
                               <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => setFontFamily("serif")}
                                    className={`py-1.5 rounded-lg border font-serif text-sm transition-all ${
                                      fontFamily === "serif" 
                                        ? "bg-cyan-500 text-white border-cyan-500" 
                                        : "border-slate-200 dark:border-slate-800 hover:bg-black/5 dark:hover:bg-white/5"
                                    }`}
                                  >
                                    Elegant Serif
                                  </button>
                                  <button
                                    onClick={() => setFontFamily("sans")}
                                    className={`py-1.5 rounded-lg border font-sans text-xs transition-all ${
                                      fontFamily === "sans" 
                                        ? "bg-cyan-500 text-white border-cyan-500" 
                                        : "border-slate-200 dark:border-slate-800 hover:bg-black/5 dark:hover:bg-white/5"
                                    }`}
                                  >
                                    Modern Sans
                                  </button>
                               </div>
                            </div>

                            {/* Font Size Selector */}
                            <div className="space-y-1.5">
                               <label className="text-[9px] uppercase font-bold text-slate-400">Text Size</label>
                               <div className="flex items-center justify-between border rounded-lg p-1 border-slate-200 dark:border-slate-800">
                                  {["sm", "md", "lg", "xl"].map(size => (
                                     <button
                                       key={size}
                                       onClick={() => setFontSize(size as any)}
                                       className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${
                                         fontSize === size 
                                           ? "bg-cyan-500 text-white shadow-sm" 
                                           : "opacity-60 hover:opacity-100"
                                       }`}
                                     >
                                       {size}
                                     </button>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Vocabulary Notebook Drawer Trigger */}
                <button 
                  onClick={() => {
                    setShowVocabDrawer(!showVocabDrawer);
                    setShowSettingsDropdown(false);
                  }}
                  className={`p-2 rounded-xl transition-all relative ${
                    showVocabDrawer ? "bg-cyan-500/10 text-cyan-500" : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  title="Vocabulary notebook"
                >
                  <BookMarked className="w-4 h-4" />
                  {savedWords.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-600 rounded-full text-white text-[9px] flex items-center justify-center font-bold border border-white">
                      {savedWords.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Core Reading Interface */}
            <div className="flex-1 relative flex overflow-hidden">
               
               {/* Slide-out Vocabulary Notebook Drawer */}
               <AnimatePresence>
                 {showVocabDrawer && (
                   <motion.div 
                     initial={{ x: 300, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     exit={{ x: 300, opacity: 0 }}
                     transition={{ type: "spring", damping: 25, stiffness: 200 }}
                     className={`absolute right-0 top-0 bottom-0 w-80 border-l p-5 z-20 overflow-y-auto flex flex-col justify-between shadow-2xl ${activeTheme.cardBg} ${activeTheme.border} ${activeTheme.text}`}
                   >
                     <div>
                       <div className="flex justify-between items-center border-b pb-3 mb-4">
                          <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                             <BookMarked className="w-4 h-4 text-cyan-600" />
                             <span>Vocabulary Study</span>
                          </h3>
                          <button onClick={() => setShowVocabDrawer(false)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                             <X className="w-4 h-4" />
                          </button>
                       </div>

                       {/* Section A: Current Chapter Key Words */}
                       <div className="mb-6">
                         <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Current Chapter Words</h4>
                         <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                           {Object.keys(glossary)
                             .filter(w => {
                               const text = readerMode === "english" ? currentPage?.contentEnglish : currentPage?.contentTamil;
                               return text?.toLowerCase().includes(w);
                             })
                             .map(word => {
                               const item = glossary[word];
                               return (
                                 <div 
                                   key={word} 
                                   onClick={() => handleSaveWord(word.charAt(0).toUpperCase() + word.slice(1))}
                                   className="p-2.5 rounded-xl border bg-slate-50/50 dark:bg-black/10 border-slate-200/50 dark:border-slate-800 hover:border-cyan-500/30 transition-all cursor-copy text-[11px]"
                                 >
                                    <div className="flex justify-between items-start">
                                      <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide font-serif">{word}</span>
                                      <span className="text-[9px] text-cyan-600 dark:text-cyan-400 font-bold">{item.tamil}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-450 mt-1 italic font-medium leading-tight">{item.definition}</p>
                                 </div>
                               );
                             })}
                         </div>
                       </div>

                       {/* Section B: User Saved Notebook */}
                       <div>
                         <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Saved Words ({savedWords.length})</h4>
                         {savedWords.length === 0 ? (
                           <p className="text-[10px] text-slate-400 italic leading-relaxed">
                             No vocabulary saved in this session. Double-click text words to save.
                           </p>
                         ) : (
                           <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                             {savedWords.map(word => {
                               const item = glossary[word.toLowerCase()];
                               return (
                                 <div key={word} className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/20 text-[11px] relative group/item">
                                    <div className="flex justify-between items-start pr-4">
                                      <span className="font-extrabold text-slate-800 dark:text-slate-200 font-serif">{word}</span>
                                      {item && <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">{item.tamil}</span>}
                                    </div>
                                    {item && <p className="text-[10px] text-slate-450 mt-1 font-medium leading-tight">{item.definition}</p>}
                                    
                                    <button 
                                      onClick={() => handleRemoveWord(word)} 
                                      className="absolute right-2 top-2 p-1 text-slate-400 hover:text-red-500 rounded hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                      title="Remove"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                 </div>
                               );
                             })}
                           </div>
                         )}
                       </div>
                     </div>
                     
                     <div className="pt-4 border-t text-[10px] text-slate-400 text-center font-bold">
                       💡 Persists inside local storage
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* MAIN BOOK READING WRAPPER */}
               <div className="flex-1 p-6 md:p-10 flex flex-col justify-center max-w-4xl mx-auto w-full relative">
                  
                  {showMoralQuiz ? (
                    /* MORAL CHALLENGE CONTAINER */
                    <div className="text-center py-6 max-w-lg mx-auto w-full animate-in zoom-in duration-300 space-y-6">
                      <div className="w-16 h-16 bg-cyan-600/10 text-cyan-500 rounded-full flex items-center justify-center text-3xl mx-auto border border-cyan-500/20 shadow-md">
                        🏆
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black tracking-tight leading-tight">
                          {readerMode === "tamil" ? "நீதிநெறி சிந்தனை மதிப்பீடு" : "Moral Reflection Check"}
                        </h3>
                        <p className="text-[12px] opacity-70 leading-relaxed font-semibold">
                          {readerMode === "tamil" 
                            ? "உங்களது அறிவார்ந்த வெகுமதிகளைப் பெற, கேட்கப்படும் கேள்விக்குச் சரியாகப் பதிலளிக்கவும்!" 
                            : "Answer the challenge question correctly to claim your scholar rewards!"}
                        </p>
                      </div>

                      <div className="space-y-3.5 pt-4 text-xs text-left">
                        {(() => {
                          const quiz = bookQuizzes[selectedBook.title] || fallbackQuiz;
                          return (
                            <div className="space-y-4">
                              <p className={`font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-snug border-b pb-2 ${readerMode === "tamil" ? "font-tamil" : "font-serif"}`}>
                                {readerMode === "tamil" ? quiz.questionTamil : quiz.question}
                              </p>
                              {quiz.options.map((ans, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedAnswer(ans.key)}
                                  className={`w-full p-4 rounded-2xl border text-left font-bold transition-all flex items-start gap-3 ${
                                    selectedAnswer === ans.key
                                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-sm"
                                      : "bg-slate-50/50 dark:bg-black/20 border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  <span className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 shrink-0 text-center leading-5 text-[10px] font-black">{idx + 1}</span>
                                  <span className={`leading-snug ${readerMode === "tamil" ? "font-tamil font-medium text-slate-800 dark:text-slate-200" : "font-semibold"}`}>
                                    {readerMode === "tamil" ? ans.textTamil : ans.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="pt-6">
                        <button
                          onClick={handleSubmitMoralQuiz}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold px-8 py-3 rounded-2xl text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all w-full"
                        >
                          {readerMode === "tamil" 
                            ? `பதிலைச் சரிபார்த்து +${selectedBook.xpReward} XP பெறுக` 
                            : `Verify Answer & Claim +${selectedBook.xpReward} XP`}
                        </button>
                      </div>

                    </div>
                  ) : (
                    /* PAGE READING MODULE */
                    <div className="reading-page-content relative max-w-2xl mx-auto w-full">
                       
                       {/* Floating Glossary Tooltip Popover (Desktop / Tablet bottom sheet) */}
                       <AnimatePresence>
                         {activeLookupWord && (
                           <motion.div
                             initial={isTabletOrMobile ? { opacity: 0, y: 100 } : { opacity: 0, scale: 0.95, y: 5 }}
                             animate={isTabletOrMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
                             exit={isTabletOrMobile ? { opacity: 0, y: 100 } : { opacity: 0, scale: 0.95, y: 5 }}
                             style={isTabletOrMobile ? {} : { 
                               left: `${lookupCardPos.x}px`, 
                               top: `${lookupCardPos.y}px` 
                             }}
                             className={`z-50 p-4 rounded-2xl border shadow-2xl text-xs transition-all duration-300 ${
                               isTabletOrMobile 
                                 ? "fixed bottom-24 left-6 right-6 w-auto" 
                                 : "absolute w-72"
                             } ${activeTheme.cardBg} ${activeTheme.border} ${activeTheme.text}`}
                           >
                              <div className="flex justify-between items-start mb-2 border-b pb-1.5">
                                 <div>
                                   <span className="block font-black text-sm text-cyan-600 dark:text-cyan-400 font-serif leading-none">
                                      {activeLookupWord.word}
                                   </span>
                                   <span className="block text-[9px] text-slate-400 mt-1 font-mono">{activeLookupWord.ipa}</span>
                                 </div>
                                 <button 
                                   onClick={() => setActiveLookupWord(null)}
                                   className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md"
                                 >
                                   <X className="w-3.5 h-3.5" />
                                 </button>
                              </div>

                              <div className="space-y-2 font-sans font-medium text-[11px] leading-relaxed">
                                 <div>
                                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Tamil Meaning</span>
                                    <span className="block text-slate-800 dark:text-slate-100 font-bold font-tamil">{activeLookupWord.tamil}</span>
                                 </div>
                                 <div>
                                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Definition</span>
                                    <span className="block text-slate-650 dark:text-slate-350">{activeLookupWord.definition}</span>
                                 </div>
                                 <div className="pt-1.5 border-t border-slate-100 dark:border-slate-850 italic text-[10px] text-slate-450 leading-tight">
                                    " {activeLookupWord.example} "
                                 </div>
                                 
                                 <div className="pt-2 flex justify-between items-center gap-2">
                                    <button 
                                      onClick={() => handleSaveWord(activeLookupWord.word)}
                                      className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-1"
                                    >
                                       <BookMarked className="w-3.5 h-3.5" />
                                       <span>Save Word</span>
                                    </button>
                                 </div>
                              </div>
                           </motion.div>
                         )}
                       </AnimatePresence>

                       {/* Book Layout Spread Box */}
                       <div 
                         onClick={() => setActiveLookupWord(null)}
                         className={`rounded-3xl border p-6 md:p-10 ${activeTheme.pageBg} ${activeTheme.border} ${activeTheme.shadow}`}
                       >

                          {/* Illustration Top Frame */}
                          {currentPage?.illustration && (
                            <div className="text-center text-5xl py-4 mb-6 bg-slate-500/5 dark:bg-white/5 rounded-2xl max-w-xs mx-auto border border-black/5 dark:border-white/5 select-none tracking-widest relative">
                              {currentPage.illustration}
                              <div className="absolute -inset-0.5 rounded-2xl border border-dashed border-cyan-500/10 pointer-events-none"></div>
                            </div>
                          )}

                          {/* Content Paragraph Block */}
                          <div className={`max-w-xl mx-auto ${fontStyleClass} ${fontSizeStyle}`}>
                            
                            {/* 1. English Mode */}
                            {readerMode === "english" && (
                              <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center gap-1.5 opacity-40 select-none pb-2 border-b border-black/5 dark:border-white/5">
                                   <span className="text-[10px] font-black uppercase tracking-wider">🇬🇧 English Translation</span>
                                </div>
                                
                                <p className="leading-relaxed text-justify whitespace-pre-line select-text">
                                  {/* Split text into sentences for spoken highlight */}
                                  {(currentPage?.contentEnglish || "")
                                    .match(/[^.!?]+[.!?]+(\s|$)/g)
                                    ?.map((sentence: string, sIdx: number) => {
                                      const isSpokenSentence = isSpeaking && activeSentenceIdx === sIdx;

                                      return (
                                        <span 
                                          key={sIdx} 
                                          className={`transition-all duration-200 rounded px-0.5 ${
                                            isSpokenSentence ? "bg-amber-400/25 dark:bg-amber-500/20 font-semibold" : ""
                                          }`}
                                        >
                                          {renderInteractiveText(sentence)}
                                        </span>
                                      );
                                    }) || renderInteractiveText(currentPage?.contentEnglish || "")}
                                </p>
                                
                                <div className={`flex items-center gap-1 mt-6 text-[10px] font-bold ${activeTheme.subText} border-t pt-3 ${activeTheme.border}`}>
                                   <Info className="w-3.5 h-3.5 text-cyan-600" />
                                   <span>Vocabulary Help: Click underlined words for instant pronunciation and Tamil definitions.</span>
                                </div>
                              </div>
                            )}

                            {/* 2. Tamil Mode */}
                            {readerMode === "tamil" && (
                              <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center gap-1.5 opacity-40 select-none pb-2 border-b border-black/5 dark:border-white/5">
                                   <span className="text-[10px] font-black uppercase tracking-wider">🇮🇳 தமிழ் வடிவம் (Tamil Version)</span>
                                </div>
                                
                                <p className="leading-relaxed text-justify font-semibold whitespace-pre-line font-tamil tracking-wide">
                                  {/* Split sentences for spoken highlight */}
                                  {(currentPage?.contentTamil || "")
                                    .match(/[^.!?]+[.!?]+(\s|$)/g)
                                    ?.map((sentence: string, sIdx: number) => {
                                      const isSpokenSentence = isSpeaking && activeSentenceIdx === sIdx;

                                      return (
                                        <span 
                                          key={sIdx} 
                                          className={`transition-all duration-200 rounded px-0.5 ${
                                            isSpokenSentence ? "bg-amber-400/25 dark:bg-amber-500/20 text-cyan-600" : ""
                                          }`}
                                        >
                                          {sentence}
                                        </span>
                                      );
                                    }) || currentPage?.contentTamil}
                                </p>
                              </div>
                            )}

                          </div>
                       </div>
                    </div>
                  )}

               </div>

            </div>

            {/* 3. Footer Control Bars */}
            <div className={`p-4 border-t flex items-center justify-center ${activeTheme.border} bg-black/5 dark:bg-white/5`}>
              
              {/* Back / Navigation Buttons */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPageIndexInBook <= 0 || showMoralQuiz}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border ${
                    currentPageIndexInBook <= 0 || showMoralQuiz
                      ? "opacity-40 cursor-not-allowed" 
                      : "hover:bg-black/5 dark:hover:bg-white/5 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-[10px] font-black uppercase tracking-wider opacity-60">
                  Page {currentPageIndexInBook + 1} / {allPagesInBook.length}
                </div>

                <button
                  onClick={handleNextPage}
                  className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-xs font-black uppercase shadow-md shadow-cyan-500/10 transition-all active:scale-95"
                >
                  <span>{currentPageIndexInBook === allPagesInBook.length - 1 ? "Comprehend Story" : "Next Page"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </PortalLayout>
  );
}
