"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { FlatIcon } from "@/components/FlatIcon";

// ── BILINGUAL DATA ───────────────────────────────────────────────────────────

const CAREERS = [
  {
    id: "doctor",
    title: "Doctor / MBBS | மருத்துவர்",
    category: "Medical | மருத்துவம்",
    grad: "from-rose-500 to-red-600",
    soft: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-600 dark:text-rose-400",
    path: "NEET → MBBS → MD / MS | நீட் → எம்பிபிஎஸ் → எம்டி / எம்எஸ்",
    subjects: ["Biology | உயிரியல்", "Chemistry | வேதியியல்", "Physics | இயற்பியல்"],
    streams: ["Science"],
    exam: "NEET-UG | நீட் தேர்வு",
    examBody: "NTA (National Testing Agency) | தேசிய தேர்வு முகமை",
    duration: "5.5 years (MBBS) + PG optional | 5.5 ஆண்டுகள் + விருப்ப முதுகலை",
    salary: { entry: "₹6–12 LPA", mid: "₹15–30 LPA", senior: "₹40–80 LPA" },
    colleges: [
      "AIIMS (New Delhi / Madurai) | எய்ம்ஸ்",
      "JIPMER Puducherry | ஜிப்மர் புதுச்சேரி",
      "Madras Medical College | சென்னை மருத்துவக் கல்லூரி",
      "Stanley Medical College | ஸ்டான்லி மருத்துவக் கல்லூரி",
      "Government Kilpauk Medical College | கீழ்ப்பாக்கம் மருத்துவக் கல்லூரி"
    ],
    description: "Doctors diagnose, treat and prevent illness. From general practice to surgery, neurology, and paediatrics — medicine offers a deeply fulfilling lifelong career. / மருத்துவர்கள் நோய்களைக் கண்டறிந்து, சிகிச்சை அளித்து, தடுக்கிறார்கள். பொது மருத்துவம் முதல் அறுவை சிகிச்சை, நரம்பியல் மற்றும் குழந்தை மருத்துவம் வரை - மருத்துவம் ஒரு சிறந்த சேவை சார்ந்த வாழ்க்கையை வழங்குகிறது.",
    dailyLife: "Patient rounds, diagnosis, prescribing treatment, emergency duty, research. / நோயாளிகளைப் பார்த்தல், நோய் கண்டறிதல், சிகிச்சை பரிந்துரைத்தல், அவசரக்காலப் பணி, ஆராய்ச்சி.",
    topRecruiters: ["Government Hospitals | அரசு மருத்துவமனைகள்", "Apollo Hospitals | அப்பல்லோ", "Fortis", "AIIMS", "Private Practice | சொந்த கிளினிக்"],
    skills: ["Biology | உயிரியல்", "Chemistry | வேதியியல்", "Communication | தொடர்பு திறன்", "Decision-making under pressure | மன அழுத்தம் சமாளிக்கும் திறன்"],
    proTip: "Score 650+ in NEET. Start with NCERT Biology — it forms 70% of NEET questions. / நீட் தேர்வில் 650+ மதிப்பெண்கள் பெறவும். என்.சி.இ.ஆர்.டி உயிரியலுடன் தொடங்கவும் - இது நீட் கேள்விகளில் 70% ஆகும்.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "engineer",
    title: "Engineer | பொறியாளர்",
    category: "Engineering | பொறியியல்",
    grad: "from-blue-500 to-cyan-600",
    soft: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    path: "JEE / TNEA → B.Tech → M.Tech / MBA | ஜே.இ.இ / டி.என்.இ.ஏ → பி.டெக் → எம்.டெக் / எம்.பி.ஏ",
    subjects: ["Mathematics | கணிதம்", "Physics | இயற்பியல்", "Chemistry | வேதியியல்"],
    streams: ["Science"],
    exam: "JEE Main / JEE Advanced / TNEA | ஜே.இ.இ / டி.என்.இ.ஏ",
    examBody: "NTA / IIT Council / Anna University | அண்ணா பல்கலைக்கழகம்",
    duration: "4 years (B.Tech) | 4 ஆண்டுகள் (பி.டெக் / பி.இ)",
    salary: { entry: "₹4–10 LPA", mid: "₹12–25 LPA", senior: "₹30–80 LPA" },
    colleges: [
      "IIT Madras | ஐஐடி மெட்ராஸ்",
      "NIT Trichy | என்ஐடி திருச்சி",
      "Anna University | அண்ணா பல்கலைக்கழகம்",
      "CEG Chennai | கிண்டி பொறியியல் கல்லூரி",
      "PSG Tech Coimbatore | பிஎஸ்ஜி தொழில்நுட்பக் கல்லூரி"
    ],
    description: "Engineers design, build and maintain systems — from bridges to software. Tamil Nadu has 500+ engineering colleges and a booming IT and manufacturing sector. / பொறியாளர்கள் பாலங்கள் முதல் மென்பொருள் வரை பல்வேறு அமைப்புகளை வடிவமைத்து, உருவாக்கி, பராமரிக்கிறார்கள். தமிழகத்தில் 500-க்கும் மேற்பட்ட பொறியியல் கல்லூரிகள் மற்றும் வளர்ந்து வரும் தகவல் தொழில்நுட்பத் துறை உள்ளன.",
    dailyLife: "Design, coding, testing, team meetings, problem-solving, project reviews. / வடிவமைப்பு, குறியீட்டு முறை, சோதனை, குழு கூட்டங்கள், சிக்கல் தீர்த்தல், திட்ட ஆய்வுகள்.",
    topRecruiters: ["TCS | டி.சி.எஸ்", "Infosys | இன்போசிஸ்", "Wipro | விப்ரோ", "L&T | எல் & டி", "ISRO | இஸ்ரோ", "DRDO | டி.ஆர்.டி.ஓ", "FAANG"],
    skills: ["Mathematics | கணிதம்", "Physics | இயற்பியல்", "Logical reasoning | தர்க்கரீதியான பகுப்பாய்வு", "Coding | கணினி நிரலாக்கம்"],
    proTip: "Score 80%+ in 12th Board for TNEA. For JEE, focus on NCERT + coaching from Class 11. / 12 ஆம் வகுப்பு தேர்வில் 80%+ மதிப்பெண்கள் பெறவும். ஜே.இ.இ-க்கு 11-ஆம் வகுப்பு முதல் என்.சி.இ.ஆர்.டி மற்றும் சிறப்புப் பயிற்சியில் கவனம் செலுத்தவும்.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "ias",
    title: "IAS / IPS Officer | ஐ.ஏ.எஸ் / ஐ.பி.எஸ் அதிகாரி",
    category: "Civil Services | குடிமைப் பணிகள்",
    grad: "from-amber-500 to-orange-600",
    soft: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    path: "Any Degree → UPSC CSE → IAS/IPS Training | ஏதேனும் ஒரு பட்டம் → யு.பி.எஸ்.சி → ஐ.ஏ.எஸ்/ஐ.பி.எஸ் பயிற்சி",
    subjects: ["History | வரலாறு", "Polity | குடிமையியல்", "Geography | புவியியல்", "Economics | பொருளியல்"],
    streams: ["Science", "Commerce"],
    exam: "UPSC Civil Services Examination (CSE) | யு.பி.எஸ்.சி தேர்வு",
    examBody: "Union Public Service Commission (UPSC) | மத்திய அரசுப் பணியாளர் தேர்வாணையம்",
    duration: "3 years Degree + Prep (2–5 years) | 3 ஆண்டுகள் பட்டம் + தேர்வுத் தயாரிப்பு (2-5 ஆண்டுகள்)",
    salary: { entry: "₹56,100 + allowances", mid: "₹1.18 LPA + perks", senior: "₹2.25 LPA (Cabinet Sec)" },
    colleges: [
      "Any central/state university | ஏதேனும் ஒரு மத்திய/மாநில பல்கலைக்கழகம்",
      "Loyola College Chennai | லயோலா கல்லூரி சென்னை",
      "Madras University | சென்னை பல்கலைக்கழகம்"
    ],
    description: "IAS and IPS officers are the backbone of Indian governance — managing districts, leading police forces and implementing national policies. / ஐ.ஏ.எஸ் மற்றும் ஐ.பி.எஸ் அதிகாரிகள் இந்திய நிர்வாகத்தின் முதுகெலும்பாகச் செயல்படுகிறார்கள் - மாவட்டங்களை நிர்வகித்தல், காவல் படைகளை வழிநடத்துதல் மற்றும் தேசியக் கொள்கைகளை செயல்படுத்துதல்.",
    dailyLife: "Office administration, district tours, meetings with ministers, citizen grievances, law enforcement. / அலுவலக நிர்வாகம், மாவட்டச் சுற்றுப்பயணங்கள், அமைச்சர்களுடன் கூட்டங்கள், மக்கள் குறைகளைக் கேட்டறிதல், சட்டம் ஒழுங்கு பராமரிப்பு.",
    topRecruiters: ["Government of India | இந்திய அரசு", "State Governments | மாநில அரசுகள்", "Embassies (IFS) | தூதரகங்கள்"],
    skills: ["Reading comprehension | வாசிப்புத் திறன்", "Current affairs | நடப்பு நிகழ்வுகள்", "Essay writing | கட்டுரை எழுதுதல்", "Leadership | தலைமைப் பண்பu"],
    proTip: "Start reading The Hindu newspaper from Class 11. Complete NCERT books 6–12 for all subjects. / 11 ஆம் வகுப்பு முதல் தி இந்து நாளிதழைப் படிக்கத் தொடங்குங்கள். 6-12 ஆம் வகுப்பு வரையிலான அனைத்து என்.சி.இ.ஆர்.டி பாடப்புத்தகங்களையும் படியுங்கள்.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "tnpsc",
    title: "TNPSC Officer | டி.என்.பி.எஸ்.சி அதிகாரி",
    category: "Civil Services | குடிமைப் பணிகள்",
    grad: "from-violet-500 to-purple-600",
    soft: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-600 dark:text-violet-400",
    path: "Graduation → TNPSC Group I/II/IV → State Service | ஏதேனும் ஒரு பட்டம் → டி.என்.பி.எஸ்.சி குரூப் தேர்வுகள் → அரசுப் பணி",
    subjects: ["General Studies | பொது அறிவு", "Tamil | தமிழ் மொழி", "English | ஆங்கிலம்", "Aptitude | திறனறித் தேர்வு"],
    streams: ["Science", "Commerce"],
    exam: "TNPSC Group I, II, IV, VIII | டி.என்.பி.எஸ்.சி தேர்வுகள்",
    examBody: "Tamil Nadu Public Service Commission | தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணையம்",
    duration: "Any Degree (3 years) | ஏதேனும் ஒரு பட்டம் (3 ஆண்டுகள்)",
    salary: { entry: "₹25,000–45,000/month", mid: "₹50,000–80,000", senior: "₹1–1.5 LPA" },
    colleges: [
      "Any Tamil Nadu University | ஏதேனும் ஒரு தமிழக பல்கலைக்கழகம்",
      "Madras University | சென்னை பல்கலைக்கழகம்",
      "Bharathiar University | பாரதியார் பல்கலைக்கழகம்",
      "Annamalai University | அண்ணாமலை பல்கலைக்கழகம்"
    ],
    description: "TNPSC recruits officers for various Tamil Nadu Government departments — Deputy Collector, Block Development Officer, Revenue Inspector and more. / டி.என்.பி.எஸ்.சி தேர்வாணையம் பல்வேறு தமிழக அரசுத் துறைகளுக்கு - துணை ஆட்சியர், வட்டார வளர்ச்சி அலுவலர், வருவாய் ஆய்வாளர் போன்ற அதிகாரிகளைத் தேர்வு செய்கிறது.",
    dailyLife: "Office work, public grievance, revenue collection, development scheme implementation. / அலுவலகப் பணி, மக்கள் குறைகளைக் கேட்டறிதல், வருவாய் வசூல், அரசு திட்டங்களைச் செயல்படுத்துதல்.",
    topRecruiters: ["Tamil Nadu Government departments | தமிழ்நாடு அரசுத் துறைகள்"],
    skills: ["Tamil medium competence | தமிழ் மொழித் திறன்", "Samacheer textbook knowledge | சமச்சீர் கல்விப் பாடப் புத்தகங்கள்", "Current affairs | நடப்பு நிகழ்வுகள்", "Aptitude | கணிதத் திறனறிவு"],
    proTip: "TNPSC Group IV can be attempted right after Class 10/12. Samacheer textbooks are the primary source! / டி.என்.பி.எஸ்.சி குரூப் IV தேர்வை 10/12 ஆம் வகுப்பு முடித்தவுடனேயே எழுதலாம். தமிழக சமச்சீர் கல்விப் பாடப்புத்தகங்களே இதற்கு முதன்மை ஆதாரம்!",
    classes: [9, 10, 11, 12],
  },
  {
    id: "defence",
    title: "Armed Forces / Police | இராணுவம் / காவல்துறை",
    category: "Defence | பாதுகாப்புத் துறை",
    grad: "from-slate-500 to-gray-600",
    soft: "bg-slate-50 dark:bg-slate-950/30",
    text: "text-slate-600 dark:text-slate-400",
    path: "12th / Graduation → NDA / CDS / Police → Training | 12ஆம் வகுப்பு / பட்டம் → என்.டி.ஏ / சி.டி.எஸ் / போலீஸ் தேர்வு → பயிற்சி",
    subjects: ["Mathematics | கணிதம்", "Physical Education | உடற்கல்வி", "General Knowledge | பொது அறிவு"],
    streams: ["Science", "Commerce"],
    exam: "NDA, CDS, AFCAT, TN Police SI | என்.டி.ஏ / சி.டி.எஸ் / போலீஸ் தேர்வுகள்",
    examBody: "UPSC / SSC / State Police Boards | யு.பி.எஸ்.சி / சீருடைப் பணியாளர் தேர்வாணையம்",
    duration: "After 12th (NDA) or Graduation (CDS) | 12ஆம் வகுப்பிற்குப் பிறகு அல்லது பட்டப்படிப்பிற்குப் பிறகு",
    salary: { entry: "₹30,000–56,000/month", mid: "₹70,000–1.2 LPA", senior: "₹1.5–2.5 LPA (Officers)" },
    colleges: [
      "NDA Pune (Army/Navy/Air) | என்.டி.ஏ புனே",
      "OTA Chennai | ஓ.டி.ஏ சென்னை",
      "TN Police Academy | தமிழ்நாடு போலீஸ் அகாடமி"
    ],
    description: "A career in the Indian Army, Navy, Air Force or Tamil Nadu Police offers prestige, adventure, job security and an opportunity to serve the nation. / இந்திய ராணுவம், கடற்படை, விமானப்படை அல்லது தமிழ்நாடு காவல் துறையில் பணிபுரிவது நற்பெயர், சாகசம், வேலை பாதுகாப்பு மற்றும் தேசத்திற்கு சேவை செய்யும் வாய்ப்பை வழங்குகிறது.",
    dailyLife: "Physical training, patrols, strategy, leadership, field operations. / உடற்பயிற்சி, ரோந்துப் பணி, உத்திகள் வகுத்தல், தலைமைத்துவம், களப் பணிகள்.",
    topRecruiters: ["Indian Army | இந்திய ராணுவம்", "Indian Navy | இந்திய கடற்படை", "Indian Air Force | இந்திய விமானப்படை", "Tamil Nadu Police | தமிழ்நாடு காவல் துறை"],
    skills: ["Physical fitness | உடற்தகுதி", "Mathematics | கணிதம் (என்.டி.ஏ தேர்வுக்கு)", "English | ஆங்கிலம்", "Discipline | ஒழுக்கம்", "Leadership | தலைமைப் பண்பு"],
    proTip: "NDA exam after Class 12 (Science stream preferred). Start physical training from Class 10 itself. / 12-ஆம் வகுப்பிற்குப் பிறகு என்.டி.ஏ தேர்வு எழுதலாம். 10-ஆம் வகுப்பு முதலே உடற்தகுதிப் பயிற்சிகளைத் தொடங்குங்கள்.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "banking",
    title: "Banking & Finance | வங்கி & நிதித்துறை",
    category: "Finance | நிதித்துறை",
    grad: "from-emerald-500 to-teal-600",
    soft: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    path: "B.Com/BBA/B.Sc → IBPS/SBI PO → Bank Officer | பி.காம்/பி.பி.ஏ → வங்கித் தேர்வுகள் → வங்கி அதிகாரி",
    subjects: ["Mathematics | கணிதம்", "Economics | பொருளியல்", "Accountancy | கணக்குப்பதிவியல்", "English | ஆங்கிலம்"],
    streams: ["Science", "Commerce"],
    exam: "IBPS PO, SBI PO, RBI Grade B, CA | ஐ.பி.எஸ்.பி.ஓ / சி.ஏ",
    examBody: "IBPS / SBI / RBI / ICAI | இந்திய பட்டயக் கணக்காளர்கள் நிறுவனம்",
    duration: "3 years Degree + Exam Prep | 3 ஆண்டுகள் பட்டம் + தேர்வுத் தயாரிப்பு",
    salary: { entry: "₹5–8 LPA", mid: "₹12–20 LPA", senior: "₹25–50 LPA" },
    colleges: [
      "IIM (MBA Finance) | ஐ.ஐ.எம்",
      "Loyola College Chennai | லயோலா கல்லூரி சென்னை",
      "PSG College of Arts & Science | பி.எஸ்.ஜி கலை & அறிவியல் கல்லூரி",
      "Stella Maris College | ஸ்டெல்லா மாரீஸ் கல்லூரி"
    ],
    description: "Banking and Finance professionals manage money, investments, loans and economic policy. Chartered Accountancy (CA) is one of the most prestigious paths. / வங்கி மற்றும் நிதித்துறை வல்லுநர்கள் பணம், முதலீடுகள், கடன்கள் மற்றும் பொருளாதாரக் கொள்கைகளை நிர்வகிக்கிறார்கள். பட்டயக் கணக்காளர் (சி.ஏ) பணி இதில் மிகவும் மதிப்புமிக்க ஒன்றாகும்.",
    dailyLife: "Client meetings, loan processing, financial analysis, auditing, account management. / வாடிக்கையாளர் சந்திப்புகள், கடன் செயலாக்கம், நிதி பகுப்பாய்வு, தணிக்கை, கணக்கு மேலாண்மை.",
    topRecruiters: ["SBI | எஸ்.பி.ஐ", "HDFC | எச்.டி.எப்.சி", "ICICI | ஐ.சி.ஐ.சி.ஐ", "RBI | ஆர்.பி.ஐ", "Big 4 Audit Firms (KPMG, Deloitte, EY, PwC)"],
    skills: ["Mathematics | கணிதம்", "Accountancy | கணக்குப்பதிவியல்", "Attention to detail | கூர்நோக்குத் திறன்", "Communication | தொடர்புத் திறன்"],
    proTip: "Start CA Foundation immediately after Class 12 Commerce. Register with ICAI during Class 12 itself. / 12-ஆம் வகுப்பு வணிகவியல் முடித்தவுடன் சி.ஏ பவுண்டேஷன் படிக்கத் தொடங்குங்கள். 12-ஆம் வகுப்பிலேயே ஐ.சி.ஏ.ஐ-ல் பதிவு செய்யவும்.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "software",
    title: "IT / Software Engineer | தகவல் தொழில்நுட்பம் / மென்பொருள் பொறியாளர்",
    category: "Technology | தொழில்நுட்பம்",
    grad: "from-indigo-500 to-blue-600",
    soft: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-600 dark:text-indigo-400",
    path: "B.Tech CS / BCA → Software Engineer → Senior Dev | பி.டெக் சி.எஸ் / பி.சி.ஏ → மென்பொருள் பொறியாளர் → மூத்த டெவலப்பர்",
    subjects: ["Mathematics | கணிதம்", "Computer Science | கணினி அறிவியல்", "Physics | இயற்பியல்"],
    streams: ["Science", "ComputerScience"],
    exam: "JEE / TNEA / TANCET / Campus Placement | ஜே.இ.இ / டி.என்.இ.ஏ / வளாக நேர்காணல்",
    examBody: "NTA / Anna University / Private IT Firms | அண்ணா பல்கலைக்கழகம் / தனியார் நிறுவனங்கள்",
    duration: "4 years B.Tech / 3 years BCA | 4 ஆண்டுகள் பி.டெக் / 3 ஆண்டுகள் பி.சி.ஏ",
    salary: { entry: "₹4–8 LPA", mid: "₹15–35 LPA", senior: "₹50 LPA–1 Cr+" },
    colleges: [
      "IIT Madras | ஐஐடி மெட்ராஸ்",
      "NIT Trichy | என்ஐடி திருச்சி",
      "Anna University | அண்ணா பல்கலைக்கழகம்",
      "SASTRA University | சாஸ்த்ரா பல்கலைக்கழகம்",
      "VIT Vellore | வி.ஐ.டி வேலூர்"
    ],
    description: "Software engineers build apps, websites, AI systems and infrastructure. Tamil Nadu's IT corridor (Chennai, Coimbatore) is one of India's largest tech hubs. / மென்பொருள் பொறியாளர்கள் செயலிகள், வலைத்தளங்கள், செயற்கை நுண்ணறிவு அமைப்புகளை உருவாக்குகிறார்கள். தமிழகத்தின் தகவல் தொழில்நுட்ப வழித்தடம் (சென்னை, கோவை) இந்தியாவின் மிகப்பெரிய தகவல் தொழில்நுட்ப மையங்களில் ஒன்றாகும்.",
    dailyLife: "Coding, code reviews, stand-up meetings, debugging, system design, deployments. / நிரல் எழுதுதல், நிரல் குறியீடு சரிபார்த்தல், குழு விவாதங்கள், பிழைகளை நீக்குதல், மென்பொருள் வடிவமைப்பு.",
    topRecruiters: ["TCS | டி.சி.எஸ்", "Infosys | இன்போசிஸ்", "Zoho | ஜோஹோ", "Google | கூகுள்", "Microsoft | மைக்ரோசாப்ட்", "Amazon | அமேசான்", "startups"],
    skills: ["C++/Python/Java | கணினி மொழிகள்", "Data Structures | தரவு அமைப்புகள்", "Problem-solving | சிக்கல் தீர்க்கும் திறன்", "Git/DevOps"],
    proTip: "Learn Python or C from Class 9. Practice LeetCode problems from Class 11. Side projects matter! / 9-ஆம் வகுப்பு முதலே பைதான் அல்லது சி மொழியைக் கற்றுக்கொள்ளுங்கள். 11-ஆம் வகுப்பு முதல் லீட்கோடு போன்ற தளங்களில் பயிற்சி பெறவும்.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "agriculture",
    title: "Agriculture Officer | வேளாண்மை அலுவலர்",
    category: "Agriculture | வேளாண்மை",
    grad: "from-green-500 to-lime-600",
    soft: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-600 dark:text-green-400",
    path: "B.Sc Agri (TNAU) → TN Agri Dept / NABARD | பி.எஸ்சி வேளாண்மை → வேளாண் துறை / நபார்டு வங்கி",
    subjects: ["Biology | உயிரியல்", "Chemistry | வேதியியல்", "Botany | தாவரவியல்"],
    streams: ["Science"],
    exam: "TNAU Entrance / ICAR / TNPSC Agri | தமிழ்நாடு வேளாண் பல்கலையின் நுழைவுத் தேர்வு",
    examBody: "Tamil Nadu Agricultural University / ICAR | தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் / ஐ.சி.ஏ.ஆர்",
    duration: "4 years B.Sc Agriculture | 4 ஆண்டுகள் பி.எஸ்சி வேளாண்மை",
    salary: { entry: "₹4–6 LPA", mid: "₹8–15 LPA", senior: "₹20–35 LPA" },
    colleges: [
      "TNAU Coimbatore | தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம்",
      "Agricultural College & Research Institute Madurai | மதுரை வேளாண் கல்லூரி",
      "Forest College Mettupalayam | வனவியல் கல்லூரி மேட்டுப்பாளையம்"
    ],
    description: "Agriculture officers guide farmers on modern techniques, crop management, soil health and government schemes. Smart farming and agri-tech are creating exciting new roles. / வேளாண்மை அதிகாரிகள் நவீன விவசாய முறைகள், பயிர் மேலாண்மை, மண் வளம் மற்றும் அரசு திட்டங்கள் குறித்து விவசாயிகளுக்கு வழிகாட்டுகின்றனர்.",
    dailyLife: "Field visits, soil testing, farmer training, scheme implementation, crop disease assessment. / வயல்வெளிகளுக்குச் செல்லுதல், மண் பரிசோதனை, விவசாயிகளுக்குப் பயிற்சி அளித்தல், திட்டங்களைச் செயல்படுத்துதல்.",
    topRecruiters: ["Tamil Nadu Agriculture Dept | தமிழ்நாடு வேளாண்மைத் துறை", "NABARD | நபார்டு வங்கி", "ICAR", "Agri-tech startups", "Fertiliser companies"],
    skills: ["Biology | உயிரியல்", "Chemistry | வேதியியல்", "Field work | களப்பணி", "Tamil language | தமிழ் மொழி அறிவு"],
    proTip: "TNAU entrance exam is based on Biology/Chemistry. Rank in top 500 for government seat. / அண்ணா வேளாண் பல்கலை நுழைவுத் தேர்வு உயிரியல்/வேதியியல் சார்ந்தது. அரசு சீட் பெற முதல் 500 இடங்களுக்குள் வர வேண்டும்.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "lawyer",
    title: "Lawyer / Judge | வழக்கறிஞர் / நீதிபதி",
    category: "Law | சட்டம்",
    grad: "from-yellow-500 to-amber-600",
    soft: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-600 dark:text-yellow-400",
    path: "BA LLB / BBA LLB → Advocate → Senior Counsel / Judge | ஒருங்கிணைந்த சட்டம் → வழக்கறிஞர் → நீதிபதி",
    subjects: ["English | ஆங்கிலம்", "History | வரலாறு", "Political Science | அரசியல் அறிவியல்"],
    streams: ["Science", "Commerce"],
    exam: "CLAT / LSAT / Tamil Nadu Law Entrance | கிளாட் / தமிழ்நாடு சட்ட நுழைவுத் தேர்வு",
    examBody: "Consortium of NLUs / State Law Universities | தேசிய சட்டப் பல்கலைக்கழகங்களின் கூட்டமைப்பு",
    duration: "5 years integrated LLB | 5 ஆண்டுகள் ஒருங்கிணைந்த சட்டப் படிப்பு",
    salary: { entry: "₹4–8 LPA", mid: "₹15–40 LPA", senior: "₹60 LPA+ (Senior Advocates)" },
    colleges: [
      "NLU Chennai (TNNLU) | தேசிய சட்டப் பல்கலைக்கழகம் திருச்சி",
      "Madras Law College | சென்னை சட்டக் கல்லூரி",
      "School of Excellence in Law | பள்ளிச் சிறந்த சட்டக் கல்லூரி சென்னை"
    ],
    description: "Lawyers argue cases, draft contracts and interpret law. Judges preside over courts. With India's massive legal system, law offers both private and government career paths. / வழக்கறிஞர்கள் நீதிமன்றங்களில் வாதிடுகிறார்கள், ஒப்பந்தங்களை வரைகிறார்கள் மற்றும் சட்டத்தை விளக்குகிறார்கள். நீதிபதிகள் நீதிமன்றங்களுக்குத் தலைமை தாங்குகிறார்கள்.",
    dailyLife: "Research, client meetings, court appearances, writing briefs, legal drafting. / சட்ட ஆராய்ச்சி, வாடிக்கையாளர் சந்திப்புகள், நீதிமன்றத் தோற்றங்கள், சட்டக் குறிப்புகள் எழுதுதல்.",
    topRecruiters: ["High Court / Supreme Court | உயர் நீதிமன்றம் / உச்ச நீதிமன்றம்", "Law Firms | சட்ட நிறுவனங்கள்", "Corporate Legal Teams", "NGOs"],
    skills: ["English language | ஆங்கில மொழித் திறன்", "Logical reasoning | தர்க்கரீதியான பகுப்பாய்வு", "Debating | விவாதத் திறன்", "Research | ஆராய்ச்சித் திறன்"],
    proTip: "CLAT exam after 12th. Score 500+ in CLAT for NLU Chennai. Join debate clubs from school itself. / 12-ஆம் வகுப்பிற்குப் பிறகு கிளாட் தேர்வு எழுதலாம். திருச்சி தேசிய சட்டப் பல்கலைக்கழகத்தில் சேர நல்ல மதிப்பெண்கள் பெறவும். பள்ளியிலேயே விவாத மன்றங்களில் பங்கேற்கவும்.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "teacher",
    title: "Teacher / Professor | ஆசிரியர் / பேராசிரியர்",
    category: "Education | கல்வித் துறை",
    grad: "from-teal-500 to-cyan-600",
    soft: "bg-teal-50 dark:bg-teal-950/30",
    text: "text-teal-600 dark:text-teal-400",
    path: "B.Ed / B.Sc + B.Ed → TET / TN TRB → Govt Teacher | பட்டப்படிப்பு + பி.எட் → ஆசிரியர் தகுதித் தேர்வு (டெட்) → அரசு பள்ளி ஆசிரியர்",
    subjects: ["Any Subject | ஏதேனும் ஒரு பாடம்", "Tamil | தமிழ்", "English | ஆங்கிலம்"],
    streams: ["Science", "Commerce"],
    exam: "TET (Teacher Eligibility Test) / TN TRB | ஆசிரியர் தகுதித் தேர்வு / ஆசிரியர் தேர்வு வாரியம்",
    examBody: "Tamil Nadu Teachers Recruitment Board | தமிழ்நாடு ஆசிரியர் தேர்வு வாரியம்",
    duration: "3 years Degree + 2 years B.Ed | 3 ஆண்டுகள் பட்டம் + 2 ஆண்டுகள் பி.எட்",
    salary: { entry: "₹35,000–50,000/month", mid: "₹60,000–80,000", senior: "₹1–1.5 LPA (HM)" },
    colleges: [
      "Tamil Nadu Teachers Education University (TNTEU) | தமிழ்நாடு ஆசிரியர் கல்வியியல் பல்கலைக்கழகம்",
      "Government Colleges of Education | அரசு கல்வியியல் கல்லூரிகள்",
      "Alagappa University | அழகப்பா பல்கலைக்கழகம்"
    ],
    description: "Teachers shape future generations. Government school teachers in Tamil Nadu enjoy excellent job security, pension and social respect. / ஆசிரியர்கள் எதிர்கால தலைமுறையை உருவாக்குகிறார்கள். தமிழக அரசுப் பள்ளி ஆசிரியர்கள் சிறந்த வேலை பாதுகாப்பு, ஊதியம் மற்றும் சமூக மரியாதையைப் பெறுகிறார்கள்.",
    dailyLife: "Classroom teaching, lesson planning, student assessment, parent meetings, school admin. / வகுப்பறை கற்பித்தல், பாடத் திட்டமிடல், மாணவர் மதிப்பீடு, பெற்றோர் கூட்டங்கள், பள்ளி நிர்வாகம்.",
    topRecruiters: ["Tamil Nadu Education Dept | தமிழ்நாடு பள்ளிக் கல்வித் துறை", "KV Schools (CBSE) | கேந்திரிய வித்யாலயா", "Private schools | தனியார் பள்ளிகள்"],
    skills: ["Subject expertise | பாட அறிவு", "Communication | தொடர்புத் திறன்", "Patience | பொறுமை", "Technology literacy | கணினி மற்றும் தொழில்நுட்ப அறிவு"],
    proTip: "B.Sc + B.Ed (4 year integrated) is the new pattern. Score well in TET to get government school posting. / 4 வருட ஒருங்கிணைந்த பி.எஸ்சி + பி.எட் புதிய முறை ஆகும். அரசுப் பள்ளிகளில் பணியமர்த்தப்பட டெட் (TET) தேர்வில் அதிக மதிப்பெண்கள் பெறவும்.",
    classes: [9, 10, 11, 12],
  },
];

const EXAMS = [
  { name: "NEET-UG | நீட் தேர்வு", date: "May 2026", for: "Medical (MBBS/BDS) | மருத்துவம்", eligibility: "Class 12 (PCB) | 12-ஆம் வகுப்பு (உயிரியல் குழு)", body: "NTA | தேசிய தேர்வு முகமை", color: "from-rose-500 to-red-500" },
  { name: "JEE Main | ஜே.இ.இ மெயின்", date: "Jan & Apr 2026", for: "Engineering (B.Tech) | பொறியியல்", eligibility: "Class 12 (PCM) | 12-ஆம் வகுப்பு (கணிதக் குழு)", body: "NTA | தேசிய தேர்வு முகமை", color: "from-blue-500 to-cyan-500" },
  { name: "JEE Advanced | ஜே.இ.இ அட்வான்ஸ்டு", date: "May 2026", for: "IITs (B.Tech) | ஐஐடி சேர்க்கை", eligibility: "JEE Main Top 2.5 lakh | ஜே.இ.இ மெயின் முதல் 2.5 லட்சம் ரேங்க்", body: "IIT Council | ஐஐடி கவுன்சில்", color: "from-indigo-500 to-violet-500" },
  { name: "TNEA | டி.என்.இ.ஏ கலந்தாய்வு", date: "June 2026", for: "TN Engineering Colleges | தமிழக பொறியியல் கல்லூரிகள்", eligibility: "Class 12 (PCM) 45%+ | 12-ஆம் வகுப்பு (கணிதக் குழு) 45%+", body: "Anna University | அண்ணா பல்கலைக்கழகம்", color: "from-sky-500 to-blue-500" },
  { name: "CLAT | கிளாட் தேர்வு", date: "Dec 2025", for: "Law (LLB) | சட்டப் படிப்பு", eligibility: "Class 12 any stream 45% | 12-ஆம் வகுப்பு ஏதேனும் ஒரு பிரிவு 45%", body: "Consortium of NLUs | தேசிய சட்டப் பல்கலைக் கூட்டமைப்பு", color: "from-amber-500 to-orange-500" },
  { name: "TNPSC Group IV | டி.என்.பி.எஸ்.சி குரூப் IV", date: "Quarterly | காலாண்டு முறை", for: "TN State Service | தமிழக அரசுப் பணி", eligibility: "Graduation (Minimum 10th for some posts) | பட்டப்படிப்பு (சில பணிகளுக்கு 10ஆம் வகுப்பு)", body: "TNPSC | தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணையம்", color: "from-violet-500 to-purple-500" },
  { name: "NDA | என்.டி.ஏ தேர்வு", date: "Apr & Sep 2026", for: "Armed Forces Officer | ராணுவ அதிகாரி பணி", eligibility: "Class 12 (PCM for Navy/Air) | 12-ஆம் வகுப்பு (கணிதக் குழு)", body: "UPSC | மத்திய அரசுப் பணியாளர் தேர்வாணையம்", color: "from-slate-500 to-gray-600" },
  { name: "IBPS PO | வங்கி பி.ஓ தேர்வு", date: "Oct 2026", for: "Bank Probationary Officer | வங்கி அதிகாரி பணி", eligibility: "Any Graduation | ஏதேனும் ஒரு பட்டப்படிப்பு", body: "IBPS | வங்கிப் பணியாளர் தேர்வு நிறுவனம்", color: "from-emerald-500 to-teal-500" },
];

const QUIZ_QUESTIONS = [
  {
    q: "What do you enjoy most? / உங்களுக்கு மிகவும் பிடிப்பது எது?",
    options: [
      "Helping sick people get better / உடல்நலமில்லாதவர்களுக்கு உதவுவது",
      "Building or fixing things / புதியவற்றை உருவாக்குவது அல்லது பழுதுபார்ப்பது",
      "Reading and arguing logically / படிப்பது மற்றும் தர்க்கரீதியாக விவாதிப்பது",
      "Working with numbers & money / எண்கள் மற்றும் பணத்துடன் வேலை செய்வது",
      "Coding & problem solving / கணினி நிரலாக்கம் மற்றும் சிக்கல் தீர்த்தல்",
      "Teaching and guiding others / பிறருக்கு கற்பிப்பது மற்றும் வழிகாட்டுவது"
    ]
  },
  {
    q: "Which subject excites you most? / உங்களுக்குப் பிடித்த பாடம் எது?",
    options: [
      "Biology / உயிரியல்",
      "Physics & Math / இயற்பியல் & கணிதம்",
      "History & Polity / வரலாறு & குடிமையியல்",
      "Economics & Accounts / பொருளியல் & கணக்குப் பதிவியல்",
      "Computer Science / கணினி அறிவியல்",
      "Any — I love all subjects / அனைத்தும் - எல்லா பாடங்களும் பிடிக்கும்"
    ]
  },
  {
    q: "Which work environment fits you? / உங்களுக்கு எந்த வேலைச் சூழல் பிடிக்கும்?",
    options: [
      "Hospital / Clinic | மருத்துவமனை / கிளினிக்",
      "Office / Field | அலுவலகம் / வெளிக்களப் பணி",
      "Courtroom / Government | நீதிமன்றம் / அரசு அலுவலகம்",
      "Bank / Corporate | வங்கி / பெருநிறுவனம்",
      "Tech company / Remote | தொழில்நுட்ப நிறுவனம் / வீட்டில் இருந்தே பணி",
      "School / College | பள்ளி / கல்லூரி"
    ]
  },
  {
    q: "What is your long-term goal? / உங்களது நீண்ட கால இலக்கு என்ன?",
    options: [
      "Save lives / உயிர்களைக் காப்பாற்றுவது",
      "Build infrastructure or software / உள்கட்டமைப்பு அல்லது மென்பொருளை உருவாக்குவது",
      "Serve the nation / public / தேசத்திற்கு / மக்களுக்கு சேவை செய்வது",
      "Grow wealth / செல்வத்தை பெருக்குவது மற்றும் நிர்வகிப்பது",
      "Innovate with technology / புதிய தொழில்நுட்பங்களை உருவாக்குவது",
      "Inspire the next generation / அடுத்த தலைமுறையை ஊக்குவிப்பது"
    ]
  },
  {
    q: "How much risk are you comfortable with? / நீங்கள் எவ்வளவு ரிஸ்க் எடுக்கத் தயார்?",
    options: [
      "Low — stable government job / குறைவு - நிலையான அரசு வேலை",
      "Medium — corporate with growth / நடுத்தரம் - கார்ப்பரேட் வளர்ச்சி வேலை",
      "High — startup / entrepreneurship / அதிகம் - சொந்தத் தொழில் / ஸ்டார்ட்அப்",
      "I want to study more first / நான் முதலில் இன்னும் நன்றாகப் படிக்க வேண்டும்"
    ]
  },
];

const QUIZ_RESULTS: Record<string, { careers: string[]; note: string }> = {
  "0": { careers: ["doctor"], note: "Your passion for helping people makes Medicine a natural fit. / மக்களுக்கு உதவ வேண்டும் என்ற உங்கள் எண்ணம் மருத்துவத் துறைக்கு உகந்தது." },
  "1": { careers: ["engineer", "software"], note: "Your love for building & fixing things points to Engineering or IT. / புதியவற்றை உருவாக்க விரும்பும் உங்களுக்குப் பொறியியல் அல்லது ஐ.டி துறை சிறந்தது." },
  "2": { careers: ["ias", "tnpsc", "lawyer"], note: "Your civic interest aligns perfectly with Civil Services or Law. / சமூக அக்கறை கொண்ட உங்களுக்குக் குடிமைப் பணிகள் அல்லது சட்டத் துறை மிகவும் உகந்தது." },
  "3": { careers: ["banking", "tnpsc"], note: "Your aptitude for numbers suits Banking, Finance, or CA. / எண்களைக் கையாளும் உங்கள் திறன் வங்கி, நிதித்துறை அல்லது சி.ஏ படிப்பிற்கு உகந்தது." },
  "4": { careers: ["software", "engineer"], note: "Technology is your domain — Software Engineering is the path! / தொழில்நுட்பம் உங்களுக்கானது - மென்பொருள் பொறியியல் சிறந்த தேர்வாகும்!" },
  "5": { careers: ["teacher"], note: "Your passion for guiding others makes Teaching a fulfilling career. / மற்றவர்களுக்கு வழிகாட்ட விரும்பும் உங்களுக்குக் கற்பித்தல் பணி சிறந்ததாகும்." },
};

const CATEGORIES = [
  "All | அனைத்தும்",
  "Medical | மருத்துவம்",
  "Engineering | பொறியியல்",
  "Technology | தொழில்நுட்பம்",
  "Civil Services | குடிமைப் பணிகள்",
  "Finance | நிதித்துறை",
  "Defence | பாதுகாப்புத் துறை",
  "Agriculture | வேளாண்மை",
  "Law | சட்டம்",
  "Education | கல்வித் துறை"
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function CareerGuidancePage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass = parseInt(user?.class || "10");
  const studentName = user?.name?.split(" ")[0] || "Student";

  const [lang, setLang] = useState<"EN" | "TA">("EN");
  const [activeTab, setActiveTab] = useState<"explore" | "quiz" | "exams" | "colleges">("explore");
  const [selectedCategory, setSelectedCategory] = useState("All | அனைத்தும்");
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizDone, setQuizDone] = useState(false);

  // Helper function to extract correct translation
  const t = (bilingualText: string) => {
    if (!bilingualText) return "";
    const pipeParts = bilingualText.split(/\s*\|\s*/);
    if (pipeParts.length > 1) {
      return lang === "EN" ? pipeParts[0].trim() : pipeParts[1].trim();
    }
    const slashParts = bilingualText.split(/\s*\/\s*/);
    if (slashParts.length > 1) {
      return lang === "EN" ? slashParts[0].trim() : slashParts[1].trim();
    }
    return bilingualText;
  };

  const visible = CAREERS.filter(c => {
    if (selectedCategory === "All | அனைத்தும்") return true;
    const cleanCat = selectedCategory.split(" | ")[0];
    return c.category.startsWith(cleanCat);
  });

  const handleQuizAnswer = (idx: number) => {
    const next = [...quizAnswers, idx];
    setQuizAnswers(next);
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(s => s + 1);
    } else {
      setQuizDone(true);
    }
  };

  const topChoice = quizAnswers.length > 0 ? String(quizAnswers[0]) : "1";
  const quizResult = QUIZ_RESULTS[topChoice] || QUIZ_RESULTS["1"];
  const recommendedCareers = CAREERS.filter(c => quizResult.careers.includes(c.id));

  const TABS = [
    { id: "explore", label: "🔭 Explore Careers | தொழில்களை ஆராயுங்கள்" },
    { id: "quiz", label: "🧠 Career Quiz | வினாடி வினா" },
    { id: "exams", label: "📅 Exam Calendar | தேர்வு காலண்டர்" },
    { id: "colleges", label: "🏫 TN Colleges | தமிழக கல்லூரிகள்" },
  ] as const;

  return (
    <PortalLayout
      title={lang === "EN" ? "Career Guidance" : "தொழில் வழிகாட்டி"}
      subtitle={lang === "EN" ? `Personalised paths for Class ${studentClass}` : `${studentClass}ஆம் வகுப்பிற்கான வழிகாட்டி`}
    >
      <div className="flex flex-col gap-6">

        {/* LANGUAGE TOGGLE */}
        <div className="flex justify-end">
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit">
            <button
              onClick={() => setLang("EN")}
              className={`px-3.5 py-1 rounded-lg text-xs font-black transition-all ${lang === "EN" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow" : "text-slate-500 hover:text-slate-800"}`}
            >
              English
            </button>
            <button
              onClick={() => setLang("TA")}
              className={`px-3.5 py-1 rounded-lg text-xs font-black transition-all ${lang === "TA" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow" : "text-slate-500 hover:text-slate-800"}`}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-8 shadow-xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-10 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 max-w-2xl text-left">
            <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider mb-3">
              🎯 {lang === "EN" ? `Class ${studentClass} Career Guidance` : `${studentClass}ஆம் வகுப்பு தொழில் வழிகாட்டி`}
            </span>
            <h2 className="text-3xl font-black text-white mb-2">
              {lang === "EN" 
                ? `Hello ${studentName}! What will you become?` 
                : `வணக்கம் ${studentName}! நீங்கள் என்னவாக விரும்புகிறீர்கள்?`}
            </h2>
            <p className="text-white/85 text-sm font-medium leading-relaxed">
              {lang === "EN"
                ? "Explore career paths, entrance exams, top Tamil Nadu colleges and get a personalised recommendation."
                : "பல்வேறு தொழில் வாய்ப்புகள், நுழைவுத் தேர்வுகள், தமிழகத்தின் சிறந்த கல்லூரிகள் மற்றும் உங்களுக்கான தனிப்பட்ட ஆலோசனைகளைப் பெறுங்கள்."}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {["🩺 Medical | மருத்துவம்", "⚙️ Engineering | பொறியியல்", "💻 Technology | தொழில்நுட்பம்", "🏛️ Civil Services | குடிமைப்பணி", "⚖️ Law | சட்டம்"].map(tag => (
                <span key={tag} className="bg-white/15 text-white text-[11px] font-bold px-3 py-1 rounded-full">{t(tag)}</span>
              ))}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-x-auto gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex-1 ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-600 dark:text-slate-300 hover:text-indigo-600"}`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>

        {/* ── TAB 1: EXPLORE CAREERS ─────────────────────────────────────────── */}
        {activeTab === "explore" && (
          <div className="space-y-5 text-left">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-[11px] font-black border-2 transition-all ${selectedCategory === cat ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300"}`}
                >
                  {t(cat)}
                </button>
              ))}
            </div>

            {/* Career Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {visible.map(career => {
                const isOpen = expandedCareer === career.id;
                return (
                  <div
                    key={career.id}
                    className={`bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 overflow-hidden transition-all ${isOpen ? "shadow-xl border-indigo-200 dark:border-indigo-800" : "hover:shadow-lg hover:-translate-y-0.5"}`}
                  >
                    {/* Card header */}
                    <button
                      onClick={() => setExpandedCareer(isOpen ? null : career.id)}
                      className="w-full p-5 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 flex items-center justify-center shrink-0">
                          <FlatIcon name={career.id} className="w-14 h-14" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">{t(career.title)}</h3>
                            <span className={`text-lg transition-transform ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${career.text} block mt-0.5`}>{t(career.category)}</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{t(career.path)}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {career.subjects.map(s => (
                              <span key={s} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${career.soft} ${career.text}`}>{t(s)}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4 text-left">
                        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">{t(career.description)}</p>

                        {/* Salary */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: lang === "EN" ? "Entry Level" : "ஆரம்ப நிலை", val: career.salary.entry, color: "emerald" },
                            { label: lang === "EN" ? "Mid Career" : "இடைநிலை", val: career.salary.mid, color: "sky" },
                            { label: lang === "EN" ? "Senior" : "முதுநிலை", val: career.salary.senior, color: "violet" },
                          ].map(s => (
                            <div key={s.label} className={`p-2.5 bg-${s.color}-50 dark:bg-${s.color}-950/30 rounded-xl text-center border border-${s.color}-100 dark:border-${s.color}-900/30`}>
                              <p className={`text-[9px] font-black uppercase ${s.color === "emerald" ? "text-emerald-500" : s.color === "sky" ? "text-sky-500" : "text-violet-500"}`}>{s.label}</p>
                              <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 mt-0.5 font-mono">{s.val}</p>
                            </div>
                          ))}
                        </div>

                        {/* Exam & Duration */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase">{lang === "EN" ? "Entrance Exam" : "நுழைவுத் தேர்வு"}</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">{t(career.exam)}</p>
                            <p className="text-[9px] text-slate-400">{t(career.examBody)}</p>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase">{lang === "EN" ? "Duration" : "கால அளவு"}</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">{t(career.duration)}</p>
                          </div>
                        </div>

                        {/* Top Colleges */}
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5">🏫 {lang === "EN" ? "Top TN Colleges" : "சிறந்த கல்லூரிகள்"}</p>
                          <div className="flex flex-col gap-1">
                            {career.colleges.slice(0, 3).map((c, i) => (
                              <div key={c} className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-350 font-medium">
                                <span className={`w-4 h-4 rounded-full text-white text-[8px] font-black flex items-center justify-center bg-gradient-to-br ${career.grad} shrink-0`}>{i + 1}</span>
                                {t(c)}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Skills */}
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5">🛠️ {lang === "EN" ? "Key Skills" : "தேவையான திறன்கள்"}</p>
                          <div className="flex flex-wrap gap-1">
                            {career.skills.map(sk => (
                              <span key={sk} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{t(sk)}</span>
                            ))}
                          </div>
                        </div>

                        {/* Day in Life */}
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/30">
                          <p className="text-[9px] font-black uppercase text-amber-500 mb-1">☀️ {lang === "EN" ? "A Day in the Life" : "தினசரி பணிகள்"}</p>
                          <p className="text-[10px] text-amber-800 dark:text-amber-305 font-medium">{t(career.dailyLife)}</p>
                        </div>

                        {/* Pro Tip */}
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                          <p className="text-[9px] font-black uppercase text-indigo-500 mb-1">💡 {lang === "EN" ? "Pro Tip for You" : "உங்களுக்கான ஆலோசனை"}</p>
                          <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">{t(career.proTip)}</p>
                        </div>

                        {/* Top Recruiters */}
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5">🏢 {lang === "EN" ? "Top Recruiters" : "பணி வாய்ப்பளிப்பவர்கள்"}</p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-350 font-medium">{career.topRecruiters.map(r => t(r)).join(" · ")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: CAREER QUIZ ─────────────────────────────────────────────── */}
        {activeTab === "quiz" && (
          <div className="space-y-5 text-left">
            {!quizDone ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                {/* Progress */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                      {lang === "EN" ? `Question ${quizStep + 1} of ${QUIZ_QUESTIONS.length}` : `கேள்வி ${quizStep + 1} / ${QUIZ_QUESTIONS.length}`}
                    </p>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white mt-1 leading-relaxed">{t(QUIZ_QUESTIONS[quizStep].q)}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{quizStep + 1}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mb-6">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${((quizStep) / QUIZ_QUESTIONS.length) * 100}%` }} />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {QUIZ_QUESTIONS[quizStep].options.map((opt, i) => (
                    <button
                      key={opt}
                      onClick={() => handleQuizAnswer(i)}
                      className="w-full text-left px-4 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5"
                    >
                      {t(opt)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setQuizStep(0); setQuizAnswers([]); setQuizDone(false); }}
                  className="mt-4 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  ↺ {lang === "EN" ? "Restart Quiz" : "மீண்டும் தொடங்குக"}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Result */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white text-left">
                  <p className="text-xs font-black uppercase tracking-wider mb-2 opacity-80">{lang === "EN" ? "Your Career Match" : "உங்களுக்கான சிறந்த தேர்வு"}</p>
                  <h3 className="text-2xl font-black mb-2">{recommendedCareers.map(c => t(c.title)).join(" or ")}</h3>
                  <p className="text-xs text-white/85 leading-relaxed font-semibold">{t(quizResult.note)}</p>
                  <button
                    onClick={() => { setQuizStep(0); setQuizAnswers([]); setQuizDone(false); }}
                    className="mt-4 bg-white/20 hover:bg-white/30 text-white text-xs font-black px-4 py-2 rounded-xl transition-all"
                  >
                    ↺ {lang === "EN" ? "Retake Quiz" : "மீண்டும் செய்ய"}
                  </button>
                </div>

                {/* Matched career cards */}
                {recommendedCareers.map(career => (
                  <div key={career.id} className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-5 shadow-sm text-left">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 flex items-center justify-center shrink-0">
                        <FlatIcon name={career.id} className="w-14 h-14" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-white">{t(career.title)}</h3>
                        <p className="text-xs text-slate-500 font-medium">{t(career.path)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mb-3">{t(career.description)}</p>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                      <p className="text-[9px] font-black uppercase text-indigo-500 mb-1">💡 {lang === "EN" ? "Your Next Step" : "உங்களது அடுத்த கட்டம்"}</p>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">{t(career.proTip)}</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab("explore"); setExpandedCareer(career.id); setSelectedCategory("All | அனைத்தும்"); }}
                      className={`mt-3 text-xs font-black px-4 py-2 rounded-xl text-white bg-gradient-to-r ${career.grad}`}
                    >
                      {lang === "EN" ? "View Full Details →" : "முழு விவரங்கள் →"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: EXAM CALENDAR ───────────────────────────────────────────── */}
        {activeTab === "exams" && (
          <div className="space-y-4 text-left">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <p className="text-xs font-black text-amber-700 dark:text-amber-300">
                📢 {lang === "EN" ? "Dates below are indicative for 2025–26." : "கீழே உள்ள தேதிகள் 2025-26 ஆம் ஆண்டிற்கான உத்தேச தேதிகள் ஆகும்."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXAMS.map(exam => (
                <div key={exam.name} className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${exam.color} flex items-center justify-center text-white text-lg font-black shrink-0`}>
                      📝
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-800 dark:text-white leading-tight">{t(exam.name)}</h3>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-750 text-slate-500 whitespace-nowrap">{t(exam.date)}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{t(exam.body)}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-350 font-medium">
                          <span className="text-emerald-500 font-black mt-0.5">✓</span> {t(exam.for)}
                        </div>
                        <div className="flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-350 font-medium">
                          <span className="text-sky-500 font-black mt-0.5">✓</span> {t(exam.eligibility)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Preparation Resources */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-5">
              <h3 className="text-xs font-black text-slate-800 dark:text-white mb-4">
                📚 {lang === "EN" ? "Free Preparation Resources" : "தேர்வுத் தயாரிப்புக்கான இலவசத் தளங்கள்"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "NTA Official (NEET/JEE)", desc: "Official mock tests, past papers | மாதிரித் தேர்வுகள், பழைய வினாத்தாள்கள்", url: "https://nta.ac.in", color: "rose" },
                  { name: "Khan Academy India", desc: "Free NEET & JEE video lessons | இலவச நீட், ஜே.இ.இ காணொளிப் பாடங்கள்", url: "https://khanacademy.org", color: "blue" },
                  { name: "TNPSC Exam Portal", desc: "Syllabus and past exams | பாடத்திட்டம் மற்றும் முந்தைய தேர்வுகள்", url: "https://tnpsc.gov.in", color: "violet" },
                  { name: "Anna University TNEA", desc: "TN engineering admissions portal | தமிழக பொறியியல் சேர்க்கைக்கான தளம்", url: "https://tneaonline.org", color: "sky" },
                  { name: "CLAT Consortium", desc: "Law entrance resources | சட்டம் நுழைவுத் தேர்வு சார்ந்த தகவல்கள்", url: "https://consortiumofnlus.ac.in", color: "amber" },
                  { name: "IBPS Official", desc: "Bank exam details | வங்கித் தேர்வு விவரங்கள்", url: "https://ibps.in", color: "emerald" },
                ].map(r => (
                  <a key={r.name} href={r.url} target="_blank" rel="noreferrer"
                    className={`flex items-start gap-3 p-3 rounded-2xl bg-${r.color}-50 dark:bg-${r.color}-950/30 border border-${r.color}-100 dark:border-${r.color}-900/30 hover:scale-[1.01] transition-all`}>
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-${r.color}-400 to-${r.color}-600 flex items-center justify-center text-white text-xs font-black shrink-0`}>🔗</div>
                    <div>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200">{t(r.name)}</p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{t(r.desc)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: TN COLLEGES ─────────────────────────────────────────────── */}
        {activeTab === "colleges" && (
          <div className="space-y-4 text-left">
            {[
              {
                category: "🔬 Engineering & Technology | பொறியியல் & தகவல் தொழில்நுட்பம்",
                colleges: [
                  { name: "IIT Madras | ஐஐடி மெட்ராஸ்", location: "Chennai | சென்னை", rank: "#1 NIRF India", type: "Central | மத்திய அரசு", for: "JEE Advanced" },
                  { name: "NIT Trichy | என்ஐடி திருச்சி", location: "Tiruchirappalli | திருச்சி", rank: "#10 NIRF India", type: "Central | மத்திய அரசு", for: "JEE Main" },
                  { name: "Anna University (CEG) | அண்ணா பல்கலை (கிண்டி)", location: "Chennai | சென்னை", rank: "#1 in TN", type: "State | மாநில அரசு", for: "TNEA" },
                  { name: "PSG Tech | பிஎஸ்ஜி தொழில்நுட்பக் கல்லூரி", location: "Coimbatore | கோவை", rank: "A++ NAAC", type: "Autonomous | தன்னாட்சி", for: "TNEA / JEE" },
                  { name: "SASTRA University | சாஸ்த்ரா பல்கலைக்கழகம்", location: "Thanjavur | தஞ்சாவூர்", rank: "NIRF Top 50", type: "Deemed | நிகர்நிலைப் பல்கல.", for: "SASTRA Entrance" },
                  { name: "VIT Vellore | வி.ஐ.டி வேலூர்", location: "Vellore | வேலூர்", rank: "NIRF Top 20", type: "Deemed | நிகர்நிலைப் பல்கல.", for: "VITEEE" },
                ],
              },
              {
                category: "🩺 Medical | மருத்துவம்",
                colleges: [
                  { name: "AIIMS Madurai | எய்ம்ஸ் மதுரை", location: "Madurai | மதுரை", rank: "Central Govt", type: "Central | மத்திய அரசு", for: "NEET 700+" },
                  { name: "JIPMER | ஜிப்மர்", location: "Puducherry | புதுச்சேரி", rank: "NIRF Top 3 Medical", type: "Central | மத்திய அரசு", for: "NEET 650+" },
                  { name: "Madras Medical College (MMC) | சென்னை மருத்துவக் கல்லூரி", location: "Chennai | சென்னை", rank: "#1 in TN Medical", type: "State Govt | மாநில அரசு", for: "NEET" },
                  { name: "Stanley Medical College | ஸ்டான்லி மருத்துவக் கல்லூரி", location: "Chennai | சென்னை", rank: "Top 5 TN", type: "State Govt | மாநில அரசு", for: "NEET" },
                  { name: "Kilpauk Medical College | கீழ்ப்பாக்கம் மருத்துவக் கல்லூரி", location: "Chennai | சென்னை", rank: "Top 5 TN", type: "State Govt | மாநில அரசு", for: "NEET" },
                ],
              },
              {
                category: "⚖️ Law | சட்டம்",
                colleges: [
                  { name: "Tamil Nadu National Law University (TNNLU) | தேசிய சட்டப் பல்கலைக்கழகம்", location: "Tiruchirappalli | திருச்சி", rank: "NLU Rank 12", type: "State NLU | மாநில அரசு", for: "CLAT 600+" },
                  { name: "Madras Law College | சென்னை சட்டக் கல்லூரி", location: "Chennai | சென்னை", rank: "Oldest in Asia | ஆசியாவின் பழமையானது", type: "State Govt | மாநில அரசு", for: "TN Law Entrance" },
                  { name: "School of Excellence in Law | சிறந்த சட்டக் கல்லூரி", location: "Chennai | சென்னை", rank: "A Grade", type: "State Govt | மாநில அரசு", for: "TN Law Entrance" },
                ],
              },
              {
                category: "📊 Commerce & Management | வணிகவியல் & மேலாண்மை",
                colleges: [
                  { name: "Loyola College | லயோலா கல்லூரி", location: "Chennai | சென்னை", rank: "A++ NAAC", type: "Autonomous | தன்னாட்சி", for: "Merit / Entrance" },
                  { name: "Stella Maris College | ஸ்டெல்லா மாரீஸ் கல்லூரி", location: "Chennai | சென்னை", rank: "A++ NAAC", type: "Autonomous | தன்னாட்சி", for: "Merit" },
                  { name: "PSG Arts & Science | பி.எஸ்.ஜி கலை & அறிவியல்", location: "Coimbatore | கோவை", rank: "A++ NAAC", type: "Autonomous | தன்னாட்சி", for: "Merit" },
                ],
              },
              {
                category: "🌾 Agriculture | வேளாண்மை",
                colleges: [
                  { name: "Tamil Nadu Agricultural University (TNAU) | தமிழ்நாடு வேளாண் பல்கலைக்கழகம்", location: "Coimbatore | கோவை", rank: "#1 Agriculture TN", type: "State | மாநில அரசு", for: "TNAU Entrance" },
                  { name: "Agri College Madurai | மதுரை வேளாண் கல்லூரி", location: "Madurai | மதுரை", rank: "Top 3 TN", type: "State | மாநில அரசு", for: "TNAU Entrance" },
                  { name: "Forest College Mettupalayam | வனவியல் கல்லூரி", location: "Mettupalayam | மேட்டுப்பாளையம்", rank: "Unique in TN", type: "State | மாநில அரசு", for: "TNAU Entrance" },
                ],
              },
            ].map(section => (
              <div key={section.category} className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-5 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 dark:text-white mb-4">{t(section.category)}</h3>
                <div className="space-y-2">
                  {section.colleges.map((college, i) => (
                    <div key={college.name} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{t(college.name)}</p>
                        <p className="text-[9px] text-slate-405 font-medium">{t(college.location)} · {t(college.type)} · {t(college.rank)}</p>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shrink-0">{t(college.for)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <Link href="/student/ai-tutor" className="text-xs font-black px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300">
            🤖 {lang === "EN" ? "Ask AI Tutor" : "AI ஆசிரியர்"}
          </Link>
          <Link href="/student/science-library" className="text-xs font-black px-3 py-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300">
            📚 {lang === "EN" ? "Book Library" : "நூலகம்"}
          </Link>
          <Link href="/student/science-campus" className="text-xs font-black px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300">
            🧪 {lang === "EN" ? "Science Campus" : "அறிவியல் வளாகம்"}
          </Link>
        </div>
      </div>
    </PortalLayout>
  );
}
