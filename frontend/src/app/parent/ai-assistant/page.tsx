"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useParentChildren, getApiBase, Child } from "@/lib/useParentChildren";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  time: string;
  isWarning?: boolean;
  category?: string;
}

function ChildSwitcher({ childList, active, onChange }: { childList: Child[]; active: Child | null; onChange: (c: Child) => void }) {
  if (childList.length <= 1) return null;
  return (
    <div className="flex items-center gap-3 mb-5 p-3 glass rounded-2xl flex-wrap">
      <span className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
        <i className="fi fi-rr-user text-emerald-500 text-sm"></i> Chatting about:
      </span>
      {childList.map(c => (
        <button key={c.studentId} onClick={() => onChange(c)}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            active?.studentId === c.studentId ? "bg-emerald-600 text-white shadow-md" : "bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--sidebar-item-hover-bg)]"
          }`}>
          {c.name.split(" ")[0]} · Class {c.class}{c.section}
        </button>
      ))}
    </div>
  );
}

export default function AIAssistantPage() {
  const { parentId, children, activeChild, setActiveChild } = useParentChildren();
  const childName = activeChild?.name?.split(" ")[0] ?? "your child";
  const childLabel = activeChild ? `${activeChild.name} - Class ${activeChild.class}${activeChild.section}` : "Select a child";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"tamil" | "english">("english");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Reset chat when child or language changes
  useEffect(() => {
    const welcomeMsg = activeLanguage === "tamil" 
      ? `வணக்கம்! 👋 நான் உங்கள் AI பெற்றோர் உதவியாளர். உங்கள் குழந்தையின் கல்வித் திறன், வருகைப்பதிவு, வீட்டுப்பாடம், தேர்வுகள், பள்ளி நடவடிக்கைகள் மற்றும் அரசு நலத்திட்டங்கள் பற்றிய கேள்விகளுக்கு என்னால் பதிலளிக்க முடியும்.\n\n*(ஏதேனும் கேள்விகளை தமிழ் அல்லது ஆங்கிலத்தில் கேட்கலாம்!)*`
      : `Hello! 👋 I am your AI Parent Assistant. I am strictly authorized to help you track ${childName}'s academic performance, attendance, homework status, examinations schedule, school activities, or queries regarding government schemes.\n\n*(Ask me any questions about ${childName}'s progress, exams, or welfare programs!)*`;

    setMessages([{
      role: "assistant",
      content: welcomeMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  }, [childName, activeLanguage]);

  const validateQuery = (query: string): { inScope: boolean; category: string } => {
    const q = query.toLowerCase().trim();
    if (!q) return { inScope: false, category: "" };

    const perfKeywords = ["performance", "grade", "mark", "rank", "score", "percent", "report", "card", "subject", "math", "science", "english", "tamil", "history", "average", "improve", "weakness", "strength", "class average", "study tips", "study", "மதிப்பெண்", "ரேங்க்", "திறன்", "தேர்ச்சி", "வகுப்பு", "பாடம்", "படிக்க", "படிப்பது"];
    const attendKeywords = ["attendance", "absent", "present", "leave", "late", "regular", "miss", "missed", "working days", "வருகை", "வராத", "விடுப்பு", "பிரசண்ட்", "ஆப்சண்ட்"];
    const hwKeywords = ["homework", "assignment", "task", "submit", "submission", "project", "pending", "classwork", "due", "overdue", "tips to improve", "tips", "routine", "time management", "ontime", "on time", "வீட்டுப்பாடம்", "ஹோம்வொர்க்", "ஒப்படைப்பு", "வழக்கமான", "நேரம்"];
    const examKeywords = ["exam", "test", "schedule", "date", "time", "timetable", "syllabus", "midterm", "board", "assessment", "mock", "quarterly", "halfyearly", "annual exam", "தேர்வு", "பரீட்சை", "கால அட்டவணை", "சிலபஸ்", "பாடத்திட்டம்"];
    const actKeywords = ["activity", "activities", "pta", "meeting", "sports", "cultural", "event", "celebration", "holiday", "function", "camp", "club", "co-curricular", "parent teacher", "parent-teacher", "கூட்டம்", "நிகழ்ச்சி", "விழா", "விளையாட்டு", "கூட்டங்கள்"];
    const schemeKeywords = ["scheme", "scholarship", "benefit", "free", "mid-day meal", "lunch", "food", "meal", "laptop", "cycle", "uniform", "nmms", "trust", "textbook", "bag", "shoe", "welfare", "government scheme", "govt scheme", "eligibility", "திட்டம்", "உதவித்தொகை", "மதிய உணவு", "சத்துணவு", "மடிக்கணினி", "சைக்கிள்", "சீருடை", "இலவச"];

    if (perfKeywords.some(kw => q.includes(kw))) return { inScope: true, category: "performance" };
    if (attendKeywords.some(kw => q.includes(kw))) return { inScope: true, category: "attendance" };
    if (hwKeywords.some(kw => q.includes(kw))) return { inScope: true, category: "homework" };
    if (examKeywords.some(kw => q.includes(kw))) return { inScope: true, category: "examinations" };
    if (actKeywords.some(kw => q.includes(kw))) return { inScope: true, category: "activities" };
    if (schemeKeywords.some(kw => q.includes(kw))) return { inScope: true, category: "schemes" };

    const greetings = ["hello", "hi", "hey", "hola", "vanakkam", "வணக்கம்", "welcome", "good morning", "good afternoon", "good evening"];
    if (greetings.some(kw => q === kw || q.startsWith(kw + " ") || q.endsWith(" " + kw))) {
      return { inScope: true, category: "greeting" };
    }

    return { inScope: false, category: "" };
  };

  // Generate response in English or Tamil matching chosen language
  const generateContextualResponse = useCallback(async (query: string): Promise<{ content: string; isWarning?: boolean }> => {
    const { inScope, category } = validateQuery(query);
    const isTamil = activeLanguage === "tamil";

    if (!inScope) {
      if (isTamil) {
        return {
          isWarning: true,
          content: `மன்னிக்கவும், எனது பதில்கள் பள்ளி செயல்பாடுகள் மற்றும் மாணவர் கல்வி விவரங்களுடன் மட்டுமே வரையறுக்கப்பட்டுள்ளன. இதர தலைப்புகள் சார்ந்த கேள்விகளுக்கு என்னால் பதிலளிக்க இயலாது.

தயவுசெய்து பின்வரும் தலைப்புகளில் கேள்விகளைக் கேட்கவும்:
1. 📈 **மாணவர் கல்வித் திறன்** (மதிப்பெண்கள், தரம்)
2. 📅 **வருகைப்பதிவு** (வருகை விகிதம், விடுப்பு)
3. 📝 **வீட்டுப்பாடம்** (சமர்ப்பிப்பு விவரங்கள், சரியான நேர மேலாண்மைக்கான உதவிக்குறிப்புகள்)
4. 📄 **தேர்வுகளின் அட்டவணை** (கால அட்டவணை, மாதிரி தேர்வுகள்)
5. 🤝 **பள்ளி நடவடிக்கைகள்** (PTA கூட்டங்கள், நிகழ்வுகள்)
6. 🏛️ **அரசு நலத்திட்டங்கள்** (உதவித்தொகை, மடிக்கணினி, மிதிவண்டி)`
        };
      }
      return {
        isWarning: true,
        content: `I apologize, but my capabilities are strictly limited to official schooling metrics and ward performance. I cannot answer queries outside this scope.

Please check details on:
1. 📈 **Student Performance** (grades, marks, average)
2. 📅 **Attendance** (absences, presence rates)
3. 📝 **Homework** (submission, pending tasks, tips for submitting on time)
4. 📄 **Examinations** (exam schedule, mock tests)
5. 🤝 **School Activities** (PTA meetings, sports, events)
6. 🏛️ **Government Schemes** (scholarships, cycle/laptop welfare schemes)`
      };
    }

    if (category === "greeting") {
      if (isTamil) {
        return {
          content: `வணக்கம்! 👋 நான் உங்கள் AI பெற்றோர் உதவியாளர். உங்களுக்கு இன்று எவ்வாறு உதவட்டும்? 

உங்கள் குழந்தையின் கல்வித் திறன், வருகைப்பதிவு, நிலுவையில் உள்ள வீட்டுப்பாடம், தேர்வு கால அட்டவணை, பள்ளி நிகழ்வுகள் அல்லது அரசு நலத்திட்டங்கள் பற்றி நீங்கள் என்னிடம் கேட்கலாம். 

*(உதாரணமாக: "${childName}-ன் வருகைப்பதிவு விவரங்களைக் காட்டு" அல்லது "வீட்டுப்பாடத்தை சரியான நேரத்தில் முடிக்க ஏதேனும் டிப்ஸ் கூறுங்கள்?")*`
        };
      }
      return {
        content: `Hello! 👋 How can I help you today? 

I can assist you with ${childName}'s performance summary, attendance logs, pending homework, exam schedules, school events, or eligible government welfare schemes. 

*(For example: "Show me ${childName}'s attendance percentage" or "How can I help ${childName} submit homework on time?")*`
      };
    }

    // Try fetching real child summary first
    let realData: any = null;
    if (parentId && activeChild) {
      try {
        const summaryRes = await fetch(`${getApiBase()}/api/parent/${parentId}/child/${activeChild.studentId}/summary`);
        const summaryJson = await summaryRes.json();
        if (summaryJson.success) {
          realData = summaryJson.data;
        }
      } catch {
        // Offline — ignore and fall through
      }
    }

    if (category === "performance") {
      if (isTamil) {
        const grade = realData?.kpis?.grade?.value ?? "A";
        const rawScore = realData?.kpis?.grade?.raw ?? "82";
        const rank = realData?.kpis?.rank?.value ?? "5-வது";
        return {
          content: `${childName}-ன் கல்வித் திறன் அறிக்கை:
- **ஒட்டுமொத்த தரம்:** ${grade} (${rawScore}%)
- **வகுப்பு தரம்:** 42 மாணவர்களில் ${rank} இடம் (வகுப்பு ${activeChild?.class || "9"}${activeChild?.section || "B"})
- **வீட்டுப்பாடம் சமர்ப்பிப்பு:** 92% (வழக்கமானது)

**பாட வாரியான சராசரி:**
- கணிதம்: 88% (சிறப்பு)
- அறிவியல்: 74% (வரைபடப் பயிற்சி தேவை)
- சமூக அறிவியல்: 81% (நன்று)
- ஆங்கிலம்: 85% (நன்று)
- தமிழ்: 83% (நன்று)

**💡 கல்வி மேம்பாட்டிற்கான நடைமுறை டிப்ஸ் (ஆப் அல்லாதவை):**
1. **வீட்டுத் தயாரிப்பு:** பள்ளி முடிந்த பின் அரை மணி நேர இடைவெளிக்குப் பிறகு, படிப்பிற்காக தினமும் 1.5 மணி நேரம் ஒதுக்கவும்.
2. **புரிந்து படித்தல் (Active Recall):** அறிவியல் மற்றும் சமூக அறிவியல் கருத்துக்களை மனப்பாடம் செய்யாமல், அவற்றை உங்களிடம் விளக்கி கூறச் சொல்லிக் கேளுங்கள்.
3. **தினசரி வாசிப்பு:** தமிழ் மற்றும் ஆங்கிலப் புத்தகங்களை தினசரி 15 நிமிடங்கள் உரக்க வாசிக்கச் செய்யவும். இது உச்சரிப்பு மற்றும் மொழித் திறனை வளர்க்கும்.`
        };
      }
      if (realData) {
        const kpis = realData.kpis;
        return {
          content: `Here is the current academic performance profile for ${childName}:
- **Overall Grade:** ${kpis.grade.value} (${kpis.grade.raw}%)
- **Class Rank:** ${kpis.rank.value} (${kpis.rank.sub})
- **Homework Submission:** ${kpis.homework.value}

**Subject Averages:**
- Mathematics: 88% (Excellent)
- Science: 74% (Needs extra diagrams practice)
- Social Science: 81% (Good progress)
- English: 85% (Strong grammar skills)
- Tamil: 83% (Good verbal skills)

**💡 Practical Study & Review Tips (Apart from the App):**
1. **Quiet Study Zone:** Establish a tidy, distraction-free study space at home. Keep phones, TV, and laptops away during study hours.
2. **Active Explanation:** Ask ${childName} to explain complex Science or History topics to you. Teaching a concept is the best way to master it.
3. **Daily Revision:** Implement a '10-minute review' of everything taught in school today before going to bed. This reinforces short-term memory.`
        };
      }
      return {
        content: `Here is the academic performance profile for ${childName}:
- **Overall Grade:** A (82%)
- **Class Rank:** 5th out of 42 students in Class ${activeChild?.class || "9"}${activeChild?.section || "B"}
- **Homework Submission:** 92% (Regular)

**Subject Averages:**
- Mathematics: 88% (Excellent problem solving)
- Science: 74% (Needs extra practice with cell structures & formulas)
- Social Science: 81% (Good historical analysis)
- English: 85% (Strong grammar and writing skills)
- Tamil: 83% (Good reading flow)

**💡 Practical Study & Review Tips (Apart from the App):**
1. **Quiet Study Zone:** Establish a tidy, distraction-free study space at home. Keep phones, TV, and other digital devices away during study hours.
2. **Active Explanation:** Ask ${childName} to explain complex Science or History topics to you. Teaching a concept is the best way to master it.
3. **Daily Revision:** Implement a '10-minute review' of everything taught in school today before going to bed. This reinforces short-term memory.`
      };
    }

    if (category === "attendance") {
      if (isTamil) {
        const pctText = realData?.kpis?.attendance?.value ?? "96.5%";
        return {
          content: `${childName}-ன் வருகைப்பதிவு விவரங்கள்:
- **வருகை விகிதம்:** ${pctText} (மிகவும் நன்று)
- **மொத்த வேலை நாட்கள்:** 120 நாட்கள்
- **வந்த நாட்கள்:** 116 நாட்கள்
- **விடுப்பு நாட்கள்:** 4 நாட்கள் (ஜூன் 10, 11 தேதிகளில் விடுப்பு ஒப்புதல் பெறப்பட்டது)

✅ மிக நன்று! ${childName}-ன் வருகைப்பதிவு அரசு நிர்ணயித்த 85% வரம்பிற்கு மேல் உள்ளது.

**💡 வருகைப்பதிவை மேம்படுத்தவும் ஆரோக்கியத்தைப் பேணவும் டிப்ஸ்:**
1. **சீரான உறக்க முறை:** இரவு 9:30 மணிக்குள் படுக்கைக்குச் செல்வதை உறுதிசெய்யுங்கள். இது காலையில் புத்துணர்ச்சியுடன் பள்ளிக்குச் செல்ல உதவும்.
2. **முன்கூட்டியே திட்டமிடல்:** பள்ளி பை, சீருடை மற்றும் மதிய உணவுப் பெட்டிகளை முந்தைய இரவே தயார் செய்து வைப்பது காலையில் பதற்றத்தைக் குறைக்கும்.
3. **ஆரோக்கியமான உணவு:** காலையில் சத்தான காலை உணவு மற்றும் இலை காய்கறிகளை அதிகம் உணவில் சேர்த்து நோய் எதிர்ப்புச் சக்தியை அதிகரிக்கவும்.`
        };
      }
      if (realData) {
        const pct = realData.kpis.attendance.raw;
        const warning = pct < 85
          ? `\n\n⚠️ **Warning:** ${childName}'s attendance is below the 85% state policy minimum. Frequent absences may affect exam eligibility and scholarship claims.`
          : `\n\n✅ Great! Attendance rate meets the 85% minimum compliance.`;
        return {
          content: `${childName}'s Attendance Summary:
- **Attendance Rate:** ${realData.kpis.attendance.value} (${realData.kpis.attendance.sub})
- **Status:** Regular${warning}

**💡 Attendance & Morning Routine Tips (Apart from the App):**
1. **Consistent Bedtime:** Encourage sleeping by 9:30 PM. 8 hours of sleep prevents morning fatigue and school hesitation.
2. **Night-Before Prep:** Lay out the uniform, socks, shoes, and school bags the night before. This eliminates 90% of morning rush stress.
3. **Healthy Diet:** Ensure a wholesome breakfast. Healthy food avoids frequent sick leaves.`
        };
      }
      return {
        content: `${childName}'s Attendance Summary:
- **Attendance Rate:** 96.5% (High regularity)
- **Total Working Days:** 120 days
- **Days Present:** 116 days
- **Days Absent:** 4 days (Casual leave approved on June 10th and 11th)

✅ Great! ${childName}'s attendance is well above the required 85% threshold.

**💡 Attendance & Morning Routine Tips (Apart from the App):**
1. **Consistent Bedtime:** Encourage sleeping by 9:30 PM. 8-9 hours of sleep prevents morning fatigue and school hesitation.
2. **Night-Before Prep:** Lay out the uniform, socks, shoes, and school bags the night before. This eliminates 90% of morning rush stress.
3. **Healthy Diet:** Ensure a wholesome breakfast. Healthy food avoids seasonal flu and frequent sick leaves.`
      };
    }

    if (category === "homework") {
      if (isTamil) {
        return {
          content: `${childName}-ன் வீட்டுப்பாடம் மற்றும் பாடப்பணி விவரங்கள்:
- **சமர்ப்பிப்பு விகிதம்:** 92%
- **நிலுவையில் உள்ளவை (2):**
  1. 📖 **கணிதம்:** பயிற்சி 4.2 (இருபடிச் சமன்பாடுகள்) — நாளை காலைக்குள் சமர்ப்பிக்க வேண்டும்.
  2. 🧪 **அறிவியல்:** வேதியியல் ஆய்வக அறிக்கை (அமிலங்கள் & காரங்கள்) — 1 நாள் தாமதம்.

**💡 வீட்டுப்பாடங்களை சரியான நேரத்தில் முடிக்க உதவும் நடைமுறை உதவிக்குறிப்புகள் (Tips for On-Time Homework):**
1. **வீட்டுப்பாட நேரம் (Homework Hour):** பள்ளி முடிந்து வந்தவுடன் அல்லது மாலையில் ஒரு குறிப்பிட்ட நேரத்தை (எ.கா. மாலை 5:30 - 6:30) வீட்டுப்பாடம் செய்ய நிலையாக ஒதுக்குங்கள்.
2. **சிறிய இலக்குகள்:** பெரிய திட்டங்களை அல்லது நீண்ட வீட்டுப்பாடங்களை ஒரே நேரத்தில் செய்யாமல், சிறிய பகுதிகளாகப் பிரித்துச் செய்யச் சொல்லுங்கள்.
3. **கவனச் சிதறல்களைத் தவிர்த்தல்:** வீட்டுப்பாடம் செய்யும் நேரத்தில் மொபைல், தொலைக்காட்சி, கேம்களை முழுமையாக அணைத்து விடுங்கள்.
4. **தினசரி நாட்காட்டி:** மேஜையின் மேல் ஒரு சிறு நாட்காட்டி அல்லது டைரி வைத்து, வீட்டுப்பாடங்களின் கடைசித் தேதிகளை எழுதப் பழக்குங்கள்.
5. **பாராட்டு மற்றும் ஊக்கம்:** வீட்டுப்பாடத்தை முன்னதாகவே முடித்தால் சிறிய பாராட்டு அல்லது ஊக்கத்தை அளியுங்கள். இது நேர்மறை பழக்கத்தை உருவாக்கும்.`
        };
      }
      return {
        content: `Here is the Homework & Classwork assignment report for ${childName}:
- **Overall Submission Rate:** 92%
- **Pending Tasks (2):**
  1. 📖 **Mathematics:** Exercise 4.2 (Quadratic Equations) — Due tomorrow morning.
  2. 🧪 **Science:** Chemistry Lab Report (Acids & Bases) — Overdue by 1 day.

**💡 Practical Tips to Improve On-Time Homework Submissions (Apart from the App):**
1. **The Fixed "Homework Hour":** Establish a set, non-negotiable homework window daily (e.g., 5:30 PM to 6:30 PM). Routines eliminate arguments and build strong habits.
2. **Break Down Big Tasks:** Large assignments or science projects can feel overwhelming. Guide your child to break them into smaller, 15-minute chunks across a few days.
3. **Clear Distractions:** Switch off TVs and keep all smartphones in another room during study hour. Focus improves when temptations are removed.
4. **Visual Checklist:** Use a physical diary or white-board. Writing down tasks and physically ticking them off provides a psychological boost.
5. **Daily Review:** Review the school diary together for 5 minutes right after school to align on expectations early in the evening.`
      };
    }

    if (category === "examinations") {
      if (isTamil) {
        return {
          content: `வகுப்பு ${activeChild?.class || "9"}${activeChild?.section || "B"}-க்கான முதல் பருவத் தேர்வு கால அட்டவணை:
- **தமிழ்:** தாள் I — செப்டம்பர் 15 (முற்பகல் 10:00 - பிற்பகல் 1:00)
- **ஆங்கிலம்:** தாள் II — செப்டம்பர் 17 (முற்பகல் 10:00 - பிற்பகல் 1:00)
- **கணிதம்:** — செப்டம்பர் 19 (முற்பகல் 10:00 - பிற்பகல் 1:00)
- **அறிவியல்:** — செப்டம்பர் 21 (முற்பகல் 10:00 - பிற்பகல் 1:00)
- **சமூக அறிவியல்:** — செப்டம்பர் 23 (முற்பகல் 10:00 - பிற்பகல் 1:00)

**💡 தேர்வுத் தயாரிப்புக்கான சிறந்த உதவிக்குறிப்புகள்:**
1. **போமோடோரோ முறை (Pomodoro Technique):** 25 நிமிடங்கள் படித்துவிட்டு 5 நிமிடங்கள் ஓய்வு எடுக்கச் சொல்லுங்கள். இதனால் மூளை சோர்வடையாமல் சுறுசுறுப்பாக இருக்கும்.
2. **மாதிரித் தேர்வுகள்:** பழைய வினாத்தாள்களைக் கொடுத்து குறிப்பிட்ட நேரத்திற்குள் எழுதிப் பயிற்சி செய்யச் சொல்லுங்கள். இது நேர மேலாண்மையை வளர்க்கும்.
3. **சந்தேகங்களைத் தீர்த்தல்:** ஏதேனும் கடினமான தலைப்புகள் இருந்தால், தேர்வுக்கு முன்னரே ஆசிரியரிடம் கேட்டுத் தெளிவுபெறச் சொல்லுங்கள்.`
        };
      }
      return {
        content: `Upcoming Term-I Board Examination timetable for Class ${activeChild?.class || "9"}${activeChild?.section || "B"}:
- **Language (Tamil):** Paper I — September 15 (10:00 AM - 1:00 PM)
- **English:** Paper II — September 17 (10:00 AM - 1:00 PM)
- **Mathematics:** — September 19 (10:00 AM - 1:00 PM)
- **Science:** — September 21 (10:00 AM - 1:00 PM)
- **Social Science:** — September 23 (10:00 AM - 1:00 PM)

**💡 Real-World Exam Prep Tips (Apart from the App):**
1. **The Pomodoro Study Blocks:** Study in focused, 25-minute intervals with a 5-minute hydration break. Studying for hours straight causes fatigue and low retention.
2. **Solve Old Papers:** Print past papers and let them solve them on paper under timed exam conditions. This builds write-speed and exam confidence.
3. **Formulas Flashcards:** Help your child write Math formulas or Science terms on small index cards to review quickly in their free time.`
      };
    }

    if (category === "activities") {
      if (isTamil) {
        return {
          content: `வரவிருக்கும் பள்ளி நடவடிக்கைகள் மற்றும் பெற்றோருக்கான நிகழ்வுகள்:
- **PTA பொதுக்குழு கூட்டம்:** ஜூன் 24 அன்று பிற்பகல் 2:30 மணிக்கு பள்ளி கூட்ட அரங்கில் நடைபெறும். *பொருள்:* தேர்வுத் தயாரிப்பு மற்றும் கல்வி போர்டல் பயன்பாடு.
- **ஆண்டு விளையாட்டு விழா:** ஜூலை 28 அன்று பள்ளி விளையாட்டு மைதானத்தில் நடைபெறும். ${childName} 100 மீட்டர் ஓட்டப்பந்தயம் மற்றும் தொடர் ஓட்டப்பந்தயத்தில் பங்கேற்கிறார்.
- **அறிவியல் கண்காட்சி:** ஆகஸ்ட் 12 அன்று பள்ளி ஆடிட்டோரியத்தில் நடைபெறும்.

**💡 பெற்றோர் மற்றும் மாணவர் பங்களிப்பு உதவிக்குறிப்புகள்:**
1. **விளையாட்டு ஆர்வம்:** விளையாட்டு போன்ற பிற செயல்பாடுகளில் பங்கேற்பது உடல் நலத்தையும், குழு உணர்வையும், நேர மேலாண்மையையும் வளர்க்கும்.
2. **PTA கூட்டங்கள்:** பள்ளி PTA கூட்டங்களில் தொடர்ந்து பங்கேற்பதன் மூலம் பள்ளியின் முன்னேற்றம் மற்றும் குழந்தையின் கல்விச் சூழல் குறித்து அறிந்து கொள்ளலாம்.`
        };
      }
      return {
        content: `Upcoming School Activities & Parent Programs:
- **PTA General Body Meeting:** June 24th at 2:30 PM in the Main School Assembly Hall. *Agenda:* Discussion on board examination prep and smart portal usage.
- **Annual Sports Meet:** July 28th (8:00 AM - 4:00 PM). ${childName} has registered for the 100m sprint and 4x100m relay.
- **Science Camp Day:** August 12th in the school auditorium.

**💡 Real-World Co-curricular Tips (Apart from the App):**
1. **Holistic Growth:** Extracurricular activities build character, physical fitness, and teamwork. Celebrate non-academic participation as much as exam scores.
2. **Active PTA Attendance:** Make sure to attend parent-teacher meetings. Meeting other parents and teachers builds a support network for ${childName}.`
      };
    }

    if (category === "schemes") {
      if (isTamil) {
        return {
          content: `${childName}-க்குக் கிடைக்கக்கூடிய அரசு நலத்திட்டங்கள் & உதவித்தொகைகள்:
1. 🏛️ **தேசிய திறனாய்வு உதவித்தொகை (NMMS):** தகுதியுள்ள மாணவர்களுக்கு ஆண்டுக்கு ₹12,000 வழங்கப்படும். கடைசி நாள்: ஆகஸ்ட் 30.
2. 🍽️ **முதலமைச்சரின் சத்துணவுத் திட்டம்:** பயன்பாட்டில் உள்ளது (தினசரி ஊட்டச்சத்து உணவு வழங்கப்படுகிறது).
3. 🎒 **இலவச சீருடை & பாடப்புத்தகங்கள்:** இந்த கல்வி ஆண்டிற்கான சீருடைகள் மற்றும் புத்தகங்கள் வழங்கப்பட்டுவிட்டன.
4. 🚲 **இலவச மிதிவண்டி திட்டம்:** 11-ஆம் வகுப்பில் வழங்கப்படும்.
5. 💻 **இலவச மடிக்கணினி திட்டம்:** 12-ஆம் வகுப்பில் வழங்கப்படும்.

**💡 நலத்திட்டங்களுக்கான நடைமுறை ஆலோசனைகள்:**
1. **சான்றிதழ்கள் தயார் நிலை:** குடும்ப வருமானச் சான்றிதழ் மற்றும் சாதிச் சான்றிதழை எப்போதும் புதுப்பித்து வைத்துக் கொள்ளுங்கள். இது உதவித்தொகை விண்ணப்பங்களை விரைவாக முடிக்க உதவும்.
2. **அலுவலகத் தொடர்பு:** தகுதியுள்ள திட்டங்கள் பற்றித் தெளிவு பெற பள்ளி அலுவலகத்தைத் தொடர்பு கொண்டு விவரங்களைக் கேட்டுப் பெறுங்கள்.`
        };
      }
      return {
        content: `Here are the Government Welfare Schemes & Scholarships active for ${childName}:
1. 🏛️ **National Means-cum-Merit Scholarship (NMMS):** Priya is eligible. Provides ₹12,000 yearly scholarship. Deadline to apply: August 30.
2. 🍽️ **Chief Minister's Mid-Day Meal Scheme:** Active. Balanced hot lunch served daily at school.
3. 🎒 **Free Uniforms & Textbooks:** Term-I distributions completed successfully.
4. 🚲 **Free Cycle Distribution Scheme:** Scheduled for Class 11 entry.
5. 💻 **Free Laptop Scheme:** Scheduled for Class 12 entry.

**💡 Application & Scheme Verification Tips (Apart from the App):**
1. **Keep Certificates Ready:** Keep your digital income certificate and community certificate ready and updated. 90% of welfare scheme delays happen due to expired document proofs.
2. **Liaise with Staff:** Check-in with the school administrative clerk twice a year regarding upcoming scholarship forms.`
      };
    }

    return {
      content: `Processed query: *"${query}"*. In production, this integrates with real-time EMIS school databases and curriculum servers.`
    };
  }, [childName, activeChild, parentId, activeLanguage]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      const response = await generateContextualResponse(text);
      const aiMsg: ChatMessage = {
        role: "assistant",
        content: response.content,
        isWarning: response.isWarning,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 850);
  };

  const suggestedChips = [
    { label: "Performance", query: `How is ${childName} performing in Science?`, icon: "fi fi-rr-stats" },
    { label: "Attendance", query: `Is ${childName} regular in attending classes?`, icon: "fi fi-rr-calendar" },
    { label: "Homework Tips", query: `What are some tips to help ${childName} finish homework on time?`, icon: "fi fi-rr-notebook" },
    { label: "Exams", query: `When is the exam timetable for ${childName}?`, icon: "fi fi-rr-document" },
    { label: "Activities", query: `Are there any upcoming PTA meetings or activities?`, icon: "fi fi-rr-school" },
    { label: "Govt Schemes", query: `What government welfare schemes apply to ${childName}?`, icon: "fi fi-rr-bank" }
  ];

  return (
    <PortalLayout
      title="AI Parent Assistant"
      subtitle={`Bilingual AI advisor to help you stay updated and guide ${childName}'s studies`}
    >
      <ChildSwitcher childList={children} active={activeChild} onChange={setActiveChild} />

      <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full min-h-[calc(100vh-220px)] lg:h-[calc(100vh-220px)] relative overflow-hidden">
        
        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Side Panel (Scope & Settings) - Mobile Drawer overlay / Desktop static side-by-side */}
        <div className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          fixed lg:static inset-y-0 left-0 z-40 w-80 max-w-[85vw] p-5 lg:p-0 
          bg-[var(--bg-card)] lg:bg-transparent border-r lg:border-r-0 border-[var(--border)]
          transition-transform duration-300 ease-in-out flex flex-col gap-4 overflow-y-auto lg:overflow-visible shrink-0
        `}>
          
          {/* Limitations and Scope Panel - Flat Icons Only */}
          <div className="glass rounded-2xl p-5 border border-[var(--border)] bg-[var(--bg-card)] flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between text-emerald-500 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-info text-base"></i>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-heading)]">Assistant Scope & Limits</div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                title="Close Info Panel"
              >
                <i className="fi fi-rr-cross-small text-lg"></i>
              </button>
            </div>
            
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              This assistant is strictly configured to answer queries regarding school data and student welfare.
            </p>

            <div className="flex flex-col gap-2.5 mt-2">
              <div className="flex items-start gap-3">
                <i className="fi fi-rr-stats text-emerald-500 text-sm mt-0.5"></i>
                <div>
                  <h4 className="text-[11px] font-bold text-[var(--text-heading)]">Student Performance</h4>
                  <p className="text-[9px] text-[var(--text-muted)]">Class ranks, grades, and subjects averages.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fi fi-rr-calendar text-emerald-500 text-sm mt-0.5"></i>
                <div>
                  <h4 className="text-[11px] font-bold text-[var(--text-heading)]">Attendance Tracker</h4>
                  <p className="text-[9px] text-[var(--text-muted)]">Absent/present percentages and leave summaries.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fi fi-rr-notebook text-emerald-500 text-sm mt-0.5"></i>
                <div>
                  <h4 className="text-[11px] font-bold text-[var(--text-heading)]">Homework Status</h4>
                  <p className="text-[9px] text-[var(--text-muted)]">Submission checks and pending school tasks.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fi fi-rr-document text-emerald-500 text-sm mt-0.5"></i>
                <div>
                  <h4 className="text-[11px] font-bold text-[var(--text-heading)]">Examinations Schedule</h4>
                  <p className="text-[9px] text-[var(--text-muted)]">Test schedules, syllabus, and mock prep guides.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fi fi-rr-school text-emerald-500 text-sm mt-0.5"></i>
                <div>
                  <h4 className="text-[11px] font-bold text-[var(--text-heading)]">School Activities</h4>
                  <p className="text-[9px] text-[var(--text-muted)]">PTA meeting logs, sports meets, and functions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fi fi-rr-bank text-emerald-500 text-sm mt-0.5"></i>
                <div>
                  <h4 className="text-[11px] font-bold text-[var(--text-heading)]">Government Schemes</h4>
                  <p className="text-[9px] text-[var(--text-muted)]">Scholarships, meal schemes, free laptop/cycles eligibility.</p>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-3 border-t border-[var(--border)] flex items-start gap-2 bg-[var(--bg-main)] p-2.5 rounded-xl border border-red-500/10">
              <i className="fi fi-rr-shield-exclamation text-amber-500 text-xs mt-0.5"></i>
              <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">
                <span className="text-amber-500 font-semibold">Strict Rule:</span> Queries outside these boundaries are not answered to keep discussions school-focused.
              </p>
            </div>
          </div>

          {/* Quick Language Toggle - Tamil & English Only */}
          <div className="glass rounded-2xl p-4 border border-[var(--border)] bg-[var(--bg-card)] flex flex-col gap-2">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <i className="fi fi-rr-globe text-emerald-500"></i> Assistant Language
            </div>
            <div className="flex flex-col gap-1.5">
              {(["tamil", "english"] as const).map((lang) => (
                <button
                  key={lang}
                  id={`ai-lang-${lang}`}
                  onClick={() => setActiveLanguage(lang)}
                  className={`text-left text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2.5 border ${
                    activeLanguage === lang 
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20" 
                      : "text-[var(--text-muted)] hover:text-[var(--text-heading)] bg-[var(--bg-main)] hover:bg-[var(--sidebar-item-hover-bg)] border-[var(--border)] hover:border-slate-355 dark:hover:border-slate-700"
                  }`}
                >
                  <i className={lang === "tamil" ? "fi fi-rr-document" : "fi fi-rr-comment-alt"}></i>
                  <span className="font-semibold">{lang === "tamil" ? "தமிழ் (Tamil)" : "English (English)"}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Chat Interface Column - Takes remaining width and fits height */}
        <div className="flex flex-col glass rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl relative flex-1 bg-[var(--bg-card)]">
          
          {/* Chat Workspace Header - Flat Icons Only */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-card)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg text-white">
                <i className="fi fi-rr-sparkles text-lg"></i>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2">
                  Parent AI Assistant
                  <span className="badge badge-green text-[8px] tracking-wider font-extrabold select-none">Official</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  {activeLanguage === "tamil" ? "தமிழ் பயன்முறை" : "English Mode"} Active
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-[var(--text-muted)] hover:text-emerald-500 p-2 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--sidebar-item-hover-bg)] active:scale-95 transition-all text-xs flex items-center gap-1 border border-[var(--border)] font-bold"
                title="Toggle Scope & Language"
              >
                <i className="fi fi-rr-info"></i>
                <span>Info</span>
              </button>
              <span className="text-[10px] bg-[var(--sidebar-item-hover-bg)] border border-[var(--border)] text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1.5 rounded-xl shadow-inner flex items-center gap-1.5">
                <i className="fi fi-rr-user text-emerald-500 text-xs"></i>
                {childLabel}
              </span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[calc(100vh-380px)] lg:max-h-none lg:flex-1 bg-[var(--bg-main)]/30">
            {messages.map((msg, i) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div key={i} className={`flex gap-3 items-start ${isAssistant ? "justify-start" : "justify-end"} fade-in`}>
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-emerald-500 flex-shrink-0 shadow-sm">
                      <i className="fi fi-rr-sparkles text-xs"></i>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all shadow-sm ${
                      isAssistant
                        ? msg.isWarning
                          ? "bg-amber-500/5 text-[var(--text-main)] border border-amber-500/20 rounded-tl-none shadow-amber-500/5"
                          : "bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border)] rounded-tl-none"
                        : "bg-[var(--portal-color,#10b981)] text-white rounded-tr-none"
                    }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {isAssistant && msg.isWarning ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5 font-bold text-amber-600 dark:text-amber-400 border-b border-amber-500/20 pb-2">
                          <i className="fi fi-rr-shield-exclamation text-sm"></i>
                          <span>{activeLanguage === "tamil" ? "வரம்புகளுக்கு அப்பாற்பட்ட கேள்வி" : "Query Out of Scope"}</span>
                        </div>
                        <p className="mb-3 text-[11px] leading-relaxed">
                          {msg.content.split("\n\n")[0]}
                        </p>
                        <div className="bg-[var(--bg-main)]/50 p-3 rounded-xl border border-[var(--border)] flex flex-col gap-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                            {activeLanguage === "tamil" ? "அனுமதிக்கப்பட்ட தலைப்புகள்:" : "Permitted Categories:"}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                            <div className="flex items-center gap-2">
                              <i className="fi fi-rr-stats text-emerald-500 text-xs"></i> 
                              <span>{activeLanguage === "tamil" ? "கல்வித் திறன்" : "Performance"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="fi fi-rr-calendar text-emerald-500 text-xs"></i> 
                              <span>{activeLanguage === "tamil" ? "வருகைப்பதிவு" : "Attendance"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="fi fi-rr-notebook text-emerald-500 text-xs"></i> 
                              <span>{activeLanguage === "tamil" ? "வீட்டுப்பாடம்" : "Homework"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="fi fi-rr-document text-emerald-500 text-xs"></i> 
                              <span>{activeLanguage === "tamil" ? "தேர்வுகள்" : "Examinations"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="fi fi-rr-school text-emerald-500 text-xs"></i> 
                              <span>{activeLanguage === "tamil" ? "பள்ளி நடவடிக்கைகள்" : "School Activities"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <i className="fi fi-rr-bank text-emerald-500 text-xs"></i> 
                              <span>{activeLanguage === "tamil" ? "அரசு நலத்திட்டங்கள்" : "Govt Schemes"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-[var(--portal-color,#10b981)] text-white flex items-center justify-center flex-shrink-0 font-black text-xs shadow-md">
                      <i className="fi fi-rr-user text-white"></i>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-emerald-500 flex-shrink-0">
                  <i className="fi fi-rr-sparkles text-xs animate-pulse"></i>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Queries - Flat Icons Only */}
          <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-card-hover)] flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
              <i className="fi fi-rr-comment-alt text-emerald-500"></i> Suggestions:
            </span>
            <div className="flex flex-wrap gap-2 w-full">
              {suggestedChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-emerald-500/30 text-[var(--text-main)] hover:text-emerald-500 hover:bg-emerald-650/5 transition-all flex-shrink-0 shadow-sm"
                >
                  <i className={chip.icon}></i>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Form - Flat Icons Only */}
          <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--bg-card)] backdrop-blur-md">
            <div className="flex gap-3">
              <input
                id="ai-assistant-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={activeLanguage === "tamil" ? `கேள்விகளைக் கேளுங்கள்...` : `Ask about ${childName}'s performance, attendance, homework, exams, activities, or schemes...`}
                className="flex-1 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3.5 text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                id="ai-assistant-send-btn"
                onClick={() => handleSendMessage()}
                className="px-5 py-3 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all active:scale-95 flex-shrink-0 flex items-center gap-2 shadow-lg shadow-emerald-500/10"
              >
                <span>{activeLanguage === "tamil" ? "அனுப்பு" : "Send"}</span>
                <i className="fi fi-rr-paper-plane text-xs"></i>
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-2.5 text-[10px] text-[var(--text-muted)]">
              <div className="flex gap-3">
                <button id="ai-assistant-voice-btn" className="hover:text-emerald-550 transition-colors flex items-center gap-1 font-semibold">
                  <i className="fi fi-rr-microphone"></i> {activeLanguage === "tamil" ? "குரல் வழி" : "Voice Input"}
                </button>
                <span>·</span>
                <button id="ai-assistant-clear-btn" onClick={() => setMessages([messages[0]])} className="hover:text-red-500 transition-colors flex items-center gap-1 font-semibold">
                  <i className="fi fi-rr-trash"></i> {activeLanguage === "tamil" ? "மீட்டமை" : "Reset Chat"}
                </button>
              </div>
              <div className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
                <i className="fi fi-rr-info text-emerald-500"></i> Limits enforced dynamically
              </div>
            </div>
          </div>

        </div>
      </div>
    </PortalLayout>
  );
}
