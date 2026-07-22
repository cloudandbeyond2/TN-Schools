"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Question {
  id: number;
  question: string;
  questionTamil: string;
  options: string[];
  optionsTamil: string[];
  correctIndex: number;
  explanation: string;
  explanationTamil: string;
}

interface Resource {
  id: string;
  classLevel: string; // "Class 6", "Class 7", "Class 8"
  title: string;
  category: string; // Theme: "Real-World Explorations", "Science in Daily Life", "Tamil Heritage", "Inspirational Biographies", "Technology & Innovation", "Environment & Sustainability", "Life Skills", "Current Affairs"
  readTime: string;
  language: string;
  icon: string;
  description: string;
  didYouKnowEnglish: string;
  didYouKnowTamil: string;
  activityType: "Observe" | "Think" | "Reflect" | "Try at Home";
  activityIcon: string;
  activityTitleEnglish: string;
  activityTitleTamil: string;
  activityDescEnglish: string;
  activityDescTamil: string;
  contentEnglish: string[];
  contentTamil: string[];
  quiz: Question[];
}

// 📚 30 Educational Read & Discover Learning Explorations Dataset
const resourcesData: Resource[] = [
  // ── CLASS 6 LEARNING EXPLORATIONS (10 Resources) ────────────────────────────
  {
    id: "c6-1",
    classLevel: "Class 6",
    title: "Seed Germination & Plant Physiology",
    category: "Environment & Sustainability",
    readTime: "6 mins",
    language: "Bilingual",
    icon: "fi fi-rr-leaf",
    description: "Explore the biological process of seed germination, embryo awakening, radicle root development, and seedling growth.",
    didYouKnowEnglish: "Oak trees grown from acorns take up to 20 years to produce their first acorns, and a mature oak tree can absorb over 100 gallons of water per day!",
    didYouKnowTamil: "விதையிலிருந்து வளரும் ஓக் மரம் தனது முதல் விதையை உற்பத்தி செய்ய 20 ஆண்டுகள் வரை ஆகலாம்! மேலும் ஒரு முதிர்ந்த மரம் நாளில் 100 கேலன் நீரை உறிஞ்சும்!",
    activityType: "Try at Home",
    activityIcon: "fi fi-rr-house-chimney",
    activityTitleEnglish: "Sprout Your Own Seed",
    activityTitleTamil: "சொந்தமாக விதையை முளைக்க வைப்போம்",
    activityDescEnglish: "Place a green gram (moong seed) inside a moist cotton cloth for 24 hours. Observe the white radicle root emerging!",
    activityDescTamil: "ஒரு பச்சைப்பயறை ஈரமான பருத்தித் துணியில் 24 மணி நேரம் வைக்கவும். வெளிவரும் வெள்ளை நிற முதன்மை வேரைக் கூர்ந்து கவனிக்கவும்!",
    contentEnglish: [
      "Seed germination begins when a dry seed absorbs water through a tiny pore called the micropyle. This imbibition process causes the seed coat to swell and crack open.",
      "Inside the seed, water activates enzymes that break down stored starch into simple sugars, nourishing the living plant embryo.",
      "The primary root, called the radicle, emerges first and grows downward into the soil to anchor the plant and absorb essential minerals.",
      "Next, the embryonic shoot (plumule) reaches upward toward sunlight, unfurling embryonic leaves (cotyledons) to begin photosynthesis."
    ],
    contentTamil: [
      "விதை முளைத்தல் என்பது ஒரு உலர் விதை 'மைக்ரோபைல்' என்ற நுண் துளை வழியே நீரை உறிஞ்சுவதில் தொடங்குகிறது. இந்த நீர் உறிஞ்சுதல் விதை உறையை வீங்கிப் பிளக்கச் செய்கிறது.",
      "விதைக்குள்ளே உள்ள நீர், நொதிகளைச் செயலாக்கி, சேமிக்கப்பட்ட மாவுச்சத்தை எளிய சர்க்கரையாக மாற்றி, வாழும் தாவரக் கருவுக்கு ஊட்டச்சத்து அளிக்கிறது.",
      "முதன்மை வேர் (Radicle) முதலில் வெளிப்பட்டு, மண்ணில் கீழ்நோக்கிச் சென்று தாவரத்தை நிலைநிறுத்தி கனிமங்களை உறிஞ்சுகிறது.",
      "அடுத்து, இளம் குருத்து (Plumule) சூரிய ஒளியை நோக்கி மேல்நோக்கி வளர்ந்து, ஒளிச்சேர்க்கையைத் தொடங்க இலையிலைகளை விரிக்கும்."
    ],
    quiz: [
      { id: 1, question: "What is the initial absorption of water by a seed called?", questionTamil: "விதை நீரை உறிஞ்சும் ஆரம்ப செயல்முறை எவ்வாறு அழைக்கப்படுகிறது?", options: ["Imbibition", "Evaporation", "Combustion", "Condensation"], optionsTamil: ["நீர் உறிஞ்சுதல் (Imbibition)", "ஆவியாதல்", "எரிதல்", "சுருங்குதல்"], correctIndex: 0, explanation: "Imbibition is the physical absorption of water by dry seeds.", explanationTamil: "உலர் விதைகள் நீரை உறிஞ்சும் செயல்முறை இது." },
      { id: 2, question: "Which embryonic part emerges first during seed germination?", questionTamil: "விதை முளைத்தலின் போது முதலில் வெளிவரும் பகுதி எது?", options: ["Radicle (Primary Root)", "Plumule (Shoot)", "Flower", "Fruit"], optionsTamil: ["வேர்க்குருத்து / வேர் (Radicle)", "தண்டுக்குருத்து", "மலர்", "கனி"], correctIndex: 0, explanation: "The radicle emerges first to anchor in soil.", explanationTamil: "முதன்மை வேரே முதலில் மண்ணிற்குள் செல்கிறது." },
      { id: 3, question: "What food molecule stored in seeds is broken down for embryonic growth?", questionTamil: "கருவின் வளர்ச்சிக்கு விதையில் சேமிக்கப்பட்டுள்ள எந்த உணவு மூலக்கூறு சிதைக்கப்படுகிறது?", options: ["Starch into Sugars", "Plastic", "Salt", "Iron"], optionsTamil: ["மாவுச்சத்து சர்க்கரையாக (Starch into Sugars)", "பிளாஸ்டிக்", "உப்பு", "இரும்பு"], correctIndex: 0, explanation: "Stored starch is converted into glucose for energy.", explanationTamil: "சேமிக்கப்பட்ட மாவுச்சத்து சர்க்கரையாக மாறுகிறது." },
      { id: 4, question: "What direction does the embryonic radicle root grow?", questionTamil: "வேர்க்குருத்து எந்தத் திசையை நோக்கி வளர்கிறது?", options: ["Downward into soil (Geotropism)", "Upward to sky", "Horizontal only", "Inside water only"], optionsTamil: ["மண்ணை நோக்கி கீழ்நோக்கி (Geotropism)", "வானத்தை நோக்கி", "கிடைமட்டமாக", "நீருக்குள் மட்டும்"], correctIndex: 0, explanation: "Roots display positive geotropism, growing downward.", explanationTamil: "வேர் புவிஈர்ப்பை நோக்கி கீழ்நோக்கி வளரும்." },
      { id: 5, question: "How long can mature Oak trees take to produce their first acorns?", questionTamil: "ஓக் மரம் தனது முதல் விதையை உருவாக்க எத்தனை ஆண்டுகள் ஆகலாம்?", options: ["Up to 20 years", "1 year", "10 days", "100 years"], optionsTamil: ["20 ஆண்டுகள் வரை", "1 ஆண்டு", "10 நாட்கள்", "100 ஆண்டுகள்"], correctIndex: 0, explanation: "Oaks take around 20 years to reach acorn maturity.", explanationTamil: "ஓக் மரங்கள் விதைகளைத் தர 20 ஆண்டுகள் ஆகும்." }
    ]
  },
  {
    id: "c6-2",
    classLevel: "Class 6",
    title: "A.P.J. Abdul Kalam & Missile Technology",
    category: "Inspirational Biographies",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-rocket-lunch",
    description: "Discover the early life of Dr. A.P.J. Abdul Kalam in Rameswaram and his contributions to India's SLV-3 satellite launch vehicle and Agni missile systems.",
    didYouKnowEnglish: "Dr. A.P.J. Abdul Kalam directed the project team that successfully launched India's first indigenous Satellite Launch Vehicle (SLV-3) in July 1980, placing the Rohini satellite in orbit!",
    didYouKnowTamil: "1980 ஜூலையில் இந்தியாவின் முதல் உள்நாட்டு செயற்கைக்கோள் ஏவூர்தியான SLV-3 திட்டத்தை இயக்கி ரோஹிணி செயற்கைக்கோளை விண்ணில் செலுத்திய திட்டத்தின் இயக்குனர் டாக்டர் கலாம் ஆவார்!",
    activityType: "Reflect",
    activityIcon: "fi fi-rr-edit-alt",
    activityTitleEnglish: "Identify Your Big Dream",
    activityTitleTamil: "உன் பெரிய லட்சியத்தை எழுது",
    activityDescEnglish: "Write down one science or career dream you want to achieve for India by the time you complete your studies.",
    activityDescTamil: "உங்கள் படிப்பை முடிப்பதற்குள் இந்தியாவிற்கு நீங்கள் செய்ய விரும்பும் ஒரு அறிவியல் லட்சியத்தை குறிப்பேட்டில் எழுதுங்கள்.",
    contentEnglish: [
      "Born in 1931 in the coastal town of Rameswaram, Avul Pakir Jainulabdeen Abdul Kalam studied aeronautical engineering at the Madras Institute of Technology (MIT).",
      "Joining ISRO in 1969, Dr. Kalam served as the Project Director for India's first indigenous satellite launch vehicle, SLV-3, which successfully deployed the Rohini satellite into Earth orbit in 1980.",
      "Later at DRDO, he led the Integrated Guided Missile Development Programme (IGMDP), overseeing the development of strategic indigenous missiles including Agni and Prithvi.",
      "Serving as the 11th President of India from 2002 to 2007, Dr. Kalam inspired millions of young students across the nation to pursue scientific research and innovation."
    ],
    contentTamil: [
      "1931-ல் ராமேஸ்வரத்தில் பிறந்த அவுல் பக்கீர் ஜைனுலாப்தீன் அப்துல் கலாம், சென்னை தொழில்நுட்பக் கழகத்தில் (MIT) விண்வெளி பொறியியல் பயின்றார்.",
      "1969-ல் இஸ்ரோவில் இணைந்த டாக்டர் கலாம், இந்தியாவின் முதல் உள்நாட்டு செயற்கைக்கோள் ஏவு வாகனமான SLV-3 திட்டத்தின் இயக்குநராகப் பணியாற்றி, 1980-ல் ரோஹிணி செயற்கைக்கோளை வெற்றிகரமாக விண்ணில் செலுத்தினார்.",
      "பின்னர் DRDO-வில் ஒருங்கிணைந்த வழிகாட்டப்பட்ட ஏவுகணை வளர்ச்சி திட்டத்தை (IGMDP) வழிநடத்தி அக்னி மற்றும் பிரித்வி ஏவுகணைகளை உருவாக்கினார்.",
      "2002 முதல் 2007 வரை இந்தியாவின் 11-வது குடியரசுத் தலைவராகப் பணியாற்றிய டாக்டர் கலாம், லட்சக்கணக்கான மாணவர்களை அறிவியல் ஆராய்ச்சியில் ஈடுபட ஊக்கப்படுத்தினார்."
    ],
    quiz: [
      { id: 1, question: "In which year did ISRO successfully launch India's SLV-3 under Dr. Kalam's leadership?", questionTamil: "டாக்டர் கலாமின் தலைமையில் இஸ்ரோ எந்த ஆண்டு SLV-3 ஏவூர்தியை வெற்றிகரமாகச் செலுத்தியது?", options: ["1980", "1960", "2000", "1947"], optionsTamil: ["1980", "1960", "2000", "1947"], correctIndex: 0, explanation: "SLV-3 launched successfully on July 18, 1980.", explanationTamil: "1980 ஜூலை 18 அன்று SLV-3 வெற்றிகரமாக விண்ணில் பாய்ந்தது." },
      { id: 2, question: "Which institution did Dr. Kalam attend for his Aeronautical Engineering degree?", questionTamil: "விண்வெளி பொறியியல் படிப்பிற்காக டாக்டர் கலாம் பயின்ற நிறுவனம் எது?", options: ["Madras Institute of Technology (MIT)", "Harvard", "Oxford", "IISc"], optionsTamil: ["மெட்ராஸ் இன்ஸ்டிடியூட் ஆஃப் டெக்னாலஜி (MIT)", "ஹார்வர்டு", "ஆக்ஸ்ஃபோர்டு", "ஐஐஎஸ்சி"], correctIndex: 0, explanation: "He specialized in aeronautical engineering at MIT Chromepet.", explanationTamil: "அவர் சென்னை குரோம்பேட்டை MIT-யில் பயின்றார்." },
      { id: 3, question: "Which satellite was successfully placed into orbit by SLV-3 in 1980?", questionTamil: "1980-ல் SLV-3 மூலம் சுற்றுப்பாதையில் நிலைநிறுத்தப்பட்ட செயற்கைக்கோள் எது?", options: ["Rohini Satellite (RS-1)", "Apollo", "Sputnik", "Hubble"], optionsTamil: ["ரோஹிணி செயற்கைக்கோள் (RS-1)", "அப்பல்லோ", "ஸ்புட்னிக்", "ஹப்பிள்"], correctIndex: 0, explanation: "Rohini RS-1 was India's first satellite launched by an Indian rocket.", explanationTamil: "ரோஹிணி செயற்கைக்கோள் இந்தியாவின் ஏவூர்தியால் நிலைநிறுத்தப்பட்டது." },
      { id: 4, question: "Dr. A.P.J. Abdul Kalam served as which numbered President of India?", questionTamil: "டாக்டர் ஏ.பி.ஜே. அப்துல் கலாம் இந்தியாவின் எத்தனையாவது குடியரசுத் தலைவராகப் பணியாற்றினார்?", options: ["11th President", "1st President", "5th President", "15th President"], optionsTamil: ["11-வது குடியரசுத் தலைவர்", "1-வது", "5-வது", "15-வது"], correctIndex: 0, explanation: "He was India's 11th President from 2002 to 2007.", explanationTamil: "அவர் 2002-2007 வரை 11-வது குடியரசுத் தலைவராக இருந்தார்." },
      { id: 5, question: "Which strategic missile system development program was led by Dr. Kalam at DRDO?", questionTamil: "DRDO-வில் கலாம் வழிநடத்திய மூலோபாய ஏவுகணை வளர்ச்சி திட்டம் எது?", options: ["IGMDP (Integrated Guided Missile Development Programme)", "Apollo", "ISRO-1", "NASA-X"], optionsTamil: ["IGMDP ஏவுகணை திட்டம்", "அப்பல்லோ", "இஸ்ரோ-1", "நாசா-எக்ஸ்"], correctIndex: 0, explanation: "IGMDP developed the Agni and Prithvi missile series.", explanationTamil: "IGMDP திட்டம் மூலம் அக்னி ஏவுகணைகள் உருவாக்கப்பட்டன." }
    ]
  },
  {
    id: "c6-3",
    classLevel: "Class 6",
    title: "Engineering of Brihadeeswarar Temple",
    category: "Tamil Heritage",
    readTime: "10 mins",
    language: "Bilingual",
    icon: "fi fi-rr-building",
    description: "Examine the structural engineering, interlocking granite joinery, and 216-foot vimana architecture of Thanjavur's Big Temple.",
    didYouKnowEnglish: "The 81-ton monolithic granite capstone (Kumbam) at the peak of the 216-foot vimana tower was carved from a single granite block and raised using an inclined earthen ramp extending over 6 kilometers!",
    didYouKnowTamil: "216 அடி உயர விமானக் கோபுர உச்சியில் உள்ள 81 டன் எடையுள்ள சிகரக் கல் (கும்பம்) ஒரே பாறையில் செதுக்கப்பட்டு, 6 கி.மீ நீள சாய்வுப் பாதை மூலம் மேலே உயர்த்தப்பட்டது!",
    activityType: "Think",
    activityIcon: "fi fi-rr-brain",
    activityTitleEnglish: "Understand Inclined Planes",
    activityTitleTamil: "சாய்வுப் பாதையின் தத்துவத்தைப் புரிந்துகொள்வோம்",
    activityDescEnglish: "Why is it easier to push a heavy box up a long gentle ramp than lifting it straight up? Think about mechanical advantage!",
    activityDescTamil: "ஒரு கனமான பெட்டியை நேராகத் தூக்குவதை விட நீண்ட சாய்வுப் பாதையில் தள்ளுவது ஏன் எளிது? இதன் இயந்திர நன்மையைப் பற்றி யோசிக்கவும்!",
    contentEnglish: [
      "Completed in 1010 CE by Emperor Raja Raja Chola I, the Brihadeeswarar Temple in Thanjavur stands as a masterpiece of Dravidian granite architecture.",
      "The temple tower (Vimana) rises to a height of 216 feet (66 meters) and was constructed entirely of interlocking granite blocks without the use of binding mortar.",
      "To place the monolithic 81-ton granite capstone (Kumbam) atop the tower, Chola engineers constructed a massive inclined earthen ramp starting 6 km away in Sarapallam.",
      "Royal elephants and workers used rollers to gradually move the colossal stone block up the inclined ramp to its final resting place."
    ],
    contentTamil: [
      "கி.பி 1010-ல் முதலாம் ராஜராஜ சோழ பேரரசரால் நிறைவு செய்யப்பட்ட தஞ்சாவூர் பிரகதீஸ்வரர் கோயில் திராவிடக் கட்டிடக்கலையின் தலையாய சான்றாகும்.",
      "கோயில் கோபுரம் (விமானம்) 216 அடி (66 மீட்டர்) உயரத்திற்கு உயர்ந்து நிற்கிறது; இது எவ்வித சிமெண்ட்/சாந்தும் இல்லாமல் பிணைக்கப்பட்ட கிரானைட் கற்களால் கட்டப்பட்டது.",
      "கோபுரத்தின் உச்சியில் 81 டன் எடையுள்ள ஒற்றைக்கல் சிகரத்தைச் (கும்பம்) நிறுவ, சோழப் பொறியாளர்கள் சாரப்பள்ளத்திலிருந்து 6 கி.மீ நீள சாய்வுப் பாதையை அமைத்தனர்.",
      "யானைகளும் தொழிலாளர்களும் உருளைகளைப் பயன்படுத்தி அந்தப் பெரிய பாறையைச் சாய்வுப் பாதையில் மெதுவாகத் தள்ளி உச்சிக்குக் கொண்டு சேர்த்தனர்."
    ],
    quiz: [
      { id: 1, question: "In which century was the Brihadeeswarar Temple completed by Raja Raja Chola I?", questionTamil: "முதலாம் ராஜராஜ சோழனால் பிரகதீஸ்வரர் கோயில் எந்த நூற்றாண்டில் கட்டி முடிக்கப்பட்டது?", options: ["11th Century (1010 CE)", "5th Century", "18th Century", "20th Century"], optionsTamil: ["11-ஆம் நூற்றாண்டு (கி.பி 1010)", "5-ஆம் நூற்றாண்டு", "18-ஆம் நூற்றாண்டு", "20-ஆம் நூற்றாண்டு"], correctIndex: 0, explanation: "The temple consecration took place in 1010 CE.", explanationTamil: "இக்கோயில் கி.பி 1010-ல் குடமுழுக்கு செய்யப்பட்டது." },
      { id: 2, question: "What construction technique joined the heavy granite blocks without cement mortar?", questionTamil: "சிமெண்ட் சாந்து இல்லாமல் கனமான பாறைகளை இணைத்த கட்டுமான முறை எது?", options: ["Interlocking Granite Joinery", "Plastic Glue", "Steel Screws", "Clay Mud"], optionsTamil: ["இணைப்பு வடிவக் பாறை பிணைப்பு (Interlocking)", "பிளாஸ்டிக் பசை", "எஃகு திருகு", "களிமண்"], correctIndex: 0, explanation: "Granite stones were precision carved to interlock securely.", explanationTamil: "கற்கள் ஒன்றுடன் ஒன்று பொருந்தும்படி செதுக்கப்பட்டு பிணைக்கப்பட்டன." },
      { id: 3, question: "How tall is the central Vimana tower of the Thanjavur temple?", questionTamil: "தஞ்சைக் பெரிய கோயிலின் மைய விமானக் கோபுரம் எவ்வளவு உயரம் கொண்டது?", options: ["216 Feet (66 meters)", "50 Feet", "1,000 Feet", "10 Feet"], optionsTamil: ["216 அடி (66 மீட்டர்)", "50 அடி", "1,000 அடி", "10 அடி"], correctIndex: 0, explanation: "The main vimana tower rises 216 feet high.", explanationTamil: "விமானக் கோபுரம் 216 அடி உயரம் கொண்டது." },
      { id: 4, question: "From which nearby village did Chola engineers build the 6 km inclined ramp?", questionTamil: "6 கி.மீ சாய்வுப் பாதையை சோழ பொறியாளர்கள் எந்த அருகிலுள்ள கிராமத்திலிருந்து தொடங்கினர்?", options: ["Sarapallam", "Madurai", "Kanchi", "Poompuhar"], optionsTamil: ["சாரப்பள்ளம் (Sarapallam)", "மதுரை", "காஞ்சி", "பூம்புகார்"], correctIndex: 0, explanation: "The earthen ramp started from Sarapallam village.", explanationTamil: "சாரப்பள்ளம் கிராமத்திலிருந்து சாய்வுப் பாதை அமைக்கப்பட்டது." },
      { id: 5, question: "How heavy is the solid granite capstone (Kumbam) at the peak?", questionTamil: "கோயில் உச்சியில் உள்ள சிகரக் கல்லின் (கும்பம்) எடை எவ்வளவு?", options: ["81 Tons", "2 Tons", "500 Tons", "10 Tons"], optionsTamil: ["81 டன்", "2 டன்", "500 டன்", "10 டன்"], correctIndex: 0, explanation: "The monolithic granite capstone weighs 81 tons.", explanationTamil: "ஒற்றைக்கல் கும்பத்தின் எடை 81 டன் ஆகும்." }
    ]
  },
  {
    id: "c6-4",
    classLevel: "Class 6",
    title: "The Hydrological Cycle & Evaporation",
    category: "Real-World Explorations",
    readTime: "7 mins",
    language: "Bilingual",
    icon: "fi fi-rr-water",
    description: "Examine the continuous movement of water through solar evaporation, atmospheric condensation, precipitation, and groundwater runoff.",
    didYouKnowEnglish: "While individual water molecules evaporate and condense rapidly, deep ocean water currents take around 1,000 years to complete one global conveyor-belt circulation cycle!",
    didYouKnowTamil: "தனிப்பட்ட நீர் மூலக்கூறுகள் வேகமாக ஆவியானாலும், ஆழ்கடல் நீரோட்டங்கள் ஒரு உலகளாவிய சுழற்சியை முடிக்க சுமார் 1,000 ஆண்டுகள் ஆகின்றன!",
    activityType: "Try at Home",
    activityIcon: "fi fi-rr-house-chimney",
    activityTitleEnglish: "Mini Solar Water Cycle",
    activityTitleTamil: "சிறிய சூரிய நீர் சுழற்சி மாதிரி",
    activityDescEnglish: "Fill a clear glass cup with water, cover the top tightly with plastic wrap, and place it in sunlight. Observe water droplets condensing on the underside!",
    activityDescTamil: "ஒரு கண்ணாடியில் நீரை நிரப்பி, பிளாஸ்டிக் தாளால் மூடி வெயிலில் வைக்கவும். பிளாஸ்டிக் தாளின் அடியில் நீர் துளிகள் சுருங்குவதைக் கவனிக்கவும்!",
    contentEnglish: [
      "The hydrological cycle is driven by thermal energy from the Sun, which heats liquid surface water in oceans, lakes, and rivers, converting it into gaseous water vapor.",
      "As warm water vapor rises into the atmosphere, cooler temperatures cause it to condense into microscopic liquid droplets around airborne dust particles, forming clouds.",
      "When condensed cloud droplets accumulate and grow too heavy to remain suspended in air currents, gravity pulls them down as precipitation (rain, sleet, or snow).",
      "Precipitated water collects in rivers or percolates deep into soil layers to replenish underground aquifers, returning water back to the oceans."
    ],
    contentTamil: [
      "நீர் சுழற்சி சூரியனின் வெப்ப ஆற்றலால் இயக்கப்படுகிறது; இது கடல், ஏரிகள் மற்றும் ஆறுகளில் உள்ள நீரைச் சூடாக்கி வாயு நீராவியாக மாற்றுகிறது.",
      "வெப்பமான நீராவி வளிமண்டலத்தில் உயரே செல்லும்போது, குளிர்ந்த வெப்பநிலை அதை தூசிகளுடன் சேர்ந்து நுண் நீர் துளிகளாகச் சுருங்க வைத்து மேகங்களை உருவாக்குகிறது.",
      "சுருங்கிய மேகத் துளிகள் ஒன்றுதிரண்டு காற்றில் மிதக்க முடியாத அளவுக்குக் கனமாகும் போது, புவியீர்ப்பு விசை அவற்றை மழை அல்லது பனியாகக் (Precipitation) கீழே இழுக்கிறது.",
      "மழைநீர் ஆறுகளில் சேகரிக்கப்படுகிறது அல்லது மண்ணின் ஆழத்தில் ஊடுருவி நிலத்தடி நீர்நிலைகளை நிரப்பி, மீண்டும் பெருங்கடல்களுக்குத் திரும்புகிறது."
    ],
    quiz: [
      { id: 1, question: "Which primary energy source drives the global hydrological water cycle?", questionTamil: "உலகளாவிய நீர் சுழற்சியை இயக்கும் முதன்மை ஆற்றல் மூலம் எது?", options: ["Solar Thermal Energy from the Sun", "Windmills", "Batteries", "Nuclear Reactors"], optionsTamil: ["சூரிய வெப்ப ஆற்றல் (Solar Thermal Energy)", "காற்றாலை", "பேட்டரி", "அணு உலை"], correctIndex: 0, explanation: "Solar heat evaporates surface water to drive the water cycle.", explanationTamil: "சூரிய வெப்பமே நீரை ஆவியாக்கி சுழற்சியை இயக்குகிறது." },
      { id: 2, question: "What is the transformation of water vapor into liquid water droplets called?", questionTamil: "நீராவி திரவ நீர் துளிகளாக மாறுவது எவ்வாறு அழைக்கப்படுகிறது?", options: ["Condensation", "Evaporation", "Sublimation", "Melting"], optionsTamil: ["சுருங்குதல் (Condensation)", "ஆவியாதல்", "பதங்கமாதல்", "உருகுதல்"], correctIndex: 0, explanation: "Condensation forms clouds as water vapor cools.", explanationTamil: "நீராவி குளிர்ந்து மேகமாக மாறுவது சுருங்குதல் ஆகும்." },
      { id: 3, question: "What term describes rain, snow, or sleet falling from clouds to Earth?", questionTamil: "மேகங்களிலிருந்து பூமிக்கு விழும் மழை அல்லது பனி எவ்வாறு அழைக்கப்படுகிறது?", options: ["Precipitation", "Transpiration", "Conduction", "Friction"], optionsTamil: ["மழைப்பொழிவு (Precipitation)", "நீராவிப்போக்கு", "வெப்பக்கடத்தல்", "உராய்வு"], correctIndex: 0, explanation: "Precipitation includes all moisture falling from clouds.", explanationTamil: "மழை மற்றும் பனிப்பொழிவு இதில் அடங்கும்." },
      { id: 4, question: "How long does a global ocean conveyor-belt circulation cycle take?", questionTamil: "ஒரு உலகளாவிய ஆழ்கடல் நீரோட்டச் சுழற்சி முடிய எத்தனை ஆண்டுகள் ஆகும்?", options: ["Around 1,000 years", "1 day", "10 years", "100 years"], optionsTamil: ["சுமார் 1,000 ஆண்டுகள்", "1 நாள்", "10 ஆண்டுகள்", "100 ஆண்டுகள்"], correctIndex: 0, explanation: "Deep ocean circulation takes nearly 1,000 years.", explanationTamil: "ஆழ்கடல் சுழற்சி முடிக்க 1,000 ஆண்டுகள் ஆகும்." },
      { id: 5, question: "Where does water percolate underground to replenish fresh water sources?", questionTamil: "நன்னீர் வளங்களை நிரப்ப நீர் நிலத்தடியில் எங்கு ஊடுருவுகிறது?", options: ["Soil layers into aquifers", "Inside volcanoes", "On paved concrete roads", "In plastic containers"], optionsTamil: ["மண் அடுக்குகள் வழியே நிலத்தடி நீரில் (Aquifers)", "எரிமலைக்குள்", "காங்க்ரீட் சாலையில்", "பிளாஸ்டிக் டாங்கியில்"], correctIndex: 0, explanation: "Water percolates into soil to replenish aquifers.", explanationTamil: "நீர் நிலத்தடி மண் அடுக்குகளில் சேமிக்கப்படுகிறது." }
    ]
  },
  {
    id: "c6-5",
    classLevel: "Class 6",
    title: "Biodiversity of Agasthyamalai Biosphere",
    category: "Real-World Explorations",
    readTime: "9 mins",
    language: "Bilingual",
    icon: "fi fi-rr-globe",
    description: "Study the flora, fauna, bioluminescent fungi, and endemic medicinal plant species in the UNESCO Agasthyamalai Biosphere Reserve.",
    didYouKnowEnglish: "The Agasthyamalai Biosphere Reserve contains over 2,000 species of medicinal plants used in traditional Ayurveda and Siddha medicine, making it a living pharmacy!",
    didYouKnowTamil: "அகத்தியர்மலை உயிர்க்கோளக் காப்பகத்தில் சித்த மற்றும் ஆயுர்வேத மருத்துவத்தில் பயன்படும் 2,000-க்கும் மேற்பட்ட மூலிகைத் தாவரங்கள் உள்ளதால் இது வாழும் மருந்தகமாகக் கருதப்படுகிறது!",
    activityType: "Observe",
    activityIcon: "fi fi-rr-zoom-in",
    activityTitleEnglish: "Observe Plant Leaves",
    activityTitleTamil: "தாவர இலைகளைக் கூர்ந்து கவனிப்போம்",
    activityDescEnglish: "Collect 3 different leaves from your garden. Observe their vein patterns (parallel vs reticulate) and sketch them in your notebook.",
    activityDescTamil: "உங்கள் தோட்டத்திலிருந்து 3 வெவ்வேறு இலைகளைச் சேகரிக்கவும். அவற்றின் நரம்பு அமைப்பைக் கூர்ந்து கவனித்து வரைபடம் வரையவும்.",
    contentEnglish: [
      "Located in the southern Western Ghats of Tamil Nadu and Kerala, the Agasthyamalai Biosphere Reserve was designated a UNESCO World Heritage site in 2016.",
      "Rising to an elevation of 1,868 meters, Agasthyamalai harbors tropical evergreen forests, sub-montane hill shoals, and high-biodiversity river origin basins.",
      "The reserve is home to over 2,000 species of medicinal flora, including 50 endemic plant species found nowhere else on Earth.",
      "Unique ecological phenomena such as bioluminescent fungi (Mycena species) emit natural light in dark damp forest floors due to chemical luciferin reactions."
    ],
    contentTamil: [
      "தமிழ்நாடு மற்றும் கேரளாவின் தெற்கு மேற்குத் தொடர்ச்சி மலையில் அமைந்துள்ள அகத்தியர்மலை உயிர்க்கோளக் காப்பகம் 2016-ல் யுனெஸ்கோ (UNESCO) பாரம்பரியக் களமாக அறிவிக்கப்பட்டது.",
      "1,868 மீட்டர் உயரத்தில் அமைந்துள்ள அகத்தியர்மலை, வெப்பமண்டல பசுமைமாறாக் காடுகள் மற்றும் அதிக உயிரியல் பன்முகத்தன்மை கொண்ட ஆற்று முகத்துவாரங்களைக் கொண்டுள்ளது.",
      "இந்தக் காப்பகத்தில் 2,000-க்கும் மேற்பட்ட மூலிகைத் தாவரங்கள் உள்ளன; இதில் பூமியில் வேறு எங்கும் காணப்படாத 50 உள்ளூர் தாவர வகைகளும் அடங்கும்.",
      "இருண்ட ஈரமான காட்டுத் தரையில் ஒளிரும் 'பயோலுமினசென்ட்' காளான்கள் (Mycena) லூசிஃபெரின் என்ற வேதிவினையால் இயற்கையான ஒளியை உமிழ்கின்றன."
    ],
    quiz: [
      { id: 1, question: "In which year was the Agasthyamalai Biosphere designated a UNESCO World Heritage site?", questionTamil: "அகத்தியர்மலை உயிர்க்கோளக் காப்பகம் எந்த ஆண்டு யுனெஸ்கோ உலக பாரம்பரியக் களமாக அறிவிக்கப்பட்டது?", options: ["2016", "1950", "2000", "1985"], optionsTamil: ["2016", "1950", "2000", "1985"], correctIndex: 0, explanation: "UNESCO included Agasthyamalai in World Network of Biosphere Reserves in 2016.", explanationTamil: "2016-ல் யுனெஸ்கோ இதனை பாரம்பரியக் களமாக்கியது." },
      { id: 2, question: "How many medicinal plant species grow within the Agasthyamalai reserve?", questionTamil: "அகத்தியர்மலைக் காப்பகத்தில் எத்தனை மூலிகைத் தாவர வகைகள் வளர்கின்றன?", options: ["Over 2,000 species", "10 species", "100 species", "50 species"], optionsTamil: ["2,000-க்கும் மேற்பட்ட மூலிகைகள்", "10", "100", "50"], correctIndex: 0, explanation: "It harbors more than 2,000 medicinal plant species.", explanationTamil: "அங்கு 2,000-க்கும் மேற்பட்ட மூலிகைகள் உள்ளன." },
      { id: 3, question: "What chemical compound causes bioluminescent fungi to glow in dark damp forests?", questionTamil: "இருண்ட காட்டில் ஒளிரும் காளான்கள் பிரகாசிக்கக் காரணமான வேதிப்பொருள் எது?", options: ["Luciferin reaction with Oxygen", "Plastic paint", "Copper oxide", "Salt water"], optionsTamil: ["லூசிஃபெரின் வேதிவினை (Luciferin)", "பிளாஸ்டிக் பெயிண்ட்", "கப்பர் ஆக்சைடு", "உப்பு நீர்"], correctIndex: 0, explanation: "Bioluminescence results from luciferin oxidation.", explanationTamil: "லூசிஃபெரின் வேதிவினையால் ஒளி உமிழப்படுகிறது." },
      { id: 4, question: "What is the peak elevation height of Agasthyamalai mountain?", questionTamil: "அகத்தியர்மலை சிகரத்தின் உயரம் எவ்வளவு?", options: ["1,868 meters", "100 meters", "5,000 meters", "50 meters"], optionsTamil: ["1,868 மீட்டர்", "100 மீட்டர்", "5,000 மீட்டர்", "50 மீட்டர்"], correctIndex: 0, explanation: "Agasthyamalai peak reaches 1,868 meters above sea level.", explanationTamil: "இதன் உயரம் 1,868 மீட்டர் ஆகும்." },
      { id: 5, question: "How many endemic plant species exist strictly within Agasthyamalai alone?", questionTamil: "அகத்தியர்மலையில் மட்டுமே காணப்படும் பிரத்யேக உள்ளூர் தாவர இனங்கள் எத்தனை?", options: ["50 Endemic species", "5000", "2", "None"], optionsTamil: ["50 உள்ளூர் இனங்கள் (Endemic species)", "5000", "2", "எதுவுமில்லை"], correctIndex: 0, explanation: "50 species are endemic exclusively to Agasthyamalai.", explanationTamil: "50 தாவர இனங்கள் இங்கு மட்டுமே காணப்படுகின்றன." }
    ]
  },
  {
    id: "c6-6",
    classLevel: "Class 6",
    title: "Subramania Bharati & Literature",
    category: "Tamil Heritage",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-document",
    description: "Learn about Subramania Bharati's linguistic mastery in 14 languages, his patriotic poems, and pioneering modern Tamil prose.",
    didYouKnowEnglish: "Subramania Bharati was a polyglot who translated famous works between languages and was fluent in 14 languages including Tamil, English, French, Sanskrit, Hindi, and Bengali!",
    didYouKnowTamil: "சுப்பிரமணிய பாரதியார் தமிழ், ஆங்கிலம், பிரெஞ்சு, சமஸ்கிருதம், ஹிந்தி, வங்காளம் உட்பட 14 மொழிகளில் புலமை பெற்ற பன்மொழி அறிஞர் ஆவார்!",
    activityType: "Reflect",
    activityIcon: "fi fi-rr-edit-alt",
    activityTitleEnglish: "Write a Patriotic Verse",
    activityTitleTamil: "ஒரு தேசபக்தி கவிதை வரி எழுதுங்கள்",
    activityDescEnglish: "Compose a 4-line poem in Tamil or English about unity, courage, or love for your nation.",
    activityDescTamil: "ஒற்றுமை, வீரம் அல்லது தேசபக்தி குறித்து 4 வரிகளில் ஒரு கவிதையைத் தமிழ் அல்லது ஆங்கிலத்தில் எழுதவும்.",
    contentEnglish: [
      "Chinnaswami Subramania Bharati, born in Ettayapuram in 1882, was a poet, journalist, Indian independence activist, and social reformer.",
      "Known as 'Mahakavi Bharati', he pioneered a new style of modern Tamil poetry called 'Puthukavithai', using accessible language to inspire national pride.",
      "As assistant editor of the Tamil daily 'Swadesamitran' and editor of 'India', Bharati published cartoon illustrations and patriotic anthems demanding freedom.",
      "His immortal works like 'Acham Illai' and 'Nallathor Veenai Seidhe' advocated gender equality, women empowerment, and the abolition of caste discrimination."
    ],
    contentTamil: [
      "1882-ல் எட்டையபுரத்தில் பிறந்த சின்னசுவாமி சுப்பிரமணிய பாரதியார் ஒரு கவிஞர், பத்திரிகையாளர், விடுதலைப் போராட்ட வீரர் மற்றும் சமூக சீர்திருத்தவாதி ஆவார்.",
      "'மகாகவி பாரதி' என்று அழைக்கப்படும் அவர், சாமானிய மக்களுக்கும் புரியும் வகையில் 'புதுக்கவிதை' என்ற நவீன கவிதை நடையைத் தொடங்கி வைத்தார்.",
      "'சுதேசிமித்திரன்' இதழின் உதவி ஆசிரியராகவும் 'இந்தியா' இதழின் ஆசிரியராகவும் பணியாற்றிய பாரதி, கேலிச்சித்திரங்கள் மற்றும் தேசபக்திக் கவிதைகளை வெளியிட்டார்.",
      "'அச்சமில்லை அச்சமில்லை' மற்றும் 'நல்லதோர் வீணை செய்தே' போன்றவரது படைப்புகள் பாலின சமத்துவம் மற்றும் சாதி ஒழிப்பை வலியுறுத்தின."
    ],
    quiz: [
      { id: 1, question: "In which Tamil Nadu village was Mahakavi Subramania Bharati born in 1882?", questionTamil: "1882-ல் மகாகவி சுப்பிரமணிய பாரதியார் பிறந்த கிராமம் எது?", options: ["Ettayapuram", "Madurai", "Thanjavur", "Kovilpatti"], optionsTamil: ["எட்டையபுரம்", "மதுரை", "தஞ்சாவூர்", "கோவில்பட்டி"], correctIndex: 0, explanation: "Bharati was born in Ettayapuram, Tuticorin district.", explanationTamil: "பாரதியார் எட்டையபுரத்தில் பிறந்தார்." },
      { id: 2, question: "How many languages was Subramania Bharati fluent in?", questionTamil: "சுப்பிரமணிய பாரதியார் எத்தனை மொழிகளில் புலமை பெற்றிருந்தார்?", options: ["14 Languages", "2 Languages", "5 Languages", "1 Language"], optionsTamil: ["14 மொழிகள்", "2 மொழிகள்", "5 மொழிகள்", "1 மொழி"], correctIndex: 0, explanation: "Bharati was a master polyglot fluent in 14 languages.", explanationTamil: "அவர் 14 மொழிகளில் புலமை பெற்றிருந்தார்." },
      { id: 3, question: "What modern poetic style did Bharati pioneer in Tamil literature?", questionTamil: "தமிழ் இலக்கியத்தில் பாரதி தொடங்கி வைத்த நவீன கவிதை நடை எது?", options: ["Puthukavithai (Free Verse)", "Venba only", "Sanskrit Chanda", "Drama script"], optionsTamil: ["புதுக்கவிதை (Puthukavithai)", "வெண்பா மட்டும்", "சமஸ்கிருத சந்தம்", "நாடக வசனம்"], correctIndex: 0, explanation: "He popularized accessible Puthukavithai style.", explanationTamil: "எளிய நடை கொண்ட புதுக்கவிதையைத் தொடங்கினார்." },
      { id: 4, question: "Which famous Tamil daily newspaper did Bharati serve as Assistant Editor?", questionTamil: "பாரதியார் உதவி ஆசிரியராகப் பணியாற்றிய புகழ்பெற்ற தமிழ் நாளிதழ் எது?", options: ["Swadesamitran", "Times", "Chronicle", "Express"], optionsTamil: ["சுதேசிமித்திரன் (Swadesamitran)", "டைம்ஸ்", "குரோனிக்கிள்", "எக்ஸ்பிரஸ்"], correctIndex: 0, explanation: "He worked at Swadesamitran under G. Subramania Iyer.", explanationTamil: "அவர் சுதேசிமித்திரன் இதழில் பணியாற்றினார்." },
      { id: 5, question: "What major social cause was strongly advocated in Bharati's writings?", questionTamil: "பாரதியின் எழுத்துக்களில் வலியுறுத்தப்பட்ட முக்கிய சமூக நோக்கம் எது?", options: ["Gender equality and caste abolition", "Royalty praise", "Tax collection", "Foreign trade"], optionsTamil: ["பாலின சமத்துவம் & சாதி ஒழிப்பு", "மன்னர் புகழ் பாடுதல்", "வரி வசூல்", "வெளிநாட்டு வர்த்தகம்"], correctIndex: 0, explanation: "He fought against casteism and for women's rights.", explanationTamil: "சாதி ஒழிப்பையும் பெண்கள் உரிமையையும் வலியுறுத்தினார்." }
    ]
  },
  {
    id: "c6-7",
    classLevel: "Class 6",
    title: "Ecology of the Amazon Rainforest",
    category: "Environment & Sustainability",
    readTime: "7 mins",
    language: "Bilingual",
    icon: "fi fi-rr-tree",
    description: "Examine the Amazon basin's biodiversity, carbon storage capacity, canopy layers, and environmental role in global climate regulation.",
    didYouKnowEnglish: "The Amazon rainforest produces about 6% to 9% of Earth's total photosynthetic oxygen and stores over 150 billion tons of carbon in its biomass and soil!",
    didYouKnowTamil: "அமேசான் மழைக்காடுகள் பூமியின் ஒளிச்சேர்க்கை ஆக்ஸிஜனில் 6% முதல் 9% வரை உற்பத்தி செய்கின்றன! மேலும் 150 பில்லியன் டன் கார்பனைத் தன் மரங்கள் மற்றும் மண்ணில் சேமிக்கின்றன!",
    activityType: "Think",
    activityIcon: "fi fi-rr-brain",
    activityTitleEnglish: "Understand Carbon Storage",
    activityTitleTamil: "கார்பன் சேமிப்பைப் புரிந்துகொள்வோம்",
    activityDescEnglish: "Trees absorb carbon dioxide from air and convert it into solid wood. How does planting trees help combat climate change?",
    activityDescTamil: "மரங்கள் காற்றிலிருந்து கார்பன் டை ஆக்சைடை உறிஞ்சி திட மரமாக மாற்றுகின்றன. மரங்களை நடுவதால் புவி வெப்பமயமாதல் எவ்வாறு குறையும்?",
    contentEnglish: [
      "Spanning 5.5 million square kilometers across South America, the Amazon Basin is the largest tropical rainforest ecosystem on Earth.",
      "The forest is structured into four distinct vertical ecological layers: the emergent layer, canopy, understory, and forest floor.",
      "Amazonian flora acts as a critical terrestrial carbon sink, sequestering approximately 150 billion metric tons of carbon, which helps stabilize global climate temperatures.",
      "Deforestation caused by agricultural land clearing threatens over 390 billion individual trees and millions of animal species inhabiting the basin."
    ],
    contentTamil: [
      "தென் அமெரிக்காவில் 5.5 மில்லியன் சதுர கி.மீ பரப்பளவில் அமைந்துள்ள அமேசான் படுகை உலகின் மிகப்பெரிய வெப்பமண்டல மழைக்காட்டு அமைப்பாகும்.",
      "இக்காடு நான்கு செங்குத்து அடுக்குக் கட்டமைப்புகளைக் கொண்டுள்ளது: மேல் அடுக்கு (Emergent), மரவிதானம் (Canopy), நடு அடுக்கு (Understory) மற்றும் காட்டுத் தரை.",
      "அமேசான் தாவரங்கள் 150 பில்லியன் மெட்ரிக் டன் கார்பனைச் சேமித்து, உலகளாவிய பருவநிலை வெப்பநிலையை நிலைநிறுத்த உதவுகிறது.",
      "விவசாய நிலங்களுக்காகக் காடுகளை அழிப்பது, இங்குள்ள 390 பில்லியன் மரங்கள் மற்றும் மில்லியன் கணக்கான விலங்கினங்களுக்கு அச்சுறுத்தலாக உள்ளது."
    ],
    quiz: [
      { id: 1, question: "What is the total geographical area covered by the Amazon Rainforest basin?", questionTamil: "அமேசான் மழைக்காட்டுப் படுகையின் மொத்த புவியியல் பரப்பு எவ்வளவு?", options: ["5.5 Million Square Kilometers", "100 Sq Km", "1000 Sq Km", "50 Sq Km"], optionsTamil: ["5.5 மில்லியன் சதுர கி.மீ", "100 ச.கி.மீ", "1000 ச.கி.மீ", "50 ச.கி.மீ"], correctIndex: 0, explanation: "The Amazon rainforest spans 5.5 million sq km.", explanationTamil: "அமேசான் 5.5 மில்லியன் ச.கி.மீ பரப்பளவு கொண்டது." },
      { id: 2, question: "How much carbon is stored in the biomass and soil of the Amazon Rainforest?", questionTamil: "அமேசான் காடுகளின் மரங்கள் மற்றும் மண்ணில் எவ்வளவு கார்பன் சேமிக்கப்பட்டுள்ளது?", options: ["Over 150 Billion Metric Tons", "1 Ton", "50 Tons", "100 Tons"], optionsTamil: ["150 பில்லியன் மெட்ரிக் டன்னுக்கும் மேல்", "1 டன்", "50 டன்", "100 டன்"], correctIndex: 0, explanation: "It stores around 150 billion tons of carbon.", explanationTamil: "அங்கு 150 பில்லியன் டன் கார்பன் சேமிக்கப்பட்டுள்ளது." },
      { id: 3, question: "How many vertical ecological layers exist in the Amazon forest structure?", questionTamil: "அமேசான் காட்டின் அமைப்பில் எத்தனை செங்குத்து அடுக்குகள் உள்ளன?", options: ["4 Vertical Layers", "2 Layers", "10 Layers", "1 Layer"], optionsTamil: ["4 செங்குத்து அடுக்குகள்", "2 அடுக்குகள்", "10 அடுக்குகள்", "1 அடுக்கு"], correctIndex: 0, explanation: "Emergent, Canopy, Understory, and Forest Floor form 4 layers.", explanationTamil: "மேல் அடுக்கு, மரவிதானம், நடு அடுக்கு, தரை என 4 அடுக்குகள் உண்டு." },
      { id: 4, question: "How many individual trees are estimated to grow in the Amazon basin?", questionTamil: "அமேசான் படுகையில் எத்தனை மரங்கள் இருப்பதாக மதிப்பிடப்பட்டுள்ளது?", options: ["390 Billion Trees", "50 Trees", "1 Thousand", "10 Million"], optionsTamil: ["390 பில்லியன் மரங்கள்", "50 மரங்கள்", "1 ஆயிரம்", "10 மில்லியன்"], correctIndex: 0, explanation: "Scientists estimate 390 billion trees in the Amazon.", explanationTamil: "அங்கு 390 பில்லியன் மரங்கள் உள்ளன." },
      { id: 5, question: "What scientific term describes forests absorbing atmospheric CO2 for storage?", questionTamil: "வளிமண்டல கார்பனை மரங்கள் உறிஞ்சிச் சேமிப்பது எந்த அறிவியல் சொல்லால் அழைக்கப்படுகிறது?", options: ["Carbon Sink", "Plastic Waste", "Solar Flare", "Wind Tunnel"], optionsTamil: ["கார்பன் சேமிப்பகம் (Carbon Sink)", "பிளாஸ்டிக் கழிவு", "சூரியப் புயல்", "காற்றாலை"], correctIndex: 0, explanation: "Forests that absorb more carbon than they emit are carbon sinks.", explanationTamil: "கார்பனை உறிஞ்சும் காடுகள் 'கார்பன் சிங்' எனப்படுகின்றன." }
    ]
  },
  {
    id: "c6-8",
    classLevel: "Class 6",
    title: "Silappadikaram & Sangam Judiciary",
    category: "Tamil Heritage",
    readTime: "10 mins",
    language: "Bilingual",
    icon: "fi fi-rr-gem",
    description: "Analyze the judicial trial scene in Silappadikaram, examining evidence verification, legal ethics, and ancient Tamil jurisprudence.",
    didYouKnowEnglish: "Silappadikaram composed by Ilango Adigal is the first epic poem in Tamil literature to focus on common citizens (Kovalan and Kannagi) rather than kings or gods!",
    didYouKnowTamil: "இளங்கோவடிகள் இயற்றிய சிலப்பதிகாரம், மன்னர்களையோ கடவுள்களையோ அல்லாமல் சாதாரணக் குடிமக்களைக் (கோவலன் - கண்ணகி) கதையின் முதன்மையாகக் கொண்ட முதல் தமிழ் காப்பியமாகும்!",
    activityType: "Reflect",
    activityIcon: "fi fi-rr-edit-alt",
    activityTitleEnglish: "Importance of Truth & Evidence",
    activityTitleTamil: "உண்மை மற்றும் சான்றின் முக்கியத்துவம்",
    activityDescEnglish: "Why must judges verify factual evidence before making decisions? Reflect on fair play in school sports and rules.",
    activityDescTamil: "தீர்ப்பு வழங்குவதற்கு முன் ஆதாரங்களை ஏன் சரிபார்க்க வேண்டும்? பள்ளியில் விளையாட்டுகளில் நியாயமாக இருப்பதன் அவசியத்தைப் பற்றி சிந்திக்கவும்.",
    contentEnglish: [
      "Silappadikaram ('The Tale of an Anklet'), written by Jain monk Prince Ilango Adigal in the 2nd century CE, is a classic Tamil epic detailing legal ethics.",
      "The narrative reaches its climax in Madurai when Kovalan is wrongly accused of stealing Queen Kopperundevi's pearl anklet and executed without proper trial.",
      "Kannagi appears before Pandyan King Nedunchezhian and breaks open her matching anklet, revealing that her anklet contained precious rubies, whereas the Queen's anklet contained pearls.",
      "Confronted with undeniable physical evidence of judicial error, King Nedunchezhian collapses, uttering the famous words: 'Yano Arasan? Yane Kalvan!' ('Am I a king? I am the thief!')."
    ],
    contentTamil: [
      "கி.பி 2-ஆம் நூற்றாண்டில் சமணத் துறவியான இளங்கோவடிகளால் இயற்றப்பட்ட சிலப்பதிகாரம், பண்டைய தமிழ் சட்ட நெறிமுறைகளை விளக்கும் காப்பியமாகும்.",
      "மதுரையில் கோவலன் அரசியின் முத்துச் சிலம்பைத் திருடியதாகத் தவறாகக் குற்றம் சாட்டப்பட்டு, முறையான விசாரணையின்றி மரண தண்டனை விதிக்கப்பட்ட போது கதை உச்சத்தை அடைகிறது.",
      "பாண்டிய மன்னன் நெடுஞ்செழியன் முன் தோன்றும் கண்ணகி, தன் சிலம்பை உடைத்துத் தன்னுடை சிலம்பில் மாணிக்கங்களும் அரசியின் சிலம்பில் முத்துக்களும் இருந்ததை நிரூபிக்கிறாள்.",
      "நீதித் தவறின் மறுக்க முடியாத சான்றைக் கண்ட மன்னன் நெடுஞ்செழியன், 'யானோ அரசன்? யானே கள்வன்!' என்று கூறி அரியணையிலிருந்து வீழ்ந்தான்."
    ],
    quiz: [
      { id: 1, question: "Who composed the classic epic Silappadikaram in the 2nd century CE?", questionTamil: "கி.பி 2-ஆம் நூற்றாண்டில் சிலப்பதிகாரம் என்ற காப்பியத்தை இயற்றியவர் யார்?", options: ["Ilango Adigal", "Kamban", "Thiruvalluvar", "Avvaiyar"], optionsTamil: ["இளங்கோவடிகள்", "கம்பன்", "திருவள்ளுவர்", "ஔவையார்"], correctIndex: 0, explanation: "Prince Ilango Adigal authored Silappadikaram.", explanationTamil: "இளங்கோவடிகளே சிலப்பதிகாரத்தை இயற்றினார்." },
      { id: 2, question: "What gemstone was contained inside Kannagi's golden anklet?", questionTamil: "கண்ணகியின் பொற்சிலம்பிற்குள் இருந்த ரத்தினக் கல் எது?", options: ["Rubies (Manikkam)", "Pearls (Muthu)", "Emeralds", "Diamonds"], optionsTamil: ["மாணிக்கம் (Rubies)", "முத்து", "மரகதம்", "வைரம்"], correctIndex: 0, explanation: "Kannagi's anklet contained rubies.", explanationTamil: "கண்ணகியின் சிலம்பில் மாணிக்கக் கற்கள் இருந்தன." },
      { id: 3, question: "What gemstone was contained inside Queen Kopperundevi's anklet?", questionTamil: "அரசி கோப்பெருந்தேவியின் சிலம்பில் இருந்த கல் எது?", options: ["Pearls (Muthu)", "Rubies", "Sapphires", "Gold dust"], optionsTamil: ["முத்து (Pearls)", "மாணிக்கம்", "நீலக்கல்", "தங்கத் தூள்"], correctIndex: 0, explanation: "The Queen's anklet was filled with natural sea pearls.", explanationTamil: "அரசியின் சிலம்பில் கடல் முத்துக்கள் இருந்தன." },
      { id: 4, question: "What famous sentence did Pandyan King Nedunchezhian utter upon realizing judicial error?", questionTamil: "நீதிப்பிழையை உணர்ந்த பாண்டிய மன்னன் நெடுஞ்செழியன் முழங்கிய புகழ்பெற்ற வரி எது?", options: ["Yano Arasan? Yane Kalvan!", "I win today", "Bring more gold", "Close the court"], optionsTamil: ["யானோ அரசன்? யானே கள்வன்!", "இன்று நான் வென்றேன்", "தங்கம் கொண்டு வா", "நீதிமன்றத்தை மூடு"], correctIndex: 0, explanation: "He declared 'Yano Arasan? Yane Kalvan!' and collapsed.", explanationTamil: "'யானோ அரசன்? யானே கள்வன்!' என்று கூறி வீழ்ந்தான்." },
      { id: 5, question: "What makes Silappadikaram unique in ancient Tamil classical literature?", questionTamil: "பண்டைய தமிழ் இலக்கியத்தில் சிலப்பதிகாரத்தின் தனித்துவச் சிறப்பு என்ன?", options: ["Focuses on common citizens Kovalan and Kannagi", "Focuses only on gods", "Written in English", "Has no characters"], optionsTamil: ["சாதாரண குடிமக்களான கோவலன்-கண்ணகியை கதையின் மையமாகக் கொண்டது", "கடவுளை மட்டும் பற்றியது", "ஆங்கிலத்தில் எழுதப்பட்டது", "கதாபாத்திரங்கள் இல்லை"], correctIndex: 0, explanation: "It is the first Tamil epic centered on common citizens.", explanationTamil: "இது எளிய மக்களை முதன்மையாகக் கொண்ட காப்பியம்." }
    ]
  },
  {
    id: "c6-9",
    classLevel: "Class 6",
    title: "Simple Machines & Lever Mechanics",
    category: "Science in Daily Life",
    readTime: "6 mins",
    language: "Bilingual",
    icon: "fi fi-rr-settings-sliders",
    description: "Study mechanical advantage, effort force, load weight, and the three classes of simple levers used in tools.",
    didYouKnowEnglish: "Scissors are compound simple machines consisting of two Class 1 levers working together with a central pivot screw!",
    didYouKnowTamil: "கத்தரிக்கோல் என்பது மையத் திருகு ஆதாரப் புள்ளியைக் கொண்டு ஒன்றாக இயங்கும் இரண்டு 'வகுப்பு-1' நெம்புகோல்கள் சேர்ந்த கூட்டு எளிய எந்திரமாகும்!",
    activityType: "Observe",
    activityIcon: "fi fi-rr-zoom-in",
    activityTitleEnglish: "Find Levers at Home",
    activityTitleTamil: "வீட்டில் உள்ள நெம்புகோல்களைக் கண்டறிவோம்",
    activityDescEnglish: "Locate a pair of scissors, a bottle opener, or tweezers in your home. Identify where the Fulcrum (pivot), Effort, and Load are!",
    activityDescTamil: "வீட்டில் உள்ள கத்தரிக்கோல், பாட்டில் ஓபனர் அல்லது சிமிட்டியை எடுக்கவும். அதன் சுழல் புள்ளி (Fulcrum), முயற்சி விசை மற்றும் சுமையை அடையாளம் காணவும்!",
    contentEnglish: [
      "A lever is a rigid bar that pivots around a fixed point called a fulcrum to multiply input effort force.",
      "Levers are categorized into three distinct classes depending on the relative positions of the Fulcrum (F), Effort (E), and Load (L).",
      "In a Class 1 lever (e.g., seesaw, crowbar, scissors), the Fulcrum sits between the Effort force and the Load weight.",
      "Mechanical advantage ($MA = \\frac{\\text{Load}}{\\text{Effort}}$) allows a small input force applied over a longer effort arm to lift a heavy load effortlessly."
    ],
    contentTamil: [
      "நெம்புகோல் என்பது 'சுழல் புள்ளி' (Fulcrum) என்ற நிலையான புள்ளியை மையமாகக் கொண்டு சுழன்று, செலுத்தும் விசையைப் பலமடங்காக்கும் ஒரு உறுதியான கம்பி ஆகும்.",
      "சுழல் புள்ளி (F), முயற்சி விசை (E) மற்றும் சுமை (L) ஆகியவற்றின் அமைவிடத்தைப் பொறுத்து நெம்புகோல்கள் 3 வகுப்புகளாகப் பிரிக்கப்படுகின்றன.",
      "வகுப்பு 1 நெம்புகோலில் (எ.கா: சீசா, கடப்பாரை, கத்தரிக்கோல்), சுழல் புள்ளி முயற்சி விசைக்கும் சுமைக்கும் இடையே அமைகிறது.",
      "இயந்திர நன்மை ($MA = \\frac{\\text{சுமை}}{\\text{முயற்சி விசை}}$) மூலம் நீண்ட கம்பியின் முனையில் செலுத்தும் சிறிய விசை பெரிய எடையை எளிதாக உயർത്തுகிறது."
    ],
    quiz: [
      { id: 1, question: "What is the fixed pivot support point of a simple lever called?", questionTamil: "ஒரு எளிய நெம்புகோலின் நிலையான சுழல் ஆதாரப் புள்ளி எவ்வாறு அழைக்கப்படுகிறது?", options: ["Fulcrum", "Wheel", "Pulley", "Gear"], optionsTamil: ["சுழல் புள்ளி (Fulcrum)", "சக்கரம்", "கப்பி", "கியர்"], correctIndex: 0, explanation: "The fulcrum is the fixed pivot point.", explanationTamil: "ஆதாரப் புள்ளியே சுழல் புள்ளி எனப்படும்." },
      { id: 2, question: "In a Class 1 lever, which component is located in the middle between Effort and Load?", questionTamil: "வகுப்பு 1 நெம்புகோலில், முயற்சி விசைக்கும் சுமைக்கும் இடையே நடுவில் இருப்பது எது?", options: ["Fulcrum", "Load", "Effort", "Motor"], optionsTamil: ["சுழல் புள்ளி (Fulcrum)", "சுமை", "முயற்சி விசை", "மோட்டார்"], correctIndex: 0, explanation: "Class 1 levers have the fulcrum in the middle.", explanationTamil: "வகுப்பு 1-ல் சுழல் புள்ளி நடுவில் இருக்கும்." },
      { id: 3, question: "What is the mathematical formula for Mechanical Advantage (MA)?", questionTamil: "இயந்திர நன்மைக்கான (MA) கணிதச் சூத்திரம் எது?", options: ["MA = Load / Effort", "MA = Load x Effort", "MA = Effort - Load", "MA = Zero"], optionsTamil: ["MA = சுமை / முயற்சி விசை", "MA = சுமை x முயற்சி", "MA = முயற்சி - சுமை", "MA = பூஜ்ஜியம்"], correctIndex: 0, explanation: "MA equals Load divided by Effort force.", explanationTamil: "இயந்திர நன்மை = சுமை / முயற்சி விசை ஆகும்." },
      { id: 4, question: "What daily simple tool consists of two combined Class 1 levers?", questionTamil: "இரண்டு வகுப்பு 1 நெம்புகோல்கள் சேர்ந்த தினசரி பயன்பாட்டுக் கருவி எது?", options: ["Scissors", "Ruler", "Pencil", "Eraser"], optionsTamil: ["கத்தரிக்கோல் (Scissors)", "அளவுகோல்", "பென்சில்", "ரப்பர்"], correctIndex: 0, explanation: "Scissors combine two Class 1 levers at a central rivet.", explanationTamil: "கத்தரிக்கோல் இரு வகுப்பு 1 நெம்புகோல்களின் கூட்டமைப்பாகும்." },
      { id: 5, question: "How does increasing the length of the effort arm affect the required input force?", questionTamil: "முயற்சி கம்பியின் நீளத்தை அதிகரிக்கும் போது தேவையான விசை எவ்வாறு மாறும்?", options: ["Reduces required input force", "Increases force required", "No change", "Stops movement"], optionsTamil: ["தேவையான விசையைக் குறைக்கும்", "விசையை அதிகரிக்கும்", "மாற்றமில்லை", "இயக்கத்தை நிறுத்தும்"], correctIndex: 0, explanation: "Longer effort arms reduce the force needed to lift loads.", explanationTamil: "நீளமான கம்பி செலுத்தும் விசையைக் குறைக்கும்." }
    ]
  },
  {
    id: "c6-10",
    classLevel: "Class 6",
    title: "Botany & Phenology of Neelakurinji",
    category: "Life Skills",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-mountains",
    description: "Explore the 12-year plietesial flowering cycle of Strobilanthes kunthiana in the shola grassland ecosystems of the Western Ghats.",
    didYouKnowEnglish: "The Neelakurinji shrub undergoes a rare 12-year flowering cycle known as plietesial blooming, after which the parent plant dies, leaving seeds for the next generation!",
    didYouKnowTamil: "நீலக்குறிஞ்சி புதர் 12 ஆண்டிற்கு ஒருமுறை 'பிளீட்டீசியல்' முறையில் ஒன்றாகப் பூத்து, பின்னர் தாய் தாவரம் மடிந்து அடுத்த தலைமுறைக்கான விதைகளை விட்டுச் செல்கிறது!",
    activityType: "Think",
    activityIcon: "fi fi-rr-brain",
    activityTitleEnglish: "Patience & Nature's Timing",
    activityTitleTamil: "பொறுமையும் இயற்கை சுழற்சியும்",
    activityDescEnglish: "Why do some plants bloom daily while Kurinji waits 12 years? Think about how nature adapts to climate and survival!",
    activityDescTamil: "சில தாவரங்கள் தினமும் பூக்கும் போது குறிஞ்சி ஏன் 12 ஆண்டுகள் காத்திருக்கிறது? இயற்கை எவ்வாறு வாழப் பழகுகிறது என்று சிந்தியுங்கள்!",
    contentEnglish: [
      "Strobilanthes kunthiana, commonly known as Neelakurinji, is a shrub species native to the shola forest grasslands of the Western Ghats.",
      "The plant exhibits a unique botanical trait called plietesial flowering, blooming synchronously en masse once every 12 years.",
      "During peak blooming years, vast expanses of the Nilgiri Hills (literally 'Blue Mountains') are carpeted in vibrant purplish-blue blossoms.",
      "After mass pollination by honeybees, the plant produces seeds and undergoes monocarpic senescence (dying after fruiting) to allow young seedlings to sprout."
    ],
    contentTamil: [
      "நீலக்குறிஞ்சி (Strobilanthes kunthiana) என்பது மேற்குத் தொடர்ச்சி மலையின் சோலை புல்வெளி காடுகளுக்குரிய ஒரு புதர் தாவர இனமாகும்.",
      "இத்தாவரம் 12 ஆண்டுகளுக்கு ஒருமுறை ஒரே நேரத்தில் ஒன்றாகப் பூக்கும் 'பிளீட்டீசியல்' என்ற தனித்துவமான தாவரவியல் பண்பைக் கொண்டுள்ளது.",
      "பூக்கும் ஆண்டுகளில், நீலகிரி மலைகளின் ('நீல மலைகள்') பரந்த சரிவுகள் ஊதா-நீல மலர் கம்பளத்தால் மூடிப் பிரகாசிக்கின்றன.",
      "தேனீக்களால் மகரந்தச்சேர்க்கை நடந்த பின், தாய் தாவரம் விதைகளை உற்பத்தி செய்து மடிகிறது; பின் புதிய விதைகள் முளைக்கத் தொடங்குகின்றன."
    ],
    quiz: [
      { id: 1, question: "What is the scientific botanical name of the Neelakurinji plant?", questionTamil: "நீலக்குறிஞ்சி தாவரத்தின் அறிவியல் தாவரவியல் பெயர் என்ன?", options: ["Strobilanthes kunthiana", "Rosa indica", "Mangifera indica", "Azadirachta indica"], optionsTamil: ["ஸ்ட்ரோபிலாந்தஸ் குந்தியானா (Strobilanthes)", "ரோசா இண்டிகா", "மேங்கிஃபெரா இண்டிகா", "அசாடிராக்டா இண்டிகா"], correctIndex: 0, explanation: "Its botanical classification is Strobilanthes kunthiana.", explanationTamil: "இதன் தாவரவியல் பெயர் ஸ்ட்ரோபிலாந்தஸ் குந்தியானா." },
      { id: 2, question: "How many years long is the mass flowering cycle of Neelakurinji?", questionTamil: "நீலக்குறிஞ்சியின் பூக்கும் சுழற்சி எத்தனை ஆண்டுகள் கொண்டது?", options: ["12 Years", "1 Year", "5 Years", "50 Years"], optionsTamil: ["12 ஆண்டுகள்", "1 ஆண்டு", "5 ஆண்டுகள்", "50 ஆண்டுகள்"], correctIndex: 0, explanation: "Neelakurinji blooms synchronously every 12 years.", explanationTamil: "குறிஞ்சி 12 ஆண்டுக்கு ஒருமுறை பூக்கும்." },
      { id: 3, question: "What botanical term describes plants that flower once and die after seed production?", questionTamil: "ஒருமுறை மட்டுமே பூத்து விதைகளைத் தந்து மடியும் தாவரங்கள் எவ்வாறு அழைக்கப்படுகின்றன?", options: ["Monocarpic", "Perennial", "Evergreen", "Parasitic"], optionsTamil: ["மோனோகார்பிக் (Monocarpic)", "பல்லாண்டுத் தாவரம்", "பசுமைமாறா", "ஒட்டுண்ணி"], correctIndex: 0, explanation: "Monocarpic plants die after flowering and seed setting.", explanationTamil: "பூத்த பின் மடியும் தாவரங்கள் மோனோகார்பிக் எனப்படும்." },
      { id: 4, question: "Which mountain range grassland ecosystem harbors the Neelakurinji plant?", questionTamil: "நீலக்குறிஞ்சித் தாவரம் எந்த மலைத்தொடர் புல்வெளிகளில் வளர்கிறது?", options: ["Western Ghats (Shola Grasslands)", "Himalayas", "Alps", "Andes"], optionsTamil: ["மேற்குத் தொடர்ச்சி மலை (சோலை புல்வெளி)", "இமயமலை", "ஆல்ப்ஸ்", "ஆண்டீஸ்"], correctIndex: 0, explanation: "It grows in shola grasslands of the Western Ghats.", explanationTamil: "மேற்குத் தொடர்ச்சி மலையின் சோலை புல்வெளியில் வளர்கிறது." },
      { id: 5, question: "Why are the Nilgiri Hills named 'Blue Mountains'?", questionTamil: "நீலகிரி மலைகள் ஏன் 'நீல மலைகள்' என்று அழைக்கப்படுகின்றன?", options: ["Mass purplish-blue blooming of Kurinji flowers", "Blue painted rocks", "Blue water clouds", "Blue snow"], optionsTamil: ["நீலக் குறிஞ்சி மலர்கள் ஒன்றாகப் பூப்பதால்", "நீல வண்ணம் பூசிய பாறை", "நீல மேகம்", "நீலப் பனி"], correctIndex: 0, explanation: "Blossoming Kurinji carpets the hillsides in blue.", explanationTamil: "நீலக் குறிஞ்சி மலர்கள் மலையை மூடுவதால்." }
    ]
  },

  // ── CLASS 7 LEARNING EXPLORATIONS (10 Resources) ────────────────────────────
  {
    id: "c7-1",
    classLevel: "Class 7",
    title: "C.V. Raman & Light Scattering Physics",
    category: "Inspirational Biographies",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-microscope",
    description: "Examine the inelastic scattering of light photons by liquid molecules, leading to Sir C.V. Raman's 1930 Nobel Prize in Physics.",
    didYouKnowEnglish: "Sir C.V. Raman performed his groundbreaking optics experiments in Kolkata using a mercury arc lamp, a glass spectrograph, and simple lenses costing less than ₹500!",
    didYouKnowTamil: "சர் சி.வி. ராமன் தனது கொல்கத்தா ஆய்வகத்தில் மெர்குரி விளக்கு, கண்ணாடி ஸ்பெக்ட்ரோகிராஃப் மற்றும் ₹500-க்கும் குறைவான எளிய லென்ஸ்களைப் பயன்படுத்தி நோபல் பரிசு கண்டுபிடிப்பைச் செய்தார்!",
    activityType: "Try at Home",
    activityIcon: "fi fi-rr-house-chimney",
    activityTitleEnglish: "Prism Rainbow Experiment",
    activityTitleTamil: "முப்பட்டக வானவில் பரிசோதனை",
    activityDescEnglish: "Shine a bright flashlight through a clear glass filled with water onto a white wall to observe light refracting into rainbow colors!",
    activityDescTamil: "ஒரு கண்ணாடித் டம்ளர் நீரில் ஒளியைச் செலுத்தி வெள்ளைச் சுவரில் நிறப்பிரிகை அடைந்து வானவில் வண்ணங்கள் தோன்றுவதைக் கவனிக்கவும்!",
    contentEnglish: [
      "Sir Chandrasekhara Venkata Raman (1888–1970) was an Indian physicist who made pioneering discoveries in light scattering physics.",
      "While sailing across the Mediterranean Sea in 1921, Raman questioned why ocean water possessed a deep blue color, challenging Lord Rayleigh's theory of atmospheric sky reflection.",
      "At the Indian Association for the Cultivation of Science (IACS) in Kolkata, Raman discovered that when a transparent substance scatters monochromatic light, a small fraction of light emerges with altered wavelength.",
      "Announced on February 28, 1928, the 'Raman Effect' proved inelastic photon scattering by liquid molecules, earning him the 1930 Nobel Prize in Physics."
    ],
    contentTamil: [
      "சர் சந்திரசேகர வெங்கட ராமன் (1888-1970) ஒளிச் சிதறல் இயற்பியலில் முன்னோடி சாதனைகளைப் படைத்த இந்திய இயற்பியலாளர் ஆவார்.",
      "1921-ல் மத்திய தரைக்கடலில் பயணித்த போது, லார்டு ரேலியின் வான பிரதிபலிப்புக் கோட்பாட்டை சவாலுக்கு உட்படுத்தி கடல் நீர் ஏன் நீலமாக உள்ளது என ஆராய்ந்தார்.",
      "கொல்கத்தா IACS ஆய்வகத்தில், ஒரு ஒளிக்கற்றை பாயும் போது மூலக்கூறுகளால் சிதறடிக்கப்படும் சிறிய அளவிலான ஒளி வேறு அலைநீளத்துடன் வெளிவருவதைக் கண்டறிந்தார்.",
      "1928 பிப்ரவரி 28 அன்று அறிவிக்கப்பட்ட 'ராமன் விளைவு' திரவ மூலக்கூறுகளின் ஒளிச்சிதறலை நிரூபித்து, அவருக்கு 1930-ல் இயற்பியலுக்கான நோபல் பரிசைப் பெற்றுத் தந்தது."
    ],
    quiz: [
      { id: 1, question: "What physical phenomenon occurs during the Raman Effect?", questionTamil: "ராமன் விளைவின் போது நிகழும் இயற்பியல் நிகழ்வு எது?", options: ["Inelastic Scattering of Light Photons", "Nuclear Fusion", "Magnetic Attraction", "Chemical Burning"], optionsTamil: ["ஒளி அலைகளின் மீட்சியற்ற சிதறல் (Inelastic Scattering)", "அணுக்கரு பிணைப்பு", "காந்த ஈர்ப்பு", "வேதி எரிதல்"], correctIndex: 0, explanation: "Light photons change energy and frequency when scattered.", explanationTamil: "ஒளி அலைகள் ஆற்றலும் அலைநீளமும் மாறுகின்றன." },
      { id: 2, question: "In which year did Sir C.V. Raman win the Nobel Prize in Physics?", questionTamil: "சர் சி.வி. ராமன் எந்த ஆண்டு இயற்பியலுக்கான நோபல் பரிசு பெற்றார்?", options: ["1930", "1947", "1950", "1920"], optionsTamil: ["1930", "1947", "1950", "1920"], correctIndex: 0, explanation: "He received Asia's first Physics Nobel Prize in 1930.", explanationTamil: "அவர் 1930-ல் நோபல் பரிசு பெற்றார்." },
      { id: 3, question: "What date is commemorated annually as National Science Day in India?", questionTamil: "இந்தியாவில் தேசிய அறிவியல் தினமாக எந்த நாள் ஆண்டுதோறும் கொண்டாடப்படுகிறது?", options: ["February 28", "January 26", "August 15", "October 2"], optionsTamil: ["பிப்ரவரி 28", "ஜனவரி 26", "ஆகஸ்ட் 15", "அக்டோபர் 2"], correctIndex: 0, explanation: "February 28 marks the announcement of the Raman Effect.", explanationTamil: "பிப்ரவரி 28 ராமன் விளைவு அறிவிக்கப்பட்ட நாளாகும்." },
      { id: 4, question: "Roughly how much did Raman's optics equipment cost in his Kolkata lab?", questionTamil: "கொல்கத்தா ஆய்வகத்தில் ராமன் பயன்படுத்திய உபகரணங்களின் மதிப்பு எவ்வளவு?", options: ["Less than ₹500", "₹10 Lakhs", "₹1 Crore", "Free"], optionsTamil: ["₹500-க்கும் குறைவு", "₹10 லட்சம்", "₹1 கோடி", "இலவசம்"], correctIndex: 0, explanation: "He conducted pioneering optics experiments with basic equipment under ₹500.", explanationTamil: "எளிய ₹500 உபகரணத்திலேயே சாதனை படைத்தார்." },
      { id: 5, question: "Which research institute in Kolkata was the site of the Raman Effect discovery?", questionTamil: "ராமன் விளைவு கண்டுபிடிக்கப்பட்ட கொல்கத்தா ஆராய்ச்சி நிறுவனம் எது?", options: ["IACS (Indian Association for Cultivation of Science)", "IIT Madras", "ISRO", "AIIMS"], optionsTamil: ["IACS (கொல்கத்தா)", "ஐஐடி மெட்ராஸ்", "இஸ்ரோ", "எய்ம்ஸ்"], correctIndex: 0, explanation: "Experiments were conducted at IACS Kolkata.", explanationTamil: "கொல்கத்தா IACS நிறுவனத்தில் ஆய்வுகள் நடந்தன." }
    ]
  },
  {
    id: "c7-2",
    classLevel: "Class 7",
    title: "Submarine Fiber-Optic Telecommunications",
    category: "Technology & Innovation",
    readTime: "9 mins",
    language: "Bilingual",
    icon: "fi fi-rr-laptop",
    description: "Explore total internal reflection inside silica glass cables laid across ocean floors carrying global internet binary data at light speeds.",
    didYouKnowEnglish: "Over 99% of global international internet traffic is transmitted through submarine fiber-optic cables spanning 1.4 million kilometers beneath the ocean floor!",
    didYouKnowTamil: "உலகளாவிய இணையத் தரவுகளில் 99%-க்கும் அதிகமானவை கடலடியில் 1.4 மில்லியன் கி.மீ நீளத்திற்கு இடப்பட்டுள்ள ஃபைபர் ஆப்டிக் கேபிள்கள் வழியே கடத்தப்படுகின்றன!",
    activityType: "Observe",
    activityIcon: "fi fi-rr-zoom-in",
    activityTitleEnglish: "Observe Total Internal Reflection",
    activityTitleTamil: "முழு அக எதிரொளிப்பைக் கவனிப்போம்",
    activityDescEnglish: "Shine a laser pointer into a clear plastic bottle filled with water as water streams out. Notice light bending inside the water stream!",
    activityDescTamil: "நீரடங்கிய பாட்டிலில் லேசர் ஒளியைச் செலுத்தி, நீர் வெளியேறும் போது ஒளி நீரோட்டத்திற்குள்ளேயே வளைந்து பயணிப்பதைக் கவனிக்கவும்!",
    contentEnglish: [
      "Submarine communications cables are fiber-optic cables laid on the sea bed between land-based stations to carry telecommunication signals across oceans.",
      "Inside a optical fiber strand (thinner than a human hair), data travels as pulses of light utilizing the physics principle of total internal reflection.",
      "Light signals reflect off the boundary between the inner silica glass core ($n_1$) and outer cladding material ($n_2$), bouncing millions of times per second without escaping.",
      "Transatlantic and transpacific submarine cable networks convey petabytes of digital binary data ($0$s and $1$s) with minimal signal latency."
    ],
    contentTamil: [
      "கடலடித் தொலைத்தொடர்பு கேபிள்கள் என்பது பெருங்கடல்கள் வழியே சிக்னல்களைக் கொண்டு செல்ல கடற்படுகையில் இடப்பட்ட ஃபைபர் ஆப்டிக் கேபிள்கள் ஆகும்.",
      "மனித முடியை விட மெல்லிய ஒளியிழை இழைக்குள், 'முழு அக எதிரொளிப்பு' (Total Internal Reflection) என்ற இயற்பியல் தத்துவத்தைப் பயன்படுத்தி ஒளி அலைகளாகத் தரவு பயணிக்கிறது.",
      "ஒளி அலைகள் உள் கண்ணாடிக் கோருக்கும் (Core) வெளி உறைக்கும் (Cladding) இடையே வினாடிக்கு மில்லியன் கணக்கான முறை எதிரொலித்து வெளியேறாமல் பயணிக்கின்றன.",
      "அட்லாண்டிக் மற்றும் பசிபிக் கடலடி கேபிள் அமைப்புகள் டிஜிட்டல் இருமத் தரவுகளை ($0$ மற்றும் $1$) குறைந்த தாமதத்தில் உலகம் முழுவதும் கொண்டு செல்கின்றன."
    ],
    quiz: [
      { id: 1, question: "Which optical physics principle allows light to travel inside fiber optic cables?", questionTamil: "ஃபைபர் ஆப்டிக் கேபிள்களுக்குள் ஒளி பயணிக்க உதவும் இயற்பியல் தத்துவம் எது?", options: ["Total Internal Reflection", "Magnetic Attraction", "Sound Resonance", "Combustion"], optionsTamil: ["முழு அக எதிரொளிப்பு (Total Internal Reflection)", "காந்த ஈர்ப்பு", "ஒலி எதிரொலிப்பு", "எரிதல்"], correctIndex: 0, explanation: "Light bounces inside the glass core via total internal reflection.", explanationTamil: "முழு அக எதிரொளிப்பால் ஒளி கேபிளுக்குள் பயணிக்கிறது." },
      { id: 2, question: "What percentage of global international internet traffic relies on submarine cables?", questionTamil: "உலகளாவிய சர்வதேச இணையத் தரவுகளில் எத்தனை சதவீதம் கடலடி கேபிள்களை நம்பியுள்ளது?", options: ["Over 99%", "10%", "50%", "5%"], optionsTamil: ["99%-க்கும் அதிகம்", "10%", "50%", "5%"], correctIndex: 0, explanation: "Submarine fiber optic networks handle >99% of global traffic.", explanationTamil: "99%-க்கும் அதிகமான இணையத் தரவுகள் கேபிள்கள் வழியே செல்கின்றன." },
      { id: 3, question: "What binary digits represent encoded digital computer data?", questionTamil: "கணினியில் தகவல்களைக் குறிக்கும் இருமக் குறியீடுகள் எவை?", options: ["0s and 1s", "ABC", "XYZ", "10 and 20"], optionsTamil: ["0 மற்றும் 1", "ABC", "XYZ", "10 மற்றும் 20"], correctIndex: 0, explanation: "Digital systems encode information into binary bits (0 and 1).", explanationTamil: "கணினி தரவுகள் 0 மற்றும் 1 குறியீடுகளால் ஆனவை." },
      { id: 4, question: "What material forms the central high-purity core of optical fiber cables?", questionTamil: "ஒளியிழை கேபிள்களின் மையக் கோர் பகுதி எந்தப் பொருளால் ஆனது?", options: ["High-purity Silica Glass", "Copper Metal", "Rubber", "Wood"], optionsTamil: ["தூய்மையான சிலிக்கா கண்ணாடி (Silica Glass)", "செம்பு", "ரப்பர்", "மரம்"], correctIndex: 0, explanation: "Optical fibers are drawn from ultra-pure silica glass.", explanationTamil: "மையப் பகுதி தூய்மையான சிலிக்கா கண்ணாடியால் ஆனது." },
      { id: 5, question: "Approximate total length of active undersea fiber cables globally?", questionTamil: "உலகளவில் கடலடியில் உள்ள ஃபைபர் கேபிள்களின் மொத்த நீளம் தோராயமாக எவ்வளவு?", options: ["~1.4 Million Kilometers", "1,000 Km", "500 Km", "50 Km"], optionsTamil: ["சுமார் 1.4 மில்லியன் கிலோமீட்டர்", "1,000 கி.மீ", "500 கி.மீ", "50 கி.மீ"], correctIndex: 0, explanation: "Active undersea cable networks span 1.4 million km.", explanationTamil: "மொத்த கடலடி கேபிள்கள் 1.4 மில்லியன் கி.மீ நீளம் கொண்டவை." }
    ]
  },
  {
    id: "c7-3",
    classLevel: "Class 7",
    title: "Maritime Warfare & Economy of Chola Empire",
    category: "Tamil Heritage",
    readTime: "10 mins",
    language: "Bilingual",
    icon: "fi fi-rr-anchor",
    description: "Examine Rajendra Chola I's naval expeditions across Srivijaya, ship technology, trade guilds, and maritime economy.",
    didYouKnowEnglish: "Under Rajendra Chola I (1014–1044 CE), the Chola navy deployed multi-decked wooden warships equipped with catapults and archers to dominate trade routes from Malaya to China!",
    didYouKnowTamil: "முதலாம் ராஜேந்திர சோழன் ஆட்சியில் (கி.பி 1014-1044), பல தளம் கொண்ட மரப் போர்க் கப்பல்கள் மற்றும் வில்லாளர்களைக் கொண்ட கடற்படை மலேசியா முதல் சீனா வரையிலான வர்த்தகப் பாதைகளைக் கட்டுப்படுத்தியது!",
    activityType: "Think",
    activityIcon: "fi fi-rr-brain",
    activityTitleEnglish: "Role of Maritime Trade",
    activityTitleTamil: "கடல் வர்த்தகத்தின் முக்கியத்துவம்",
    activityDescEnglish: "Why were sea trade routes essential for medieval empires? Think about how international ports brought wealth and cultural exchange!",
    activityDescTamil: "பண்டைய பேரரசுகளுக்கு கடல் வர்த்தகப் பாதைகள் ஏன் அவசியமாக இருந்தன? சர்வதேச துறைமுகங்கள் எவ்வாறு செல்வத்தையும் பண்பாட்டையும் தந்தன எனக் யோசிக்கவும்!",
    contentEnglish: [
      "Emperor Rajendra Chola I established one of the most powerful maritime naval forces in medieval Asian history during his reign from 1014 to 1044 CE.",
      "To protect Tamil merchant guilds such as Manigramam and Anjuvannam, Rajendra Chola launched a naval expedition in 1025 CE against the Srivijaya kingdom in Sumatra and Malaya.",
      "The Chola naval fleet utilized seasonal monsoon wind patterns (Southwest and Northeast monsoons) to navigate heavy wooden warships across the Bay of Bengal.",
      "Victorious naval operations secured open trade channels to Song Dynasty China, bringing economic prosperity and founding the new capital at Gangaikonda Cholapuram."
    ],
    contentTamil: [
      "முதலாம் ராஜேந்திர சோழ பேரரசர் (கி.பி 1014-1044) ஆசிய வரலாற்றிலேயே மிகவும் பலம் வாய்ந்த கடற்படையை நிறுவினார்.",
      "மணிக்கிராமம் மற்றும் அஞ்சுவண்ணம் போன்ற தமிழ் வணிகர் குழுக்களைப் பாதுகாக்க, கி.பி 1025-ல் சுமாத்திரா மற்றும் மலேசியாவின் ஸ்ரீவிஜய பேரரசுக்கு எதிராகக் கடற்படைப் படையெடுப்பை நடத்தினார்.",
      "சோழ கடற்படை தென்மேற்கு மற்றும் வடகிழக்கு பருவக்காற்றின் திசைகளைப் பயன்படுத்தி மரப் போர்க் கப்பல்களை வங்காள விரிகுடாவில் செலுத்தியது.",
      "வெற்றி பெற்ற கடற்படை நடவடிக்கைகள் சீன சோங் பேரரசுடனான வர்த்தகப் பாதைகளைப் பாதுகாத்து, 'கங்கை கொண்ட சோழபுரம்' என்ற புதிய தலைநகரை உருவாக்க வழிவகுத்தன."
    ],
    quiz: [
      { id: 1, question: "In which year did Rajendra Chola I launch his famous naval campaign against Srivijaya?", questionTamil: "ஸ்ரீவிஜயத்திற்கு எதிராக ராஜேந்திர சோழன் கடற்படைப் படையெடுப்பை நடத்திய ஆண்டு எது?", options: ["1025 CE", "1947 CE", "500 CE", "1500 CE"], optionsTamil: ["கி.பி 1025", "கி.பி 1947", "கி.பி 500", "கி.பி 1500"], correctIndex: 0, explanation: "The Srivijaya naval expedition took place in 1025 CE.", explanationTamil: "ஸ்ரீவிஜய படையெடுப்பு கி.பி 1025-ல் நடைபெற்றது." },
      { id: 2, question: "Which ancient Tamil merchant trade guild was protected by Chola naval forces?", questionTamil: "சோழ கடற்படையால் பாதுகாக்கப்பட்ட பண்டைய தமிழ் வணிகர் குழு எது?", options: ["Manigramam and Anjuvannam", "East India Co", "Guild-X", "Roman Merchants"], optionsTamil: ["மணிக்கிராமம் & அஞ்சுவண்ணம்", "கிழக்கிந்திய கம்பெனி", "கில்டு-எக்ஸ்", "ரோமானிய வணிகர்கள்"], correctIndex: 0, explanation: "Cholas protected merchant guilds like Manigramam.", explanationTamil: "மணிக்கிராம வணிகர் குழு சோழர்களால் பாதுகாக்கப்பட்டது." },
      { id: 3, question: "What natural wind phenomena did Chola navigators use to cross the ocean?", questionTamil: "கடலைக் கடக்க சோழ மாலுமிகள் பயன்படுத்திய இயற்கை காற்று நிகழ்வு எது?", options: ["Seasonal Monsoon Winds (SW & NE)", "Tornadoes", "Cyclones", "Volcano smoke"], optionsTamil: ["பருவக்காற்றுகள் (Southwest & Northeast Monsoons)", "சூறாவளி", "புயல்", "எரிமலைப் புகை"], correctIndex: 0, explanation: "Monsoon winds powered sailing vessels across the Bay.", explanationTamil: "பருவக்காற்றின் உதவியால் கப்பல்கள் இயங்கின." },
      { id: 4, question: "Which foreign imperial dynasty in China held active trade treaties with Cholas?", questionTamil: "சோழர்களுடன் வர்த்தக ஒப்பந்தம் கொண்டிருந்த சீனப் பேரரசு எது?", options: ["Song Dynasty", "Ming Dynasty", "Han Dynasty", "Qing Dynasty"], optionsTamil: ["சோங் வம்சம் (Song Dynasty)", "மிங் வம்சம்", "ஹான் வம்சம்", "கிங் வம்சம்"], correctIndex: 0, explanation: "Cholas maintained trade embassies with Song China.", explanationTamil: "சீன சோங் பேரரசுடன் வர்த்தகத் தொடர்பு இருந்தது." },
      { id: 5, question: "What capital city was built by Rajendra Chola to commemorate his victories?", questionTamil: "தன் வெற்றிகளைக் கொண்டாட ராஜேந்திர சோழன் உருவாக்கிய புதிய தலைநகரம் எது?", options: ["Gangaikonda Cholapuram", "Madurai", "Kanchi", "Poompuhar"], optionsTamil: ["கங்கை கொண்ட சோழபுரம்", "மதுரை", "காஞ்சி", "பூம்புகார்"], correctIndex: 0, explanation: "He established Gangaikonda Cholapuram.", explanationTamil: "அவர் கங்கை கொண்ட சோழபுரத்தை நிறுவினார்." }
    ]
  },
  {
    id: "c7-4",
    classLevel: "Class 7",
    title: "Rock-Cut Architecture of Mahabalipuram",
    category: "Real-World Explorations",
    readTime: "9 mins",
    language: "Bilingual",
    icon: "fi fi-rr-key",
    description: "Examine Pallava monolithic rock architecture, Pancha Rathas carving techniques, and coastal geological weathering.",
    didYouKnowEnglish: "During the December 2004 Indian Ocean tsunami, receding sea waters off Mahabalipuram exposed submerged granite ruins, confirming historical accounts of ancient coastal structures!",
    didYouKnowTamil: "2004 டிசம்பர் ஆழிப்பேரலையின் போது, மாமல்லபுரத்தில் கடல் நீர் உள்வாங்கிய போது நீரில் மூழ்கியிருந்த பாறை இடிபாடுகள் வெளிப்பட்டு வரலாற்றை நிரூபித்தன!",
    activityType: "Observe",
    activityIcon: "fi fi-rr-zoom-in",
    activityTitleEnglish: "Examine Rock Weathering",
    activityTitleTamil: "பாறை சிதைவைக் கவனிப்போம்",
    activityDescEnglish: "Observe rocks or brick walls near your school. Look for signs of wind or water erosion and weathering cracks!",
    activityDescTamil: "உங்கள் பள்ளி அருகிலுள்ள பாறைகள் அல்லது செங்கல் சுவர்களைக் கவனிக்கவும். காற்று மற்றும் நீரால் ஏற்படும் சிதைவு அறிகுறிகளைக் குறிக்கவும்!",
    contentEnglish: [
      "Mahabalipuram (Mamallapuram), situated on the Coromandel Coast of Tamil Nadu, features 7th-century Pallava rock-cut architecture developed under King Narasimhavarman I.",
      "The Five Rathas (Pancha Rathas) are monolithic structures, meaning each temple was carved top-down out of a single solid granite outcrop.",
      "The Shore Temple, constructed with quarried granite blocks, stands at the ocean edge and has withstood marine salt-air weathering for over 1,300 years.",
      "The site includes 'Arjuna's Penance', one of the world's largest open-air rock bas-reliefs, measuring 96 feet long by 43 feet high."
    ],
    contentTamil: [
      "தமிழ்நாட்டின் சோழமண்டலக் கடற்கரையில் அமைந்துள்ள மாமல்லபுரம், கி.பி 7-ஆம் நூற்றாண்டில் முதலாம் நரசிம்மவர்ம பல்லவ மன்னரால் உருவாக்கப்பட்ட பாறைக் குடைவரைக் கட்டிடக்கலையைக் கொண்டுள்ளது.",
      "பஞ்ச ரதங்கள் ஒற்றைக்கல் (Monolithic) அமைப்புகள் ஆகும்; அதாவது ஒவ்வொரு கோயிலலும் ஒரே பெரிய கிரானைட் பாறையிலிருந்து மேலிருந்து கீழாகச் செதுக்கப்பட்டது.",
      "கரையில் உள்ள கடற்கரைக் கோயில், 1,300 ஆண்டுகளுக்கு மேலாகக் கடல் உப்புக்காற்றுச் சிதைவைத் தாங்கி நின்று பல்லவர் திறமையைக் காட்டுகிறது.",
      "'அர்ஜுனன் தபஸ்' எனப்படும் திறந்தவெளி பாறைச் சிற்பம் 96 அடி நீளமும் 43 அடி உயரமும் கொண்ட உலகின் மிகப்பெரிய பாறைச் சிற்பங்களில் ஒன்றாகும்."
    ],
    quiz: [
      { id: 1, question: "Under which 7th-century Pallava King was rock-cut architecture pioneered at Mahabalipuram?", questionTamil: "7-ஆம் நூற்றாண்டில் மாமல்லபுரத்தில் பாறைக் குடைவரைக் கட்டிடக்கலையைத் தொடங்கிய பல்லவ மன்னன் யார்?", options: ["Narasimhavarman I (Mamalla)", "Mahendravarman", "Simhavishnu", "Nandi"], optionsTamil: ["முதலாம் நரசிம்மவர்மன் (மாமல்லன்)", "மகேந்திரவர்மன்", "சிம்மவிஷ்ணு", "நந்தி"], correctIndex: 0, explanation: "Narasimhavarman I (Mamalla) built these structures.", explanationTamil: "முதலாம் நரசிம்மவர்மனே இச்சிற்பங்களை உருவாக்கினார்." },
      { id: 2, question: "What does the architectural term 'Monolithic' mean regarding Pancha Rathas?", questionTamil: "பஞ்ச ரதங்களைக் குறிக்கும் 'ஒற்றைக்கல்' (Monolithic) என்ற கட்டிடக்கலைச் சொல்லின் பொருள் என்ன?", options: ["Carved top-down from a single solid rock outcrop", "Made of plastic", "Built using bricks and cement", "Made of glass"], optionsTamil: ["ஒரே பாறையைக் குடைந்து மேலிருந்து கீழாகச் செதுக்கப்பட்டவை", "பிளாஸ்டிக்கால் ஆனவை", "செங்கல் மற்றும் சிமெண்டால் ஆனவை", "கண்ணாடியால் ஆனவை"], correctIndex: 0, explanation: "Monolithic structures are carved from a single rock block.", explanationTamil: "ஒரே பாறையைக் குடைந்து செதுக்கப்பட்டவை ஒற்றைக்கல் எனப்படும்." },
      { id: 3, question: "What is the physical dimensions of the open-air rock relief 'Arjuna's Penance'?", questionTamil: "'அர்ஜுனன் தபஸ்' பாறைச் சிற்பத்தின் அளவுகள் என்ன?", options: ["96 feet long by 43 feet high", "10 feet by 5 feet", "1,000 feet long", "5 feet high"], optionsTamil: ["96 அடி நீளம் & 43 அடி உயரம்", "10 அடி நீளம்", "1,000 அடி நீளம்", "5 அடி உயரம்"], correctIndex: 0, explanation: "Arjuna's Penance measures 96 ft by 43 ft.", explanationTamil: "இது 96 அடி நீளமும் 43 அடி உயரமும் கொண்டது." },
      { id: 4, question: "What natural extreme event in 2004 briefly exposed submerged ruins off Mamallapuram?", questionTamil: "2004-ல் மாமல்லபுரத்தில் நீருக்கடியில் உள்ள இடிபாடுகளை வெளிப்படுத்திய இயற்கை நிகழ்வு எது?", options: ["Indian Ocean Tsunami", "Cyclone Gaja", "Volcano", "Snowstorm"], optionsTamil: ["இந்தியப் பெருங்கடல் ஆழிப்பேரலை (Tsunami)", "கஜா புயல்", "எரிமலை", "பனிப்புயல்"], correctIndex: 0, explanation: "Receding tsunami waters exposed ancient granite structures.", explanationTamil: "ஆழிப்பேரலையின் போது கடலடிச் சின்னங்கள் வெளிப்பட்டன." },
      { id: 5, question: "How long has the Shore Temple withstood marine salt-air weathering?", questionTamil: "கடற்கரைக் கோயில் எத்தனை ஆண்டுகளாகக் கடல் உப்புக்காற்றுச் சிதைவைத் தாங்கி நிற்கிறது?", options: ["Over 1,300 years", "10 years", "50 years", "5,000 years"], optionsTamil: ["1,300 ஆண்டுகளுக்கு மேலாக", "10 ஆண்டுகள்", "50 ஆண்டுகள்", "5,000 ஆண்டுகள்"], correctIndex: 0, explanation: "Constructed in 8th century CE, it has endured 1,300+ years.", explanationTamil: "1,300 ஆண்டுகளுக்கு மேலாக நிலைத்து நிற்கிறது." }
    ]
  },
  {
    id: "c7-5",
    classLevel: "Class 7",
    title: "Srinivasa Ramanujan & Number Theory",
    category: "Inspirational Biographies",
    readTime: "10 mins",
    language: "Bilingual",
    icon: "fi fi-rr-calculator",
    description: "Examine Srinivasa Ramanujan's mathematical notebooks, infinite series formulas, partition functions, and the Hardy-Ramanujan number 1729.",
    didYouKnowEnglish: "The number 1729 is known as the Hardy-Ramanujan number because it is the SMALLEST positive integer expressible as the sum of two cubes in two different ways ($1729 = 1^3 + 12^3 = 9^3 + 10^3$)!",
    didYouKnowTamil: "1729 என்ற எண் இரு வழிகளில் இரு கனங்களின் கூடுதலாக எழுதப்படும் மிகச்சிறிய எண் என்பதால் அது 'ஹார்டி-ராமானுஜன் எண்' என்றழைக்கப்படுகிறது ($1729 = 1^3 + 12^3 = 9^3 + 10^3$)!",
    activityType: "Think",
    activityIcon: "fi fi-rr-brain",
    activityTitleEnglish: "Verify Cube Sums of 1729",
    activityTitleTamil: "1729-ன் கனங்களின் கூடுதலைச் சரிபார்ப்போம்",
    activityDescEnglish: "Calculate $1^3 + 12^3$ ($1 + 1728$) and $9^3 + 10^3$ ($729 + 1000$) in your notebook. Verify that both equal 1729!",
    activityDescTamil: "$1^3 + 12^3$ ($1 + 1728$) மற்றும் $9^3 + 10^3$ ($729 + 1000$) ஆகியவற்றை கணக்கிட்டு இரண்டும் 1729 எனச் சரிபார்க்கவும்!",
    contentEnglish: [
      "Srinivasa Ramanujan (1887–1920), born in Erode and raised in Kumbakonam, was one of India's greatest mathematical geniuses.",
      "Despite lack of formal university education, Ramanujan independently compiled nearly 3,900 mathematical identities, equations, and infinite series theorems.",
      "In 1913, Ramanujan sent a letter containing over 120 mathematical theorems to Cambridge mathematician G.H. Hardy, who recognized his genius and invited him to England.",
      "Ramanujan was elected a Fellow of the Royal Society (FRS) in 1918, and his birth anniversary (December 22) is celebrated annually as National Mathematics Day in India."
    ],
    contentTamil: [
      "ஈரோட்டில் பிறந்து கும்பகோணத்தில் வளர்ந்த சீனிவாச ராமானுஜன் (1887-1920) இந்தியாவின் மிகச்சிறந்த கணித மேதைகளில் ஒருவர் ஆவார்.",
      "முறைசாரா பல்கலைக்கழகப் பயிற்சி இன்றி, ராமானுஜன் 3,900-க்கும் மேற்பட்ட கணிதச் சமன்பாடுகள் மற்றும் முடிவிலித் தொடர்களைத் தாமாகவே இயற்றினார்.",
      "1913-ல் கேம்பிரிட்ஜ் கணிதவியலாளர் ஜி.எச். ஹார்டிக்கு 120-க்கும் மேற்பட்ட கணிதத் தேற்றங்கள் அடங்கிய கடிதத்தை அனுப்பினார்; ஹார்டி அவரது மேதமையை உணர்ந்து லண்டனுக்கு அழைத்தார்.",
      "1918-ல் இங்கிலாந்தின் ராயல் சொசைட்டி ஃபெல்லோவாக (FRS) தேர்ந்தெடுக்கப்பட்டார்; அவரது பிறந்த நாள் (டிசம்பர் 22) இந்தியாவில் தேசிய கணித தினமாகக் கொண்டாடப்படுகிறது."
    ],
    quiz: [
      { id: 1, question: "What is mathematically unique about the Hardy-Ramanujan number 1729?", questionTamil: "ஹார்டி-ராமானுஜன் எண் 1729-ன் கணிதச் சிறப்பு என்ன?", options: ["Smallest number expressible as sum of two cubes in two different ways", "Largest prime number", "First even number", "Zero value"], optionsTamil: ["இரு வழிகளில் இரு கனங்களின் கூடுதலாக எழுதப்படும் மிகச்சிறிய எண்", "மிகப்பெரிய பகா எண்", "முதல் இரட்டை எண்", "பூஜ்ஜிய மதிப்பு"], correctIndex: 0, explanation: "1729 = 1³ + 12³ = 9³ + 10³.", explanationTamil: "1729 = 1³ + 12³ = 9³ + 10³ ஆகும்." },
      { id: 2, question: "What date is celebrated as National Mathematics Day in India to honor Ramanujan?", questionTamil: "ராமானுஜனைக் கௌரவிக்க இந்தியாவில் தேசிய கணித தினமாக எந்த நாள் கொண்டாடப்படுகிறது?", options: ["December 22", "January 26", "August 15", "October 2"], optionsTamil: ["டிசம்பர் 22", "ஜனவரி 26", "ஆகஸ்ட் 15", "அக்டோபர் 2"], correctIndex: 0, explanation: "December 22 is Ramanujan's birth anniversary.", explanationTamil: "டிசம்பர் 22 ராமானுஜனின் பிறந்த நாளாகும்." },
      { id: 3, question: "Which Cambridge mathematician mentored Ramanujan and co-authored papers with him?", questionTamil: "ராமானுஜனின் மேதமையை உணர்ந்து கேம்பிரிட்ஜிற்கு அழைத்த ஆங்கிலேய கணிதவியலாளர் யார்?", options: ["G.H. Hardy", "Isaac Newton", "Einstein", "Euler"], optionsTamil: ["ஜி.எச். ஹார்டி (G.H. Hardy)", "ஐசக் நியூட்டன்", "ஐன்ஸ்டீன்", "ஆய்லர்"], correctIndex: 0, explanation: "G.H. Hardy mentored him at Cambridge.", explanationTamil: "ஜி.எச். ஹார்டி அவரை கேம்பிரிட்ஜிற்கு அழைத்தார்." },
      { id: 4, question: "How many mathematical theorems and identities did Ramanujan compile in his notebooks?", questionTamil: "ராமானுஜன் தனது குறிப்பேடுகளில் எத்தனை கணிதத் தேற்றங்களைத் தாமாகவே தொகுத்தார்?", options: ["Nearly 3,900 Theorems", "10", "100", "50"], optionsTamil: ["சுமார் 3,900 தேற்றங்கள்", "10", "100", "50"], correctIndex: 0, explanation: "He compiled ~3,900 results independently.", explanationTamil: "அவர் 3,900 தேற்றங்களைத் தொகுத்தார்." },
      { id: 5, question: "In which year was Ramanujan elected a Fellow of the Royal Society (FRS)?", questionTamil: "ராமானுஜன் எந்த ஆண்டு ராயல் சொசைட்டி ஃபெல்லோவாக (FRS) தேர்ந்தெடுக்கப்பட்டார்?", options: ["1918", "1950", "1900", "1947"], optionsTamil: ["1918", "1950", "1900", "1947"], correctIndex: 0, explanation: "He was elected FRS in 1918.", explanationTamil: "1918-ல் அவர் FRS பட்டம் பெற்றார்." }
    ]
  },
  {
    id: "c7-6",
    classLevel: "Class 7",
    title: "Hydroelectric Power Generation Mechanics",
    category: "Science in Daily Life",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-bolt",
    description: "Study potential energy conversion into kinetic motion and electromagnetic induction generators in hydroelectric dams.",
    didYouKnowEnglish: "Hydroelectric power plants achieve energy conversion efficiency over 90%, making them far more efficient than fossil-fuel power plants which operate at around 35-40% efficiency!",
    didYouKnowTamil: "நீர்மின் நிலையங்கள் 90%-க்கும் அதிகமான ஆற்றல் மாற்றத் திறனைக் கொண்டுள்ளன! இது 35-40% திறன் கொண்ட நிலக்கரி மின் நிலையங்களை விட மிகவும் சிறந்தது!",
    activityType: "Try at Home",
    activityIcon: "fi fi-rr-house-chimney",
    activityTitleEnglish: "Water Turbine Principle",
    activityTitleTamil: "நீர் டர்பைன் தத்துவப் பரிசோதனை",
    activityDescEnglish: "Cut plastic spoon heads, attach them around a plastic cork, pass a pin through the center, and hold under running tap water to watch your turbine spin!",
    activityDescTamil: "பிளாஸ்டிக் ஸ்பூன்களை ஒரு கார்க்கில் பொருத்தி, மையத்தில் ஊசி செருகி, பாயும் குழாய் நீரின் கீழ் பிடித்து டர்பைன் சுழல்வதைக் கவனிக்கவும்!",
    contentEnglish: [
      "Hydroelectric power generation relies on converting gravitational potential energy stored in elevated dam reservoirs into mechanical kinetic energy.",
      "When dam spillway penstocks open, high-pressure water streams rush downward, striking hydraulic turbine runner blades (e.g., Francis or Kaplan turbines).",
      "The spinning turbine shaft rotates an electromagnetic rotor inside a stator generator, producing alternating electrical current (AC) via Faraday's Law of Induction.",
      "Mettur Dam (Stanley Reservoir) in Salem district, constructed across the Kaveri River in 1934, is one of Tamil Nadu's oldest multipurpose hydroelectric dams."
    ],
    contentTamil: [
      "நீர்மின் உற்பத்தி என்பது அணையின் உயரத்தில் தேக்கப்பட்ட ஈர்ப்பு நிலையாற்றலை (Potential Energy) இயந்திர இயக்க ஆற்றலாக (Kinetic Energy) மாற்றுவதை அடிப்படையாகக் கொண்டது.",
      "அணையின் எஃகு குழாய்கள் (Penstocks) திறக்கப்படும் போது, அதிவேக நீர் பாய்ந்து டர்பைன் சிறகுகளைச் சுழற்றுகிறது.",
      "சுழலும் டர்பைன் தண்டு, மின்னாக்கிக்குள் (Generator) உள்ள மின்காந்த ரோட்டாரைச் சுழற்றி, ஃபாரடேயின் மின்காந்தத் தூண்டல் விதிப்படி மின்சாரத்தை உருவாக்குகிறது.",
      "1934-ல் சேலம் மாவட்டத்தில் காவிரி ஆற்றின் குறுக்கே கட்டப்பட்ட மேட்டூர் அணை (ஸ்டான்லி நீர்த்தேக்கம்) தமிழ்நாட்டின் மிகப்பழமையான நீர்மின் அணைகளில் ஒன்றாகும்."
    ],
    quiz: [
      { id: 1, question: "What form of energy is possessed by water stored high behind a dam wall?", questionTamil: "அணை சுவருக்கு பின்னால் உயரத்தில் தேக்கப்பட்ட நீரில் உள்ள ஆற்றல் வடிவம் எது?", options: ["Gravitational Potential Energy", "Kinetic Energy", "Sound Energy", "Chemical Energy"], optionsTamil: ["ஈர்ப்பு நிலையாற்றல் (Gravitational Potential Energy)", "இயக்க ஆற்றல்", "ஒலி ஆற்றல்", "வேதி ஆற்றல்"], correctIndex: 0, explanation: "Stored elevated water has potential energy.", explanationTamil: "தேக்கப்பட்ட நீர் நிலையாற்றலைக் கொண்டுள்ளது." },
      { id: 2, question: "Which electromagnetic physics law governs electricity generation in turbine generators?", questionTamil: "டர்பைன் ஜெனரேட்டர்களில் மின்சார உற்பத்தியைக் கட்டுப்படுத்தும் மின்காந்த இயற்பியல் விதி எது?", options: ["Faraday's Law of Electromagnetic Induction", "Newton's 1st Law", "Boyles Law", "Ohm's Law"], optionsTamil: ["ஃபாரடேயின் மின்காந்தத் தூண்டல் விதி (Faraday's Law)", "நியூட்டன் முதல் விதி", "பாயில் விதி", "ஓம் விதி"], correctIndex: 0, explanation: "Faraday's Law describes electromagnetic current induction.", explanationTamil: "ஃபாரடே விதியே மின்சார உற்பத்தியை விளக்குகிறது." },
      { id: 3, question: "What energy conversion efficiency do modern hydroelectric turbines achieve?", questionTamil: "நவீன நீர்மின் டர்பைன்கள் எட்டும் ஆற்றல் மாற்றத் திறன் எவ்வளவு?", options: ["Over 90% Efficiency", "10%", "30%", "50%"], optionsTamil: ["90%-க்கும் அதிகமான திறன்", "10%", "30%", "50%"], correctIndex: 0, explanation: "Hydro turbines reach >90% energy conversion efficiency.", explanationTamil: "நீர்மின் டர்பைன்கள் 90% திறனைக் கொண்டுள்ளன." },
      { id: 4, question: "In which year was the historic Mettur Dam (Stanley Reservoir) completed in TN?", questionTamil: "வரலாற்று சிறப்புமிக்க மேட்டூர் அணை எந்த ஆண்டு தமிழ்நாட்டில் கட்டி முடிக்கப்பட்டது?", options: ["1934", "1980", "2000", "1900"], optionsTamil: ["1934", "1980", "2000", "1900"], correctIndex: 0, explanation: "Mettur Dam was completed in 1934 across the Kaveri.", explanationTamil: "மேட்டூர் அணை 1934-ல் நிறைவு செய்யப்பட்டது." },
      { id: 5, question: "What is the specialized heavy steel pipe called that carries water down to turbines?", questionTamil: "நீரை டர்பைனுக்குக் கீழே கொண்டு செல்லும் சிறப்பு எஃகு குழாய் எவ்வாறு அழைக்கப்படுகிறது?", options: ["Penstock Pipe", "Drain Pipe", "Plastic Tube", "Hose"], optionsTamil: ["பென்ஸ்டாக் குழாய் (Penstock)", "வடிகால் குழாய்", "பிளாஸ்டிக் டியூப்", "ஹோஸ்"], correctIndex: 0, explanation: "Penstocks convey high-pressure water to turbines.", explanationTamil: "பென்ஸ்டாக் குழாய்களே நீரை டர்பைனுக்குக் கொண்டு செல்கின்றன." }
    ]
  },
  {
    id: "c7-7",
    classLevel: "Class 7",
    title: "Robotics & Microcontroller Engineering",
    category: "Technology & Innovation",
    readTime: "9 mins",
    language: "Bilingual",
    icon: "fi fi-rr-settings",
    description: "Study mobile robotics, ultrasonic distance sensors, microcontroller programming, and autonomous obstacle avoidance.",
    didYouKnowEnglish: "Ultrasonic sensors used on mobile robots measure distances by sending out sound pulses at 40 kHz — far above the human hearing limit of 20 kHz!",
    didYouKnowTamil: "ரோபோக்களில் உள்ள அல்ட்ராசோனிக் சென்சார்கள் 40 kHz அதிர்வெண்ணில் ஒலி அலைகளை அனுப்பிக் தூரத்தைக் கணக்கிடுகின்றன — இது மனிதக் காதால் கேட்கும் 20 kHz எல்லையை விட அதிகம்!",
    activityType: "Think",
    activityIcon: "fi fi-rr-brain",
    activityTitleEnglish: "Understand Echolocation",
    activityTitleTamil: "ஒலி எதிரொலிப்பை அறிவோம்",
    activityDescEnglish: "Bats use echolocation to catch insects in darkness. How do sound echoes help autonomous robots navigate obstacles without crashing?",
    activityDescTamil: "வௌவால்கள் இருட்டில் இரையைப் பிடிக்க ஒலி எதிரொலிப்பைப் பயன்படுத்துகின்றன. ரோபோக்கள் தடைகளில் மோதாமல் இருக்க ஒலி அலைகள் எவ்வாறு உதவுகின்றன?",
    contentEnglish: [
      "Robotics combines mechanical engineering, electronics, and computer programming to design autonomous systems that assist human tasks.",
      "An ultrasonic sensor (such as HC-SR04) consists of a transmitter that emits a $40\\text{ kHz}$ high-frequency ultrasonic pulse and a receiver that detects its echo.",
      "By calculating the time delay ($t$) between sound emission and echo return, the microcontroller computes distance ($d = \\frac{v \\times t}{2}$ where $v \\approx 343\\text{ m/s}$).",
      "Microcontrollers process sensor input data through algorithmic loops, driving motor controllers to adjust wheel rotation and steer clear of obstacles."
    ],
    contentTamil: [
      "ரோபோட்டிக்ஸ் என்பது எந்திரவியல், எலக்ட்ரானிக்ஸ் மற்றும் கணினி நிரலாக்கத்தை இணைத்து மனித பணிகளுக்கு உதவும் தானியங்கி அமைப்புகளை உருவாக்குவதாகும்.",
      "அல்ட்ராசோனிக் சென்சார் (HC-SR04) $40\\text{ kHz}$ அதிர்வெண்ணில் ஒலி அலையை வெளிவிட்டு, தடையின் மீது பட்டுத் திரும்பும் எதிரொலியைப் பெறுகிறது.",
      "ஒலி வெளிப்பாட்டிற்கும் எதிரொலி வருகைக்கும் இடைப்பட்ட நேரத்தைக் ($t$) கொண்டு, தூரத்தை ($d = \\frac{v \\times t}{2}$) மைக்ரோகண்ட்ரோலர் கணக்கிடுகிறது.",
      "மைக்ரோகண்ட்ரோலர்கள் சென்சார் தரவுகளை நிரல் சுழற்சிகள் வழியே இயக்கி, மோட்டார்களைக் கட்டுப்படுத்தி ரோபோ மோதாமல் சுழலச் செய்கின்றன."
    ],
    quiz: [
      { id: 1, question: "What sound wave frequency do ultrasonic distance sensors emit?", questionTamil: "அல்ட்ராசோனிக் தூர சென்சார்கள் எந்த அதிர்வெண்ணில் ஒலி அலைகளை வெளிவிடுகின்றன?", options: ["40 kHz (Above human hearing)", "10 Hz", "100 Hz", "5 kHz"], optionsTamil: ["40 kHz (மனித காதுக்கு அப்பாற்பட்டது)", "10 Hz", "100 Hz", "5 kHz"], correctIndex: 0, explanation: "Ultrasonic sensors operate at ~40 kHz.", explanationTamil: "அவை 40 kHz அதிர்வெண்ணில் இயங்குகின்றன." },
      { id: 2, question: "What is the speed of sound in air used for distance calculations at room temperature?", questionTamil: "அறை வெப்பநிலையில் தூரக் கணக்கீட்டிற்குப் பயன்படும் காற்றில் ஒலியின் வேகம் என்ன?", options: ["~343 meters per second", "3,000 m/s", "10 m/s", "300,000 km/s"], optionsTamil: ["சுமார் 343 மீட்டர்/வினாடி", "3,000 மீ/வி", "10 மீ/வி", "3,00,000 கி.மீ/வி"], correctIndex: 0, explanation: "Speed of sound in air is ~343 m/s.", explanationTamil: "காற்றில் ஒலியின் வேகம் சுமார் 343 மீ/வி ஆகும்." },
      { id: 3, question: "What animal's natural navigation technique matches ultrasonic sensors?", questionTamil: "அல்ட்ராசோனிக் சென்சார்களுக்கு உத்வேகம் அளித்த விலங்கின் இயற்கை நுட்பம் எது?", options: ["Bats (Echolocation)", "Lions", "Dogs", "Horses"], optionsTamil: ["வௌவால்கள் (Echolocation)", "சிங்கம்", "நாய்", "குதிரை"], correctIndex: 0, explanation: "Bats use ultrasonic echolocation in dark caves.", explanationTamil: "வௌவால்கள் இருட்டில் ஒலி அலைகளைப் பயன்படுத்துகின்றன." },
      { id: 4, question: "Which mathematical formula calculates obstacle distance from sound echo time?", questionTamil: "ஒலி எதிரொலி நேரத்திலிருந்து தடையின் தூரத்தைக் கணக்கிடும் சூத்திரம் எது?", options: ["Distance = (v x t) / 2", "Distance = v + t", "Distance = v / t", "Distance = Zero"], optionsTamil: ["தூரம் = (v x t) / 2", "தூரம் = v + t", "தூரம் = v / t", "தூரம் = 0"], correctIndex: 0, explanation: "Distance = (velocity x time) divided by 2 for round-trip echo.", explanationTamil: "தூரம் = (வேகம் x நேரம்) / 2 ஆகும்." },
      { id: 5, question: "What embedded component serves as the central brain of a small robot?", questionTamil: "சிறிய ரோபோவின் முதன்மைச் மூளையாக செயல்படும் உட்பொதிக்கப்பட்ட சாதனம் எது?", options: ["Microcontroller Board (e.g. Arduino)", "Speaker", "Glass lens", "Battery case"], optionsTamil: ["மைக்ரோகண்ட்ரோலர் போர்டு (Arduino)", "ஸ்பீக்கர்", "கண்ணாடி லென்ஸ்", "பேட்டரி கேஸ்"], correctIndex: 0, explanation: "Microcontrollers process sensor inputs and control motors.", explanationTamil: "மைக்ரோகண்ட்ரோலரே ரோபோவின் மூளையாகும்." }
    ]
  },
  {
    id: "c7-8",
    classLevel: "Class 7",
    title: "Maritime Archaeology of Poompuhar",
    category: "Tamil Heritage",
    readTime: "9 mins",
    language: "Bilingual",
    icon: "fi fi-rr-map",
    description: "Examine underwater archaeological discoveries off Poompuhar (Kaveripoompattinam), ancient Roman coin hoards, and maritime spice trade.",
    didYouKnowEnglish: "Roman writer Pliny the Elder recorded in his 1st-century CE natural history notes that over 50 million sesterces (Roman silver/gold coins) flowed annually to India for Tamil pepper and silk!",
    didYouKnowTamil: "கி.பி 1-ஆம் நூற்றாண்டில் ரோமானிய எழுத்தாளர் பிளினி, தமிழ் மிளகு மற்றும் பட்டிற்காக ஆண்டுதோறும் 50 மில்லியனுக்கும் அதிகமான ரோமானிய நாணயங்கள் இந்தியாவிற்குச் செல்வதாகக் குறிப்பிட்டுள்ளார்!",
    activityType: "Observe",
    activityIcon: "fi fi-rr-zoom-in",
    activityTitleEnglish: "Examine Ancient Coins",
    activityTitleTamil: "பண்டைய நாணயங்களை ஆராய்வோம்",
    activityDescEnglish: "Examine modern Indian currency coins. Identify the emblem, year of minting, and mint marks stamped on them!",
    activityDescTamil: "நவீன இந்திய நாணயங்களை ஆராயவும். அதில் பொறிக்கப்பட்டுள்ள தேசியச் சின்னம், அச்சிடப்பட்ட ஆண்டு ஆகியவற்றைக் கண்டறியவும்!",
    contentEnglish: [
      "Poompuhar (also known as Kaveripoompattinam), located at the mouth of the Kaveri River, was the major port capital of the Early Chola Dynasty during the Sangam period.",
      "Marine archaeology excavations conducted by the National Institute of Oceanography (NIO) discovered submerged brick structures, ancient ring wells, and ship dockyards underwater.",
      "Extensive hoards of Roman gold coins dating from the reign of Emperors Augustus and Tiberius were excavated across coastal Tamil Nadu.",
      "Tamil merchants exported black pepper ('Yavana Priya' or Black Gold), fine textiles, pearls, and ivory to Rome in exchange for gold bullion."
    ],
    contentTamil: [
      "காவிரி ஆற்று முகத்துவாரத்தில் அமைந்துள்ள பூம்புகார் (காவேரிப்பூம்பட்டினம்), சங்கம் காலத் தொடக்கால சோழர்களின் முக்கிய துறைமுகத் தலைநகரமாக விளங்கியது.",
      "தேசிய கடல்சார் ஆராய்ச்சி நிறுவனம் (NIO) நடத்திய கடலடி அகழ்வாராய்ச்சியில் மூழ்கிய செங்கல் அமைப்புகள், உறைக்கிணறுகள் மற்றும் கப்பல் தளங்கள் கண்டுபிடிக்கப்பட்டன.",
      "தமிழகக் கடலோரப் பகுதிகளில் ரோமானிய பேரரசர்களான அகஸ்டஸ் மற்றும் டைபீரியஸ் ஆட்சிக் காலத்தைச் சேர்ந்த ஏராளமான தங்க நாணயங்கள் கண்டெடுக்கப்பட்டன.",
      "தமிழ் வணிகர்கள் கருப்பு மிளகு ('யவனப் பிரியா' / கருப்பு தங்கம்), பட்டுத் துணிகள், முத்துக்கள் மற்றும் தந்தங்களை ரோம் நகருக்கு ஏற்றுமதி செய்து தங்கத்தைப் பெற்றனர்."
    ],
    quiz: [
      { id: 1, question: "Which ancient Chola port city was located at the Kaveri river mouth?", questionTamil: "காவிரி ஆற்று முகத்துவாரத்தில் அமைந்திருந்த பண்டைய சோழர்களின் துறைமுக நகரம் எது?", options: ["Poompuhar (Kaveripoompattinam)", "Madurai", "Coimbatore", "Salem"], optionsTamil: ["பூம்புகார் (காவேரிப்பூம்பட்டினம்)", "மதுரை", "கோயம்புத்தூர்", "சேலம்"], correctIndex: 0, explanation: "Poompuhar was the premier Chola Sangam port.", explanationTamil: "பூம்புகார் சங்கம் கால சோழர் துறைமுகமாகும்." },
      { id: 2, question: "What Tamil spice was prized as 'Yavana Priya' (Black Gold) by Roman merchants?", questionTamil: "ரோமானிய வணிகர்களால் 'யவனப் பிரியா' (கருப்பு தங்கம்) என அழைக்கப்பட்ட தமிழ்ச் நறுமணப் பொருள் எது?", options: ["Black Pepper", "Turmeric", "Cardamom", "Salt"], optionsTamil: ["கருப்பு மிளகு (Black Pepper)", "மஞ்சள்", "ஏலக்காய்", "உப்பு"], correctIndex: 0, explanation: "Black pepper was referred to as Yavana Priya.", explanationTamil: "மிளகு யவனப்பிரியா என அழைக்கப்பட்டது." },
      { id: 3, question: "Which research institute conducted underwater marine archaeological excavations off Poompuhar?", questionTamil: "பூம்புகார் கடலடியில் தொல்லியல் அகழ்வாராய்ச்சி நடத்திய ஆராய்ச்சி நிறுவனம் எது?", options: ["NIO (National Institute of Oceanography)", "IIT Delhi", "NASA", "ISRO"], optionsTamil: ["NIO (தேசிய கடல்சார் ஆராய்ச்சி நிறுவனம்)", "ஐஐடி டெல்லி", "நாசா", "இஸ்ரோ"], correctIndex: 0, explanation: "NIO conducted underwater marine excavations off Poompuhar.", explanationTamil: "NIO நிறுவனம் கடலடி அகழ்வாராய்ச்சி நடத்தியது." },
      { id: 4, question: "Which 1st-century Roman writer documented gold outflow to India for Tamil spices?", questionTamil: "தமிழ் நறுமணப் பொருட்களுக்காக தங்க நாணயங்கள் இந்தியாவிற்கு செல்வதாக எழுதிய 1-ஆம் நூற்றாண்டு ரோமானிய எழுத்தாளர் யார்?", options: ["Pliny the Elder", "Homer", "Socrates", "Caesar"], optionsTamil: ["பிளினி (Pliny the Elder)", "ஹோமர்", "சாக்கிரட்டீஸ்", "சீசர்"], correctIndex: 0, explanation: "Pliny documented Roman trade with Sangam Tamilakam.", explanationTamil: "பிளினி தனது குறிப்புகளில் இதனை எழுதியுள்ளார்." },
      { id: 5, question: "Whose royal profile was stamped on Roman gold coins excavated in coastal Tamil Nadu?", questionTamil: "தமிழக கடலோரத்தில் கிடைத்த ரோமானிய தங்க நாணயங்களில் யாருடைய உருவம் பொறிக்கப்பட்டிருந்தது?", options: ["Roman Emperor Augustus and Tiberius", "Alexander", "Napoleon", "King George"], optionsTamil: ["ரோமானிய பேரரசர் அகஸ்டஸ் & டைபீரியஸ்", "அலெக்சாண்டர்", "நெப்போலியன்", "ஜார்ஜ் மன்னர்"], correctIndex: 0, explanation: "Coins bore Emperor Augustus and Tiberius profiles.", explanationTamil: "அகஸ்டஸ் மன்னரின் உருவம் பொறிக்கப்பட்டிருந்தது." }
    ]
  },
  {
    id: "c7-9",
    classLevel: "Class 7",
    title: "Fortress Architecture of Gingee",
    category: "Current Affairs",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-castle",
    description: "Study military defensive architecture, granite ramparts, rainwater harvesting tanks, and escape tunnels at Gingee Fort.",
    didYouKnowEnglish: "Gingee Fort in Villupuram district features three hill citadels (Rajagiri, Krishnagiri, and Chandrayandurg) enclosed by a massive 13-kilometer triangular fort wall!",
    didYouKnowTamil: "விழுப்புரம் மாவட்டத்தில் உள்ள செஞ்சிக் கோட்டை 13 கி.மீ நீள முக்கோணச் சுவரால் சூழப்பட்ட மூன்று மலைக்கோட்டைகளை (ராஜகிரி, கிருஷ்ணகிரி, சந்திரயான்துர்க்) கொண்டுள்ளது!",
    activityType: "Think",
    activityIcon: "fi fi-rr-brain",
    activityTitleEnglish: "Mountain Rainwater Tanks",
    activityTitleTamil: "மலைRainwater சேமிப்புக் குளங்கள்",
    activityDescEnglish: "How did soldiers harvest rainwater atop steep rock hills without electricity or pumps? Think about gravity flow channels!",
    activityDescTamil: "மின்சாரம் இல்லாத காலத்தில் வீரர்கள் மலை உச்சியில் மழைநீரை எவ்வாறு சேமித்தனர்? புவியீர்ப்பு விசை நீர் வழிப்பாதைகளைப் பற்றி சிந்திக்கவும்!",
    contentEnglish: [
      "Gingee Fort, situated in Villupuram district of Tamil Nadu, is one of the most formidable surviving medieval fortresses in South India.",
      "The fort complex spans three steep granite hills—Rajagiri, Krishnagiri, and Chandrayandurg—connected by a 13 km long outer masonry wall.",
      "Engineered with advanced military defense features, the fort contains a 7-story wedding hall (Kalyana Mahal), granaries, ammunition magazines, and natural mountain-top water reservoirs.",
      "British military officers famously referred to Gingee Fort as the 'Troy of the East' due to its complete resistance to conventional military sieges."
    ],
    contentTamil: [
      "தமிழ்நாட்டின் விழுப்புரம் மாவட்டத்தில் அமைந்துள்ள செஞ்சிக் கோட்டை, தென்னிந்தியாவில் எஞ்சியிருக்கும் மிகவும் வலிமையான வரலாற்று கோட்டைகளில் ஒன்றாகும்.",
      "இக்கோட்டை வளாகம் 13 கி.மீ நீள வெளிச் சுவரால் இணைக்கப்பட்ட ராஜகிரி, கிருஷ்ணகிரி மற்றும் சந்திரயான்துர்க் ஆகிய மூன்று செங்குத்தான கிரானைட் மலைகளைக் கொண்டுள்ளது.",
      "மேம்பட்ட இராணுவப் பாதுகாப்பு அம்சங்களுடன் கட்டப்பட்ட இக்கோட்டையில் 7 அடுக்கு கல்யாண மஹால், தானியக் களஞ்சியங்கள் மற்றும் மலை உச்சி நீர் தேக்கங்கள் உள்ளன.",
      "பாரம்பரிய இராணுவ முற்றுகைகளை எதிர்க்கும் திறன் கொண்டதால், ஆங்கிலேயர்கள் செஞ்சிக் கோட்டையை 'கிழக்கின் டிராய்' என்று அழைத்தனர்."
    ],
    quiz: [
      { id: 1, question: "Which three granite hills comprise the Gingee Fort complex?", questionTamil: "செஞ்சிக் கோட்டை வளாகத்தில் உள்ள மூன்று கிரானைட் மலைகள் எவை?", options: ["Rajagiri, Krishnagiri, Chandrayandurg", "Himalayas", "Doddabetta", "Anamudi"], optionsTamil: ["ராஜகிரி, கிருஷ்ணகிரி, சந்திரயான்துர்க்", "இமயமலை", "தொட்டபெட்டா", "ஆனைமுடி"], correctIndex: 0, explanation: "These 3 hills form the Gingee fortress complex.", explanationTamil: "இந்த மூன்று மலைகளும் செஞ்சிக் கோட்டையை உருவாக்குகின்றன." },
      { id: 2, question: "What is the total perimeter length of Gingee Fort's outer connecting wall?", questionTamil: "செஞ்சிக் கோட்டையின் வெளிச் சுற்றளவுச் சுவரின் மொத்த நீளம் எவ்வளவு?", options: ["13 Kilometers", "1 Km", "100 Km", "500 meters"], optionsTamil: ["13 கிலோமீட்டர்", "1 கி.மீ", "100 கி.மீ", "500 மீட்டர்"], correctIndex: 0, explanation: "The outer masonry wall extends 13 km.", explanationTamil: "வெளிச்சுவர் 13 கி.மீ நீளம் கொண்டது." },
      { id: 3, question: "What English nickname was given to Gingee Fort by British military officers?", questionTamil: "ஆங்கிலேய இராணுவ அதிகாரிகளால் செஞ்சிக் கோட்டைக்கு வழங்கப்பட்ட பெயர் என்ன?", options: ["Troy of the East", "Golden Castle", "Stone Palace", "Iron Citadel"], optionsTamil: ["கிழக்கின் டிராய் (Troy of the East)", "தங்கக் கோட்டை", "அரண்மனை", "இரும்புக் கோட்டை"], correctIndex: 0, explanation: "It was called Troy of the East due to its invincibility.", explanationTamil: "இதன் பாதுகாப்பால் கிழக்கின் டிராய் எனப்பட்டது." },
      { id: 4, question: "How many stories tall is the historic Kalyana Mahal inside Gingee Fort?", questionTamil: "செஞ்சிக் கோட்டைக்குள் உள்ள வரலாற்றுச் சிறப்புமிக்க கல்யாண மஹால் எத்தனை அடுக்குகள் கொண்டது?", options: ["7 Stories", "2 Stories", "20 Stories", "1 Story"], optionsTamil: ["7 அடுக்குகள்", "2 அடுக்குகள்", "20 அடுக்குகள்", "1 அடுக்கு"], correctIndex: 0, explanation: "The Kalyana Mahal tower stands 7 stories tall.", explanationTamil: "கல்யாண மஹால் 7 அடுக்குகள் கொண்டது." },
      { id: 5, question: "In which Tamil Nadu district is Gingee Fort located?", questionTamil: "செஞ்சிக் கோட்டை தமிழ்நாட்டின் எந்த மாவட்டத்தில் உள்ளது?", options: ["Villupuram District", "Madurai", "Thanjavur", "Kanyakumari"], optionsTamil: ["விழுப்புரம் மாவட்டம்", "மதுரை", "தஞ்சாவூர்", "கன்னியாகுமரி"], correctIndex: 0, explanation: "Gingee is situated in Villupuram district.", explanationTamil: "இது விழுப்புரம் மாவட்டத்தில் உள்ளது." }
    ]
  },
  {
    id: "c7-10",
    classLevel: "Class 7",
    title: "Dr. Muthulakshmi Reddy & Public Health",
    category: "Inspirational Biographies",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-user-md",
    description: "Examine Dr. Muthulakshmi Reddy's medical pioneering in 1912, her founding of the Adyar Cancer Institute in 1954, and Avvai Home.",
    didYouKnowEnglish: "Dr. Muthulakshmi Reddy was appointed in 1926 as the FIRST woman member of any state legislature in India, serving as Vice-President of the Madras Legislative Council!",
    didYouKnowTamil: "1926-ல் இந்தியாவின் எந்த ஒரு மாநில சட்டமன்றத்திலும் நியமிக்கப்பட்ட முதல் பெண் உறுப்பினரும், சென்னை சட்டமன்ற மேலவையின் துணைத் தலைவருமாகச் செயல்பட்டவர் டாக்டர் முத்துலட்சுமி ரெட்டி!",
    activityType: "Reflect",
    activityIcon: "fi fi-rr-edit-alt",
    activityTitleEnglish: "Value of Public Health Service",
    activityTitleTamil: "பொது சுகாதார சேவையின் மதிப்பு",
    activityDescEnglish: "Reflect on how dedicated doctors and healthcare workers protect community health. Write a 2-sentence thank you note.",
    activityDescTamil: "மருத்துவர்கள் எவ்வாறு சமூகத்தின் சுகாதாரத்தைப் பாதுகாக்கிறார்கள் என்பதைப் பற்றி சிந்தித்து, 2 வரிகளில் ஒரு நன்றிக்குறிப்பு எழுதவும்.",
    contentEnglish: [
      "Dr. Muthulakshmi Reddy (1886–1968), born in Pudukkottai, was a medical pioneer, social reformer, and women's rights activist.",
      "In 1912, she graduated from Madras Medical College (MMC) with top honors, becoming the first female medical graduate in South India.",
      "Nominated to the Madras Legislative Council in 1926, she became India's first female legislator and introduced laws abolishing the Devadasi system and raising the legal marriage age.",
      "In 1954, Dr. Muthulakshmi Reddy established the Cancer Institute (WIA) at Adyar in Chennai, which has grown into a world-renowned specialized cancer treatment center."
    ],
    contentTamil: [
      "புதுக்கோட்டையில் பிறந்த டாக்டர் முத்துலட்சுமி ரெட்டி (1886-1968) ஒரு மருத்துவ முன்னோடி, சமூக சீர்திருத்தவாதி மற்றும் பெண்கள் உரிமைப் போராளி ஆவார்.",
      "1912-ல் சென்னை மருத்துவக் கல்லூரியில் (MMC) முதல் மாணவியாகப் பட்டம் பெற்று, தென்னிந்தியாவின் முதல் பெண் மருத்துவப் பட்டதாரியானார்.",
      "1926-ல் சென்னை சட்டமன்ற மேலவைக்கு நியமிக்கப்பட்டு, இந்தியாவின் முதல் பெண் சட்டமன்ற உறுப்பினரானார்; தேவதாசி முறை ஒழிப்பு மற்றும் திருமண வயது உயர்வுச் சட்டங்களைக் கொண்டு வந்தார்.",
      "1954-ல் சென்னையில் அடையாறு புற்றுநோய் மருத்துவமனையை (WIA) நிறுவினார்; இது இன்று உலகப் புகழ்பெற்ற சிறப்பு புற்றுநோய் சிகிச்சை மையமாக வளர்ந்துள்ளது."
    ],
    quiz: [
      { id: 1, question: "From which medical college did Dr. Muthulakshmi Reddy graduate in 1912?", questionTamil: "1912-ல் டாக்டர் முத்துலட்சுமி ரெட்டி எந்த மருத்துவக் கல்லூரியில் பட்டம் பெற்றார்?", options: ["Madras Medical College (MMC)", "AIIMS Delhi", "CMC Vellore", "IIT Madras"], optionsTamil: ["சென்னை மருத்துவக் கல்லூரி (MMC)", "எய்ம்ஸ் டெல்லி", "சிஎம்சி வேலூர்", "ஐஐடி மெட்ராஸ்"], correctIndex: 0, explanation: "She graduated top of her class from MMC Chennai.", explanationTamil: "அவர் சென்னை எம்எம்சி கல்லூரியில் பட்டம் பெற்றார்." },
      { id: 2, question: "Which landmark healthcare institution was founded by Dr. Muthulakshmi Reddy in 1954?", questionTamil: "1954-ல் டாக்டர் முத்துலட்சுமி ரெட்டியால் சென்னையில் நிறுவப்பட்ட சுகாதார நிறுவனம் எது?", options: ["Adyar Cancer Institute (WIA)", "General Hospital", "City Clinic", "Apollo"], optionsTamil: ["அடையாறு புற்றுநோய் மருத்துவமனை (WIA)", "பொது மருத்துவமனை", "சிட்டி கிளினிக்", "அப்பல்லோ"], correctIndex: 0, explanation: "She established the Adyar Cancer Institute in 1954.", explanationTamil: "அவர் அடையாறு புற்றுநோய் மருத்துவமனையை நிறுவினார்." },
      { id: 3, question: "What legislative milestone did she achieve in 1926 in the Madras Legislative Council?", questionTamil: "1926-ல் சென்னை சட்டமன்ற மேலவையில் அவர் அடைந்த வரலாற்று மைல்கல் சாதனை எது?", options: ["First female legislator in India", "First Mayor", "Governor", "President"], optionsTamil: ["இந்தியாவின் முதல் பெண் சட்டமன்ற உறுப்பினர்", "முதல் மேயர்", "ஆளுநர்", "குடியரசுத் தலைவர்"], correctIndex: 0, explanation: "She became India's first female legislator in 1926.", explanationTamil: "அவர் இந்தியாவின் முதல் பெண் சட்டமன்ற உறுப்பினர்." },
      { id: 4, question: "What home did Dr. Muthulakshmi Reddy establish in 1930 for orphaned girls?", questionTamil: "ஆதரவற்ற பெண்களுக்காக 1930-ல் அவர் தொடங்கிய இல்லம் எது?", options: ["Avvai Home", "Mother Shelter", "Grace Home", "Peace House"], optionsTamil: ["அவ்வை இல்லம் (Avvai Home)", "அன்னை இல்லம்", "கருணை இல்லம்", "சாந்தி இல்லம்"], correctIndex: 0, explanation: "She founded Avvai Home to support girls' education.", explanationTamil: "அவர் அவ்வை இல்லத்தைத் தொடங்கினார்." },
      { id: 5, question: "In which Tamil Nadu town was Dr. Muthulakshmi Reddy born in 1886?", questionTamil: "1886-ல் டாக்டர் முத்துலட்சுமி ரெட்டி பிறந்த தமிழ்நாட்டு ஊர் எது?", options: ["Pudukkottai", "Madurai", "Thanjavur", "Chennai"], optionsTamil: ["புதுக்கோட்டை", "மதுரை", "தஞ்சாவூர்", "சென்னை"], correctIndex: 0, explanation: "She was born in Pudukkottai in 1886.", explanationTamil: "அவர் புதுக்கோட்டையில் பிறந்தார்." }
    ]
  },

  // ── CLASS 8 LEARNING EXPLORATIONS (10 Resources) ────────────────────────────
  {
    id: "c8-1",
    classLevel: "Class 8",
    title: "Photovoltaic Solar Energy Physics",
    category: "Environment & Sustainability",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-sun",
    description: "Study photovoltaic silicon semiconductors, bandgap electron excitation, and Kamuthi Solar Power Station engineering.",
    didYouKnowEnglish: "The Kamuthi Solar Power Project in Ramanathapuram district covers 2,500 acres with 2.5 million solar modules, generating 648 Megawatts of clean electricity!",
    didYouKnowTamil: "இராமநாதபுரம் கமுதி சூரிய மின் திட்டம் 2,500 ஏக்கரில் 2.5 மில்லியன் சூரிய ஒளி தகடுகளுடன் 648 மெகாவாட் மின்சாரத்தை உற்பத்தி செய்கிறது!",
    activityType: "Try at Home",
    activityIcon: "fi fi-rr-house-chimney",
    activityTitleEnglish: "Solar Calculator Test",
    activityTitleTamil: "சூரியக் கணக்கீட்டுக் கருவி பரிசோதனை",
    activityDescEnglish: "Cover the tiny solar panel of a pocket calculator with your thumb. Notice the screen dim! Uncover it under light to see it power back on.",
    activityDescTamil: "ஒரு கால்குலேட்டரின் சூரிய பேனலை விரலால் மூடவும். திரை மங்குவதைக் கவனிக்கவும்! விரலை எடுத்ததும் வெளிச்சத்தில் மீண்டும் இயங்குவதைப் பார்க்கவும்.",
    contentEnglish: [
      "Photovoltaic (PV) technology converts solar photon radiation directly into electrical energy using semiconductor materials such as crystalline silicon.",
      "When photons of sunlight strike a silicon p-n junction cell, absorbed photon energy excites valence electrons across the bandgap into the conduction band, generating free electron-hole pairs.",
      "An internal electric field across the p-n junction drives freed electrons toward the negative contact, generating direct current (DC) electricity.",
      "The Kamuthi Solar Power Project in Ramanathapuram district, commissioned in 2016, features 2.5 million solar modules producing 648 MW of clean power."
    ],
    contentTamil: [
      "ஃபோட்டோவோல்டாயிக் (PV) தொழில்நுட்பம் சூரிய ஃபோட்டான்களின் கதிர்வீச்சை சிலிக்கான் குறைக்கடத்திகள் வழியே நேரடியாக மின்சாரமாக மாற்றுகிறது.",
      "சூரிய ஒளியின் ஃபோட்டான்கள் சிலிக்கான் p-n சந்திப்பைத் தாக்கும் போது, எலக்ட்ரான்கள் ஆற்றலைப் பெற்று கடத்தல் பட்டைக்குச் சென்று எலக்ட்ரான்-துளை இரட்டைகளை உருவாக்குகின்றன.",
      "p-n சந்தியில் உள்ள உட்காந்த மின்புலம், விடுவிக்கப்பட்ட எலக்ட்ரான்களை இயக்கி நேர் மின்சாரத்தை (DC) உருவாக்குகிறது.",
      "2016-ல் தொடங்கப்பட்ட இராமநாதபுரம் கமுதி சூரிய மின் திட்டம் 2.5 மில்லியன் பேனல்களுடன் 648 மெகாவாட் தூய்மையான மின்சாரத்தை உற்பத்தி செய்கிறது."
    ],
    quiz: [
      { id: 1, question: "Which semiconductor element is most commonly used to manufacture photovoltaic solar cells?", questionTamil: "சூரிய ஒளி செல்களின் தயாரிப்பில் மிகவும் பொதுவாகப் பயன்படும் குறைக்கடத்தி தனிமம் எது?", options: ["Crystalline Silicon", "Iron", "Wood", "Copper"], optionsTamil: ["படிக சிலிக்கான் (Silicon)", "இரும்பு", "மரம்", "செம்பு"], correctIndex: 0, explanation: "Crystalline silicon is the standard solar PV material.", explanationTamil: "சிலிக்கான் தனிமமே சூரிய செல்களில் பயன்படுகிறது." },
      { id: 2, question: "What particle of light strikes solar cell semiconductors to excite electrons?", questionTamil: "சூரிய செல்லின் குறைக்கடத்தியைத் தாக்கி எலக்ட்ரான்களை இயக்கும் ஒளியின் துகள் எது?", options: ["Photons", "Protons", "Neutrons", "Molecules"], optionsTamil: ["ஃபோட்டான்கள் (Photons)", "புரோட்டான்", "நியூட்ட்ரான்", "மூலக்கூறு"], correctIndex: 0, explanation: "Photons transfer energy to valence electrons.", explanationTamil: "ஒளி ஃபோட்டான்களே ஆற்றலை அளிக்கின்றன." },
      { id: 3, question: "What is the total power generation capacity of the Kamuthi Solar Power Station?", questionTamil: "கமுதி சூரிய மின் நிலையத்தின் மொத்த மின் உற்பத்தித் திறன் எவ்வளவு?", options: ["648 Megawatts (MW)", "1 MW", "5 MW", "100 MW"], optionsTamil: ["648 மெகாவாட் (MW)", "1 மெகாவாட்", "5 மெகாவாட்", "100 மெகாவாட்"], correctIndex: 0, explanation: "Kamuthi solar park produces 648 MW of power.", explanationTamil: "கமுதி சூரிய மின் நிலையம் 648 மெகாவாட் மின்சாரம் தருகிறது." },
      { id: 4, question: "What type of electrical current is directly generated by solar PV panels?", questionTamil: "சூரிய ஒளி தகடுகளால் நேரடியாக உருவாக்கப்படும் மின்சார வகை எது?", options: ["Direct Current (DC)", "Alternating Current (AC)", "Static Shock", "Zero Current"], optionsTamil: ["நேர் மின்சாரம் (Direct Current - DC)", "மாறுதிசை மின்சாரம் (AC)", "நிலை மின்சாரம்", "பூஜ்ஜியம்"], correctIndex: 0, explanation: "PV cells produce DC electricity, converted to AC via inverters.", explanationTamil: "சூரிய செல்கள் நேர் மின்சாரத்தை (DC) உற்பத்தி செய்கின்றன." },
      { id: 5, question: "In which Tamil Nadu district is the Kamuthi solar power project situated?", questionTamil: "கமுதி சூரிய மின் திட்டம் தமிழ்நாட்டின் எந்த மாவட்டத்தில் உள்ளது?", options: ["Ramanathapuram District", "Chennai", "Ooty", "Madurai"], optionsTamil: ["இராமநாதபுரம் மாவட்டம்", "சென்னை", "ஊட்டி", "மதுரை"], correctIndex: 0, explanation: "Kamuthi is located in Ramanathapuram district.", explanationTamil: "இது இராமநாதபுரம் மாவட்டத்தில் உள்ளது." }
    ]
  },
  {
    id: "c8-2",
    classLevel: "Class 8",
    title: "ISRO Chandrayaan-3 South Pole Mission",
    category: "Current Affairs",
    readTime: "10 mins",
    language: "Bilingual",
    icon: "fi fi-rr-rocket-lunch",
    description: "Examine Chandrayaan-3's lunar south pole soft landing, LVM3 rocket launch mechanics, Vikram lander, and Pragyan rover payloads.",
    didYouKnowEnglish: "On August 23, 2023, India's Chandrayaan-3 mission successfully performed a soft landing near the lunar south pole (69.37° S), making India the FIRST country to land in the lunar south polar region!",
    didYouKnowTamil: "2023 ஆகஸ்ட் 23 அன்று, இந்தியாவின் சந்திரயான்-3 விண்கலம் நிலவின் தென்துருவத்திற்கு (69.37° S) அருகில் வெற்றிகரமாகத் தரையிறங்கி, தென் துருவத்தில் கால்பதித்த உலகின் முதல் நாடானது!",
    activityType: "Observe",
    activityIcon: "fi fi-rr-zoom-in",
    activityTitleEnglish: "Track the Moon's Phases",
    activityTitleTamil: "நிலவின் கட்டங்களைக் கவனிப்போம்",
    activityDescEnglish: "Observe the Moon tonight. Note its shape (crescent, half, full) and track how its visible illuminated shape changes over 7 days!",
    activityDescTamil: "இன்றிரவு நிலவைக் கவனிக்கவும். அதன் வடிவத்தைக் குறித்துக்கொண்டு, 7 நாட்களில் அதன் வடிவ மாற்றம் எவ்வாறு மாறுகிறது என்பதைக் கண்காணிக்கவும்!",
    contentEnglish: [
      "Launched on July 14, 2023, aboard ISRO's LVM3-M4 heavy-lift rocket from Sriharikota, Chandrayaan-3 aimed to demonstrate safe soft-landing on the lunar surface.",
      "At 18:04 IST on August 23, 2023, the Vikram lander executed an autonomous hazard detection and avoidance descent maneuver, achieving a soft landing near 69.37° S latitude.",
      "The 6-wheeled robotic Pragyan rover deployed down a ramp, conducting in-situ elemental analysis of lunar soil using its APXS and LIBS laser-induced breakdown spectroscope.",
      "Pragyan confirmed the presence of sulfur, aluminum, calcium, iron, titanium, and water ice deposits trapped inside permanently shadowed craters."
    ],
    contentTamil: [
      "2023 ஜூலை 14 அன்று ஸ்ரீஹரிகோட்டாவிலிருந்து ISRO-வின் LVM3-M4 ராக்கெட் மூலம் சந்திரயான்-3 விண்கலம் நிலவின் தென்துருவத்தை நோக்கி ஏவப்பட்டது.",
      "2023 ஆகஸ்ட் 23 அன்று மாலை 6:04 மணிக்கு, விக்ரம் லேண்டர் தானியங்கி முறையில் ஆபத்துகளைத் தவிர்த்து நிலவின் 69.37° S தென்துருவப் பகுதியில் வெற்றிகரமாகத் தரையிறங்கியது.",
      "6 சக்கரங்களைக் கொண்ட பிரக்யான் ரோவர் கீழே இறங்கி, தனது LIBS லேசர் மற்றும் APXS கருவிகள் மூலம் நிலவின் மண்ணை நேரடியாக ஆய்வு செய்தது.",
      "பிரக்யான் நிலவின் சாம்பல் நிற மண்ணில் சல்பர், அலுமினியம், கால்சியம், இரும்பு, டைட்டானியம் மற்றும் நிழல் குழிகளில் நீர்-பனிக்கட்டி இருப்பதை உறுதி செய்தது."
    ],
    quiz: [
      { id: 1, question: "On what exact date did Chandrayaan-3 soft-land on the Moon's South Pole region?", questionTamil: "சந்திரயான்-3 நிலவின் தென்துருவத்தில் தரையிறங்கிய துல்லியமான நாள் எது?", options: ["August 23, 2023", "July 14, 2023", "January 1, 2024", "August 15, 1947"], optionsTamil: ["ஆகஸ்ட் 23, 2023", "ஜூலை 14, 2023", "ஜனவரி 1, 2024", "ஆகஸ்ட் 15, 1947"], correctIndex: 0, explanation: "Soft landing occurred at 18:04 IST on August 23, 2023.", explanationTamil: "2023 ஆகஸ்ட் 23 மாலை 6:04 மணிக்கு தரையிறங்கியது." },
      { id: 2, question: "Which heavy-lift ISRO launch vehicle carried Chandrayaan-3 into space?", questionTamil: "சந்திரயான்-3 விண்கலத்தைச் சுமந்து சென்ற இஸ்ரோவின் ஏவூர்தி எது?", options: ["LVM3-M4 Rocket", "PSLV-C11", "SLV-3", "Falcon 9"], optionsTamil: ["LVM3-M4 ராக்கெட்", "PSLV-C11", "SLV-3", "பால்கன் 9"], correctIndex: 0, explanation: "LVM3-M4 (formerly GSLV Mk III) launched Chandrayaan-3.", explanationTamil: "LVM3-M4 ராக்கெட் மூலம் ஏவப்பட்டது." },
      { id: 3, question: "What is the name of the 6-wheeled robotic rover deployed onto the lunar surface?", questionTamil: "நிலவின் மேற்பரப்பில் உலா வந்த 6 சக்கர ரோபோடிக் ரோவரின் பெயர் என்ன?", options: ["Pragyan Rover", "Vikram Lander", "Mangalyaan", "Aryabhata"], optionsTamil: ["பிரக்யான் ரோவர் (Pragyan)", "விக்ரம் லேண்டர்", "மங்கள்யான்", "ஆரியபட்டா"], correctIndex: 0, explanation: "Pragyan rover conducted soil chemical analysis.", explanationTamil: "பிரக்யான் ரோவர் நிலவின் மண்ணை ஆராய்ந்தது." },
      { id: 4, question: "Which chemical element presence was confirmed on the lunar soil by LIBS instrument?", questionTamil: "LIBS கருவி மூலம் நிலவின் மண்ணில் எந்த வேதித் தனிமத்தின் இருப்பு உறுதி செய்யப்பட்டது?", options: ["Sulfur (S)", "Plastic", "Wood", "Oil"], optionsTamil: ["சல்பர் / கந்தகம் (Sulfur)", "பிளாஸ்டிக்", "மரம்", "எண்ணெய்"], correctIndex: 0, explanation: "LIBS clearly confirmed the presence of Sulfur on the Moon.", explanationTamil: "சல்பர் (கந்தகம்) இருப்பதை LIBS உறுதி செய்தது." },
      { id: 5, question: "What global distinction did India achieve with Chandrayaan-3 landing?", questionTamil: "சந்திரயான்-3 தரையிறக்கத்தின் மூலம் இந்தியா அடைந்த உலகச் சாதனை எது?", options: ["First nation to land near Moon's South Pole", "First to fly", "First to see moon", "Only space agency"], optionsTamil: ["நிலவின் தென் துருவத்தில் தரையிறங்கிய உலகின் முதல் நாடு", "முதலில் பறந்தது", "நிலவைப் பார்த்தது", "ஒரே முகமை"], correctIndex: 0, explanation: "India became the 1st country to soft-land near the lunar South Pole.", explanationTamil: "தென்துருவத்தில் தரையிறங்கிய முதல் நாடு இந்தியா." }
    ]
  },
  {
    id: "c8-3",
    classLevel: "Class 8",
    title: "Educational Policy & Social Equality",
    category: "Life Skills",
    readTime: "9 mins",
    language: "Bilingual",
    icon: "fi fi-rr-graduation-cap",
    description: "Examine K. Kamarajar's educational reforms, free Mid-day Meal Scheme, school accessibility policies, and literacy growth statistics.",
    didYouKnowEnglish: "During K. Kamarajar's tenure as Chief Minister (1954–1963), school enrollment in Tamil Nadu rose dramatically from 1.9 million to over 5.2 million students!",
    didYouKnowTamil: "காமராஜர் முதலமைச்சராகப் பணியாற்றிய காலத்தில் (1954-1963) தமிழ்நாட்டின் பள்ளி மாணவர் வருகை 1.9 மில்லியனிலிருந்து 5.2 மில்லியனுக்கும் மேலாக உயர்ந்தது!",
    activityType: "Reflect",
    activityIcon: "fi fi-rr-edit-alt",
    activityTitleEnglish: "Value of School Education",
    activityTitleTamil: "பள்ளிக் கல்வியின் மதிப்பு",
    activityDescEnglish: "Reflect on how free education and nutritious meals help children achieve their dreams. Write 2 sentences on why education matters to you.",
    activityDescTamil: "இலவசக் கல்வியும் சத்தான உணவும் குழந்தைகள் தங்கள் கனவுகளை அடைய எவ்வாறு உதவுகின்றன என்பதைப் பற்றி 2 வரிகளில் எழுதவும்.",
    contentEnglish: [
      "Kumaraswami Kamaraj (1903–1975), who served as the Chief Minister of Tamil Nadu from 1954 to 1963, introduced transformative educational reforms.",
      "Recognizing that rural poverty and malnutrition caused high student dropout rates, Kamarajar launched the free Mid-day Meal Scheme in primary schools.",
      "His administration mandated the establishment of a primary school within a 3-kilometer radius of every rural habitat, opening over 12,000 new schools.",
      "Kamarajar abolished school tuition fees, provided free school uniforms and textbooks, raising Tamil Nadu's state literacy rate from 7% to over 37%."
    ],
    contentTamil: [
      "1954 முதல் 1963 வரை தமிழ்நாட்டின் முதலமைச்சராகப் பணியாற்றிய குமாரசுவாமி காமராஜர் (1903-1975), புரட்சிகரமான கல்விச் சீர்திருத்தங்களை அறிமுகப்படுத்தினார்.",
      "கிராமப்புற வறுமையும் ஊட்டச்சத்தின்மையுமே மாணவர்கள் பள்ளியை விட்டு விலகக் காரணம் என்பதை உணர்ந்து, இலவச 'மதிய உணவுத் திட்டத்தை'த் தொடங்கினார்.",
      "ஒவ்வொரு கிராமக் குடியிருப்புக்கும் 3 கி.மீ சுற்றளவில் ஒரு தொடக்கப் பள்ளி இருக்க வேண்டும் என்ற விதியை அமல்படுத்தி, 12,000-க்கும் மேற்பட்ட புதிய பள்ளிகளைத் திறந்தார்.",
      "பள்ளிக் கட்டணத்தை ஒழித்து, இலவச சீருடைகள் மற்றும் பாடப்புத்தகங்களை வழங்கி, தமிழ்நாட்டின் எழுத்தறிவு விகிதத்தை 7%-லிருந்து 37%-க்கும் மேலாக உயர்த்தினார்."
    ],
    quiz: [
      { id: 1, question: "During which decade did K. Kamarajar serve as Chief Minister of Tamil Nadu?", questionTamil: "காமராஜர் எந்தப் பதிற்றாண்டில் தமிழ்நாட்டின் முதலமைச்சராகப் பணியாற்றினார்?", options: ["1954 to 1963", "1990 to 2000", "1920 to 1930", "2010 to 2020"], optionsTamil: ["1954 முதல் 1963 வரை", "1990 முதல் 2000 வரை", "1920 முதல் 1930 வரை", "2010 முதல் 2020 வரை"], correctIndex: 0, explanation: "Kamarajar served as CM from 1954 to 1963.", explanationTamil: "அவர் 1954-1963 வரை முதலமைச்சராக இருந்தார்." },
      { id: 2, question: "What landmark welfare scheme was launched by Kamarajar to combat student hunger?", questionTamil: "மாணவர் பசியைப் போக்க காமராஜர் அறிமுகப்படுத்திய மைல்கல் திட்டம் எது?", options: ["Free Mid-day Meal Scheme", "Free Laptop", "Free Bicycle", "Free Television"], optionsTamil: ["இலவச மதிய உணவுத் திட்டம் (Mid-day Meal)", "இலவச லேப்டாப்", "சைக்கிள்", "டிவி"], correctIndex: 0, explanation: "The Mid-day Meal scheme boosted school attendance.", explanationTamil: "மதிய உணவுத் திட்டம் மாணவர் வருகையை உயர்த்தியது." },
      { id: 3, question: "What distance radius policy did Kamarajar mandate for opening primary schools?", questionTamil: "தொடக்கப் பள்ளிகளைத் திறக்க காமராஜர் அமல்படுத்திய தொலைவு விதி என்ன?", options: ["Within 3 km of every rural habitat", "100 km apart", "50 km", "10 km"], optionsTamil: ["ஒவ்வொரு குடியிருப்பிற்கும் 3 கி.மீ-க்குள்", "100 கி.மீ", "50 கி.மீ", "10 கி.மீ"], correctIndex: 0, explanation: "Schools were built within a 3 km radius of habitats.", explanationTamil: "3 கி.மீ சுற்றளவில் இலவசப் பள்ளிகள் அமைக்கப்பட்டன." },
      { id: 4, question: "To what level did school enrollment rise in TN during Kamarajar's tenure?", questionTamil: "காமராஜர் ஆட்சியில் தமிழ்நாட்டின் பள்ளி மாணவர் வருகை எவ்வளவு உயர்ந்தது?", options: ["From 1.9 million to over 5.2 million", "100 students", "50,000", "No change"], optionsTamil: ["1.9 மில்லியனிலிருந்து 5.2 மில்லியனுக்கும் மேல்", "100 மாணவர்கள்", "50,000", "மாற்றமில்லை"], correctIndex: 0, explanation: "Student enrollment grew from 1.9M to 5.2M.", explanationTamil: "மாணவர் வருகை 5.2 மில்லியனாக உயர்ந்தது." },
      { id: 5, question: "What national honor was conferred upon Kamarajar posthumously in 1976?", questionTamil: "1976-ல் காமராஜருக்கு மரணத்திற்குப் பின் வழங்கப்பட்ட நாட்டின் உயரிய விருது எது?", options: ["Bharat Ratna", "Padma Shri", "Nobel Prize", "Vir Chakra"], optionsTamil: ["பாரத ரத்னா (Bharat Ratna)", "பத்ம ஸ்ரீ", "நோபல் பரிசு", "வீர் சக்ரா"], correctIndex: 0, explanation: "He received the Bharat Ratna in 1976.", explanationTamil: "அவருக்கு பாரத ரத்னா விருது வழங்கப்பட்டது." }
    ]
  },
  {
    id: "c8-4",
    classLevel: "Class 8",
    title: "Archaeology of Keezhadi Sangam Settlement",
    category: "Tamil Heritage",
    readTime: "10 mins",
    language: "Bilingual",
    icon: "fi fi-rr-archway",
    description: "Examine radiocarbon dating, Tamil-Brahmi script potshards, covered brick drainage systems, and iron smelting at Keezhadi.",
    didYouKnowEnglish: "Radiocarbon dating of charcoal samples from Keezhadi at Beta Analytic, USA, confirmed human settlement layers dating back to 580–600 BCE in the Vaigai river valley!",
    didYouKnowTamil: "அமெரிக்காவின் பீட்டா அனாலிட்டிக் ஆய்வகத்தின் கதிரியக்கக் கார்பன் கணிப்பு, வைகை ஆற்றுப் படுகையான கீழடியில் கி.மு 580-600 கால கட்டத்திலேயே நகர நாகரிகம் வாழ்ந்ததை உறுதி செய்தது!",
    activityType: "Observe",
    activityIcon: "fi fi-rr-zoom-in",
    activityTitleEnglish: "Observe Pottery Marks",
    activityTitleTamil: "மட்பாண்டக் குறியீடுகளைக் கவனிப்போம்",
    activityDescEnglish: "Examine terracotta pots or clay utensils. Notice how craftsmen carve personal marks or geometric patterns into clay before firing!",
    activityDescTamil: "சுடுமண் பாண்டங்களை ஆராயவும். கைவினைஞர்கள் களிமண்ணை சுடுவதற்கு முன் அதில் வரையும் குறியீடுகளையும் அமைப்புகளையும் கவனிக்கவும்!",
    contentEnglish: [
      "Keezhadi is an active archaeological excavation site located in Sivagangai district near Madurai along the Vaigai River basin.",
      "Accelerated Mass Spectrometry (AMS) radiocarbon dating of charcoal samples from Keezhadi Phase IV confirmed urban structural layers dating to 580 BCE.",
      "Excavations unearthed over 56,000 artifacts, including Tamil-Brahmi inscribed potshards with personal names ('Aadhan', 'Kuviran'), weaving loom weights, and agate beads.",
      "The site revealed sophisticated urban sanitation infrastructure, featuring covered brick drainage pipelines, ring wells, and double-walled brick kilns."
    ],
    contentTamil: [
      "கீழடி என்பது மதுரை அருகே வைகை ஆற்றுப் படுகையில் சிவகங்கை மாவட்டத்தில் அமைந்துள்ள ஒரு தொல்லியல் அகழ்வாராய்ச்சி களமாகும்.",
      "அமெரிக்காவின் பீட்டா ஆய்வகம் நடத்திய AMS கதிரியக்கக் கார்பன் கணிப்பு, கீழடியின் 4-வது கட்ட நாகரிக அடுக்குகள் கி.மு 580-ஆம் ஆண்டைச் சேர்ந்தவை என்பதை உறுதி செய்தது.",
      "அகழ்வாராய்ச்சியில் 56,000-க்கும் மேற்பட்ட தொல்பொருட்கள் கண்டெடுக்கப்பட்டன; இதில் 'ஆதன்', 'குவிரன்' என ஆள் பெயர்கள் பொறிக்கப்பட்ட தமிழ்-பிராமி சுடுமண் ஓடுகள் அடங்கும்.",
      "மூடப்பட்ட செங்கல் வடிகால் குழாய்கள், உறைக்கிணறுகள் மற்றும் இரட்டைச் சுவர் செங்கல் சூளைகள் மூலம் பண்டைய தமிழர்களின் சுகாதாரக் கட்டமைப்பு வெளிப்பட்டது."
    ],
    quiz: [
      { id: 1, question: "In which Tamil Nadu district is the Keezhadi archaeological excavation site located?", questionTamil: "கீழடி தொல்லியல் அகழ்வாராய்ச்சி களம் தமிழ்நாட்டின் எந்த மாவட்டத்தில் உள்ளது?", options: ["Sivagangai District", "Chennai", "Salem", "Coimbatore"], optionsTamil: ["சிவகங்கை மாவட்டம்", "சென்னை", "சேலம்", "கோயம்புத்தூர்"], correctIndex: 0, explanation: "Keezhadi is situated in Sivagangai district near Madurai.", explanationTamil: "கீழடி சிவகங்கை மாவட்டத்தில் உள்ளது." },
      { id: 2, question: "To what century BCE was Keezhadi dated by Beta Analytic AMS radiocarbon testing?", questionTamil: "அமெரிக்க பீட்டா ஆய்வகத்தின் AMS கார்பன் கணிப்பில் கீழடி எந்த கி.மு நூற்றாண்டைச் சேர்ந்தது?", options: ["6th Century BCE (~580 BCE)", "10th Century CE", "2000 CE", "1st Century CE"], optionsTamil: ["கி.மு 6-ஆம் நூற்றாண்டு (~580 BCE)", "கி.பி 10-ஆம் நூற்றாண்டு", "கி.பி 2000", "கி.பி 1-ஆம் நூற்றாண்டு"], correctIndex: 0, explanation: "Carbon testing confirmed urban settlement layers from 580 BCE.", explanationTamil: "கார்பன் கணிப்பு கி.மு 580-ஆம் ஆண்டை உறுதி செய்தது." },
      { id: 3, question: "What ancient script was found inscribed on Keezhadi pottery shards?", questionTamil: "கீழடி பானை ஓடுகளில் பொறிக்கப்பட்டிருந்த பண்டைய எழுத்து வடிவம் எது?", options: ["Tamil-Brahmi Script", "English", "Hieroglyphs", "Binary"], optionsTamil: ["தமிழ்-பிராமி எழுத்துக்கள் (Tamil-Brahmi)", "ஆங்கிலம்", "ஹைரோகிளிஃப்", "பைனரி"], correctIndex: 0, explanation: "Names like Aadhan were inscribed in Tamil-Brahmi script.", explanationTamil: "தமிழ்-பிராமி எழுத்துக்கள் கண்டெடுக்கப்பட்டன." },
      { id: 4, question: "What advanced urban sanitation feature was discovered at Keezhadi?", questionTamil: "கீழடியில் கண்டெடுக்கப்பட்ட மேம்பட்ட நகர சுகாதாரக் கட்டமைப்பு எது?", options: ["Covered brick drainage pipelines and ring wells", "Nuclear plants", "Plastic pipes", "Steel bridges"], optionsTamil: ["மூடப்பட்ட செங்கல் வடிகால் குழாய்கள் & உறைக்கிணறுகள்", "அணு உலைகள்", "பிளாஸ்டிக் குழாய்", "எஃகு பாலம்"], correctIndex: 0, explanation: "Brick drainage lines prove high urban sanitation standards.", explanationTamil: "செங்கல் வடிகால்கள் சுகாதார நாகரிகத்தைக் காட்டுகின்றன." },
      { id: 5, question: "How many total artifacts have been excavated across Keezhadi research phases?", questionTamil: "கீழடி அகழ்வாராய்ச்சி கட்டங்களில் மொத்தம் எத்தனை தொல்பொருட்கள் கண்டெடுக்கப்பட்டுள்ளன?", options: ["Over 56,000 Artifacts", "10", "100", "500"], optionsTamil: ["56,000-க்கும் மேற்பட்ட தொல்பொருட்கள்", "10", "100", "500"], correctIndex: 0, explanation: "Over 56,000 artifacts have been logged.", explanationTamil: "56,000-க்கும் மேற்பட்ட பொருட்கள் கண்டெடுக்கப்பட்டன." }
    ]
  },
  {
    id: "c8-5",
    classLevel: "Class 8",
    title: "Molecular Genetics & DNA Structure",
    category: "Science in Daily Life",
    readTime: "9 mins",
    language: "Bilingual",
    icon: "fi fi-rr-dna",
    description: "Study Deoxyribonucleic Acid (DNA) double-helix geometry, nitrogenous base pairing (A-T, G-C), and gene inheritance.",
    didYouKnowEnglish: "If uncoiled and stretched end-to-end, the DNA strands inside a single human cell measure about 2 meters (6.5 feet) in length!",
    didYouKnowTamil: "ஒரு மனித செல்லில் உள்ள டிஎன்ஏ இழையை அவிழ்த்து நீட்டினால் அது சுமார் 2 மீட்டர் (6.5 அடி) நீளம் கொண்டிருக்கும்!",
    activityType: "Think",
    activityIcon: "fi fi-rr-brain",
    activityTitleEnglish: "Understand Complementary Base Pairs",
    activityTitleTamil: "இணை கார ஜோடிகளைப் புரிந்துகொள்வோம்",
    activityDescEnglish: "If one strand of DNA has the sequence A-T-G-C, what is the matching sequence on the opposite strand? (Hint: A pairs with T, G pairs with C).",
    activityDescTamil: "டிஎன்ஏ-வின் ஒரு இழையில் A-T-G-C என்ற வரிசை இருந்தால், எதிர் இழையில் உள்ள வரிசை என்ன? (குறிப்பு: A-T மற்றும் G-C இணையும்).",
    contentEnglish: [
      "Deoxyribonucleic Acid (DNA) is a double-stranded macromolecule located inside the nucleus of eukaryotic cells, serving as the biological blueprint of life.",
      "The structure of DNA, solved in 1953 using Rosalind Franklin's X-ray diffraction 'Photo 51', consists of a double-helix twisted ladder geometry.",
      "The sugar-phosphate backbone forms the outer rails of the ladder, while complementary nitrogenous base pairs form the rungs: Adenine (A) pairs with Thymine (T), and Guanine (G) pairs with Cytosine (C).",
      "Genes are distinct functional segments of DNA that code for specific proteins, determining hereditary physical traits across generations."
    ],
    contentTamil: [
      "டிஆக்ஸிரைபோ நியூக்ளிக் அமிலம் (DNA) என்பது செல்லின் உட்கருவுக்குள் அமைந்துள்ள இரட்டை இழை மூலக்கூறாகும்; இது வாழ்வின் முதன்மை வரைபடமாகச் செயல்படுகிறது.",
      "1953-ல் ரொசாலிண்ட் பிராங்க்ளினின் 'Photo 51' எக்ஸ்-ரே படத்தின் மூலம் கண்டறியப்பட்ட டிஎன்ஏ வடிவமானது இரட்டைச் சுருள் ஏணி வடிவம் கொண்டதாகும்.",
      "சர்க்கரை-பாஸ்பேட் சங்கிலி ஏணியின் பக்கவாட்டுச் சட்டங்களாக அமைகிறது; கார ஜோடிகள் படிகளாக அமைகின்றன: அடினைன் (A) தைமினோடும் (T), குவானைன் (G) சைட்டோசினோடும் (C) இணையும்.",
      "ஜீன்கள் என்பது புரதங்களை உருவாக்கும் டிஎன்ஏ-வின் குறிப்பிட்ட பகுதிகளாகும்; இவை பரம்பரைப் பண்புகளை அடுத்த தலைமுறைக்குக் கொண்டு செல்கின்றன."
    ],
    quiz: [
      { id: 1, question: "What nitrogenous base pairs with Adenine (A) in a double-stranded DNA molecule?", questionTamil: "டிஎன்ஏ மூலக்கூறில் அடினைனுடன் (A) இணையும் கார ஜோடி எது?", options: ["Thymine (T)", "Guanine (G)", "Cytosine (C)", "Uracil"], optionsTamil: ["தைமின் (T)", "குவானைன் (G)", "சைட்டோசின் (C)", "யுராசில்"], correctIndex: 0, explanation: "Adenine pairs with Thymine via two hydrogen bonds.", explanationTamil: "அடினைன் எப்போதும் தைமினுடன் மட்டுமே இணையும்." },
      { id: 2, question: "Whose famous X-ray diffraction image (Photo 51) proved the double-helix geometry of DNA?", questionTamil: "டிஎன்ஏ-வின் இரட்டைச் சுருள் வடிவத்தை நிரூபித்த எக்ஸ்-ரே படம் (Photo 51) எடுத்த விஞ்ஞானி யார்?", options: ["Rosalind Franklin", "Marie Curie", "Ada Lovelace", "Florence Nightingale"], optionsTamil: ["ரொசாலிண்ட் பிராங்க்ளின் (Rosalind Franklin)", "மேரி கியூரி", "அடா லவ்லேஸ்", "புளோரன்ஸ் நைட்டிங்கேல்"], correctIndex: 0, explanation: "Rosalind Franklin captured Photo 51 in 1952.", explanationTamil: "ரொசாலிண்ட் பிராங்க்ளினின் Photo 51 முக்கியமானது." },
      { id: 3, question: "What is the uncoiled length of DNA contained inside a single human cell?", questionTamil: "ஒரு மனித செல்லில் உள்ள டிஎன்ஏ இழையை விரித்தால் அதன் நீளம் எவ்வளவு?", options: ["About 2 meters (6.5 feet)", "1 millimeter", "10 kilometers", "1 centimeter"], optionsTamil: ["சுமார் 2 மீட்டர் (6.5 அடி)", "1 மில்லிமீட்டர்", "10 கிலோமீட்டர்", "1 சென்டிமீட்டர்"], correctIndex: 0, explanation: "Uncoiled genomic DNA in one cell measures ~2 meters.", explanationTamil: "ஒரு செல்லின் டிஎன்ஏ 2 மீட்டர் நீளம் கொண்டது." },
      { id: 4, question: "Which nitrogenous base pairs with Guanine (G) in DNA?", questionTamil: "டிஎன்ஏ-வில் குவானைனுடன் (G) இணையும் கார ஜோடி எது?", options: ["Cytosine (C)", "Thymine (T)", "Adenine (A)", "Uracil"], optionsTamil: ["சைட்டோசின் (C)", "தைமின் (T)", "அடினைன் (A)", "யுராசில்"], correctIndex: 0, explanation: "Guanine pairs with Cytosine via three hydrogen bonds.", explanationTamil: "குவானைன் சைட்டோசினுடன் இணையும்." },
      { id: 5, question: "What is the functional segment of DNA called that encodes specific physical traits?", questionTamil: "குறிப்பிட்ட உடலியல் பண்புகளை உருவாக்கும் டிஎன்ஏ-வின் பகுதி எவ்வாறு அழைக்கப்படுகிறது?", options: ["Gene", "Atom", "Cell Wall", "Ribosome"], optionsTamil: ["ஜீன் (Gene)", "அணு", "செல் சுவர்", "ரைபோசோம்"], correctIndex: 0, explanation: "Genes are functional units of heredity along DNA.", explanationTamil: "ஜீன்களே உடலியல் பண்புகளைத் தீர்மானிக்கின்றன." }
    ]
  },
  {
    id: "c8-6",
    classLevel: "Class 8",
    title: "Nanotechnology & Carbon Nanomaterials",
    category: "Technology & Innovation",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-flask",
    description: "Explore the nanoscale ($1\\text{ to }100\\text{ nm}$), Graphene honeycomb lattice structure, carbon nanotubes, and targeted drug delivery.",
    didYouKnowEnglish: "A single layer of Graphene is just ONE atom thick ($0.34\\text{ nm}$), yet it is 200 times stronger than steel and conducts electricity better than copper!",
    didYouKnowTamil: "கிராஃபீனின் ஒற்றை அடுக்கு ஒரே ஒரு அணு தடிமன் மட்டுமே கொண்டது ($0.34\\text{ nm}$), இருப்பினும் அது எஃகை விட 200 மடங்கு வலிமையானது!",
    activityType: "Think",
    activityIcon: "fi fi-rr-brain",
    activityTitleEnglish: "Understand the Nanoscale",
    activityTitleTamil: "நானோ அளவைப் புரிந்துகொள்வோம்",
    activityDescEnglish: "If a human hair is 80,000 nanometers wide, how many 1-nanometer particles can fit across the width of a single hair? Calculate in your notebook!",
    activityDescTamil: "ஒரு மனித முடி 80,000 நானோமீட்டர் தடிமன் கொண்டது என்றால், ஒரு முடியின் தடிமனில் 1 நானோமீட்டர் அளவிலான எத்தனை துகள்கள் அமையும்? கணக்கிடவும்!",
    contentEnglish: [
      "Nanotechnology is the manipulation of matter at the atomic, molecular, and macromolecular scale, specifically within the range of 1 to 100 nanometers ($1\\text{ nm} = 10^{-9}\\text{ m}$).",
      "At the nanoscale, materials exhibit quantum surface-area effects, significantly altering their optical, electrical, and mechanical properties compared to bulk materials.",
      "Graphene, isolated in 2004 by Andre Geim and Konstantin Novoselov, is a two-dimensional sheet of carbon atoms bonded in a hexagonal honeycomb lattice.",
      "Targeted nanomedicine uses functionalized nanoparticles (such as liposomes or gold nanorods) to carry cancer drugs directly to tumor receptors without damaging healthy tissues."
    ],
    contentTamil: [
      "நானோ தொழில் நுட்பம் என்பது அணு மற்றும் மூலக்கூறு அளவில் (1 முதல் 100 நானோமீட்டர் வரை: $1\\text{ nm} = 10^{-9}\\text{ m}$) பொருட்களைக் கையாளும் அறிவியலாகும்.",
      "நானோ அளவில், பொருட்களின் மேற்பரப்பு பரப்பளவு அதிகரித்து, அவற்றின் ஒளியியல், மின்சார மற்றும் இயந்திரப் பண்புகள் பெருமளவில் மாறுகின்றன.",
      "2004-ல் தனிமைப்படுத்தப்பட்ட கிராஃபீன் என்பது அறுகோண தேன்கூடு அமைப்பில் பிணைக்கப்பட்ட கார்பன் அணுக்களின் இருபரிமாணத் தாளாகும்.",
      "நானோ மருத்துவம் என்பது இலக்கு வைக்கப்பட்ட நானோ துகள்களைப் பயன்படுத்தி ஆரோக்கியமான செல்களைப் பாதிக்காமல் புற்றுநோய் செல்களுக்கு நேரடியாக மருந்தைச் சேர்ப்பதாகும்."
    ],
    quiz: [
      { id: 1, question: "What numerical range defines the nanoscale in physics and material science?", questionTamil: "இயற்பியலில் நானோ அளவீடு (Nanoscale) என்பது எத்தனை மீட்டருக்கு இடைப்பட்ட அளவு?", options: ["1 to 100 Nanometers (10⁻⁹ m)", "1 Meter", "1 Kilometer", "100 Centimeters"], optionsTamil: ["1 முதல் 100 நானோமீட்டர் (10⁻⁹ மீ)", "1 மீட்டர்", "1 கிலோமீட்டர்", "100 சென்டிமீட்டர்"], correctIndex: 0, explanation: "Nanoscale spans 1 to 100 nanometers (10⁻⁹ m).", explanationTamil: "ஒரு மீட்டரின் பில்லியன் பாகமே நானோமீட்டர்." },
      { id: 2, question: "Which miracle 2D carbon material consists of a single-atom-thick honeycomb lattice?", questionTamil: "தேன்கூடு வடிவில் ஒரே அணு தடிமன் கொண்ட கார்பனால் ஆன 2D பொருள் எது?", options: ["Graphene", "Plastic", "Wood", "Copper"], optionsTamil: ["கிராஃபீன் (Graphene)", "பிளாஸ்டிக்", "மரம்", "செம்பு"], correctIndex: 0, explanation: "Graphene is a 2D sheet of carbon atoms.", explanationTamil: "கிராஃபீன் எஃகை விட 200 மடங்கு வலிமையானது." },
      { id: 3, question: "How many times stronger than steel is a single layer of Graphene?", questionTamil: "கிராஃபீனின் ஒற்றை அடுக்கு எஃகை விட எத்தனை மடங்கு வலிமையானது?", options: ["200 Times Stronger", "2 Times", "10 Times", "Same as steel"], optionsTamil: ["200 மடங்கு வலிமையானது", "2 மடங்கு", "10 மடங்கு", "சமம்"], correctIndex: 0, explanation: "Graphene exhibits a tensile strength 200x steel.", explanationTamil: "இது எஃகை விட 200 மடங்கு பலமானது." },
      { id: 4, question: "Roughly how many nanometers wide is a single strand of human hair?", questionTamil: "ஒரு மனித முடியின் தடிமன் தோராயமாக எத்தனை நானோமீட்டர்?", options: ["~80,000 to 100,000 Nanometers", "5 nm", "1 nm", "10 nm"], optionsTamil: ["சுமார் 80,000 முதல் 100,000 நானோமீட்டர்", "5 நானோமீட்டர்", "1 நானோமீட்டர்", "10 நானோமீட்டர்"], correctIndex: 0, explanation: "Human hair measures 80,000–100,000 nm wide.", explanationTamil: "மனித முடி 80,000 நானோமீட்டர் தடிமன் கொண்டது." },
      { id: 5, question: "How do targeted medical nanocarriers minimize cancer chemotherapy side effects?", questionTamil: "மருத்துவ நானோபோட்டுகள் புற்றுநோய் சிகிச்சையின் பக்கவிளைவுகளை எவ்வாறு குறைக்கின்றன?", options: ["Delivering drugs directly to tumor receptors without affecting healthy cells", "Replacing doctors", "Making people tall", "Deleting memory"], optionsTamil: ["ஆரோக்கியமான செல்களைப் பாதிக்காமல் புற்றுநோய் செல்களுக்கு நேரடியாக மருந்து வழங்குதல்", "மருத்துவர்களை மாற்றுதல்", "உயரமாக்குதல்", "நினைவை அழித்தல்"], correctIndex: 0, explanation: "Nanocarriers deliver drugs directly to tumor receptors.", explanationTamil: "அவை நேரடியாகப் பாதிக்கப்பட்ட செல்களுக்கு மருந்தைச் சேர்க்கும்." }
    ]
  },
  {
    id: "c8-7",
    classLevel: "Class 8",
    title: "Deep Space Exploration & Voyager 1",
    category: "Real-World Explorations",
    readTime: "9 mins",
    language: "Bilingual",
    icon: "fi fi-rr-globe-alt",
    description: "Study space probe trajectories, planetary gravity assist flybys, the heliopause boundary, and interstellar space exploration.",
    didYouKnowEnglish: "Launched in 1977, Voyager 1 crossed the heliopause into interstellar space in 2012 and is currently over 24 billion kilometers (15 billion miles) away from Earth!",
    didYouKnowTamil: "1977-ல் ஏவப்பட்ட வாயேஜர் 1 விண்கலம் 2012-ல் சூரிய குடும்ப எல்லையைக் கடந்து விண்வெளி பகுதிக்குச் சென்றது; தற்போது பூமியிலிருந்து 24 பில்லியன் கி.மீ தொலைவில் உள்ளது!",
    activityType: "Observe",
    activityIcon: "fi fi-rr-zoom-in",
    activityTitleEnglish: "Observe Planets in Night Sky",
    activityTitleTamil: "இரவு வானில் கோள்களைக் கவனிப்போம்",
    activityDescEnglish: "Look at the night sky. Bright non-twinkling points of light are planets (like Jupiter or Venus)! Observe how they do not twinkle like distant stars.",
    activityDescTamil: "இரவு வானைக் கவனிக்கவும். சிமிட்டாத பிரகாசமான புள்ளிகள் கோள்கள் (வியாழன்/வெள்ளி)! நட்சத்திரங்கள் போல் அல்லாமல் அவை ஏன் சிமிட்டுவதில்லை எனக் கவனிக்கவும்!",
    contentEnglish: [
      "Launched by NASA on September 5, 1977, Voyager 1 was designed to conduct close-up flyby studies of Jupiter and Saturn.",
      "The spacecraft utilized planetary 'gravity assist' maneuvers, using Jupiter's gravitational pull to accelerate its velocity without expending onboard thruster fuel.",
      "On August 25, 2012, Voyager 1 became the first human-made object to cross the heliopause—the boundary where solar wind meets interstellar plasma.",
      "Equipped with a gold-plated copper phonograph record ('Golden Record'), Voyager carries sounds, images, and greetings from Earth into deep space."
    ],
    contentTamil: [
      "1977 செப்டம்பர் 5 அன்று நாசாவால் (NASA) ஏவப்பட்ட வாயேஜர் 1 விண்கலம், வியாழன் மற்றும் சனிக் கோள்களை அருகிலிருந்து ஆராய வடிவமைக்கப்பட்டது.",
      "விண்கலம் கோள்களின் 'ஈர்ப்பு உதவி' (Gravity Assist) முறையைப் பயன்படுத்தி, கூடுதல் எரிபொருளின்றி வியாழனின் ஈர்ப்பு விசையால் தனது வேகத்தை அதிகரித்தது.",
      "2012 ஆகஸ்ட் 25 அன்று வாயேஜர் 1 சூரியக் காற்று விண்வெளி பிளாஸ்மாவைச் சந்திக்கும் எல்லையைக் (Heliopause) கடந்து விண்வெளி எல்லைக்குச் சென்ற முதல் பொருளானது.",
      "தங்கப் பூச்சுள்ள செப்பு கிராமபோன் தட்டுடன் ('Golden Record') செல்லும் வாயேஜர் 1, பூமியின் ஒலிகள் மற்றும் வாழ்த்துக்களை விண்வெளிக்குக் கொண்டு செல்கிறது."
    ],
    quiz: [
      { id: 1, question: "In which year did NASA launch the Voyager 1 space probe?", questionTamil: "நாசா எந்த ஆண்டு வாயேஜர் 1 விண்கலத்தை விண்வெளியில் ஏவியது?", options: ["1977", "2000", "2020", "1950"], optionsTamil: ["1977", "2000", "2020", "1950"], correctIndex: 0, explanation: "Voyager 1 launched on September 5, 1977.", explanationTamil: "வாயேஜர் 1 1977 செப்டம்பரில் ஏவப்பட்டது." },
      { id: 2, question: "What orbital mechanics technique accelerated Voyager 1 without burning thruster fuel?", questionTamil: "கூடுதல் எரிபொருளின்றி வாயேஜர் 1 விண்கலத்தின் வேகத்தை உயர்த்திய கோள் இயக்கவியல் நுட்பம் எது?", options: ["Planetary Gravity Assist Flyby", "Solar sail", "Parachute", "Anchor"], optionsTamil: ["கோள்களின் ஈர்ப்பு உதவி (Planetary Gravity Assist)", "சூரியப் பாய்மரம்", "பாராசூட்", "நங்கூரம்"], correctIndex: 0, explanation: "Gravity assist maneuvers accelerated the spacecraft.", explanationTamil: "கோள்களின் ஈர்ப்பு உதவி மூலம் வேகம் உயர்த்தப்பட்டது." },
      { id: 3, question: "What boundary did Voyager 1 cross in August 2012 to enter interstellar space?", questionTamil: "2012 ஆகஸ்டில் வாயேஜர் 1 எந்த எல்லையைக் கடந்து விண்வெளி பகுதிக்குச் சென்றது?", options: ["The Heliopause", "Asteroid Belt", "Lunar equator", "Earth atmosphere"], optionsTamil: ["சூரியக் குடும்ப எல்லை (The Heliopause)", "சிறுகோள் வளையம்", "நிலவுச் சமவெளி", "பூமி வளிமண்டலம்"], correctIndex: 0, explanation: "Voyager 1 crossed the heliopause into interstellar space.", explanationTamil: "ஹெலியோபாஸ் எல்லையைக் கடந்து விண்வெளிக்குச் சென்றது." },
      { id: 4, question: "What special artifact is mounted on Voyager 1 carrying messages from Earth?", questionTamil: "பூமியின் செய்திகளையும் ஒலிகளையும் சுமந்து செல்லும் வாயேஜர் 1-ல் உள்ள சிறப்புப் பொருள் எது?", options: ["Gold-plated Copper 'Golden Record'", "Paper letter", "Plastic USB drive", "Wooden box"], optionsTamil: ["தங்கப் பூச்சுள்ள செப்பு 'Golden Record'", "காகிதக் கடிதம்", "யுஎஸ்பி டிரைவ்", "மரப் பெட்டி"], correctIndex: 0, explanation: "The Golden Record carries Earth sounds and images.", explanationTamil: "கோல்டன் ரெக்கார்டு பூமியின் ஒலிகளைச் சுமந்து செல்கிறது." },
      { id: 5, question: "Roughly how far away from Earth is Voyager 1 currently travelling?", questionTamil: "பூமியிலிருந்து வாயேஜர் 1 தற்போது எவ்வளவு தொலைவில் பயணிக்கிறது?", options: ["Over 24 Billion Kilometers (15B miles)", "100 km", "1,000 km", "100,000 km"], optionsTamil: ["24 பில்லியன் கிலோமீட்டருக்கும் மேல்", "100 கி.மீ", "1,000 கி.மீ", "1,00,000 கி.மீ"], correctIndex: 0, explanation: "Voyager 1 is over 24 billion km from Earth.", explanationTamil: "இது 24 பில்லியன் கி.மீ தொலைவில் உள்ளது." }
    ]
  },
  {
    id: "c8-8",
    classLevel: "Class 8",
    title: "Veerapandiya Kattabomman & Colonial Resistance",
    category: "Life Skills",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-flag",
    description: "Examine the 18th-century Palayakkarar system, Kattabomman's refusal of East India Company taxation, and the Siege of Panchalankurichi.",
    didYouKnowEnglish: "Veerapandiya Kattabomman's historic confrontation with British Collector Alan Jackson took place in September 1798 at the Ramanathapuram Palace!",
    didYouKnowTamil: "பிரிட்டிஷ் கலெக்டர் அலன் ஜாக்சனை எதிர்த்து வீரபாண்டிய கட்டபொம்மன் நின்ற வரலாற்றுச் சந்திப்பு 1798 செப்டம்பரில் இராமநாதபுரம் அரண்மனையில் நடைபெற்றது!",
    activityType: "Reflect",
    activityIcon: "✍️",
    activityTitleEnglish: "Reflect on Courage & Principles",
    activityTitleTamil: "துணிவு மற்றும் கொள்கை வழி நிற்றல்",
    activityDescEnglish: "Standing up for truth requires courage. Write 2 sentences about a time you stood up for fairness or honesty.",
    activityDescTamil: "உண்மைக்காக நிற்பதற்குத் துணிவு தேவை. நீங்கள் நியாயத்திற்காக நின்ற ஒரு நிகழ்வைப் பற்றி 2 வரிகளில் எழுதவும்.",
    contentEnglish: [
      "Veerapandiya Kattabomman (1760–1799) was the 18th-century Palayakkarar (polygar) chieftain of Panchalankurichi in southern Tamil Nadu.",
      "When the British East India Company attempted to forcefully collect land revenue taxes (Kist) from independent polygars, Kattabomman refused to submit.",
      "During a tense meeting at Ramanathapuram Palace in September 1798, Kattabomman rejected Collector Jackson's tax demands, asserting native agrarian sovereignty over foreign invaders.",
      "His resistance led to the First Polygar War (1799). Executed at Kayathar, Kattabomman's martyrdom inspired South Indian regional alliances against British colonial rule."
    ],
    contentTamil: [
      "வீரபாண்டிய கட்டபொம்மன் (1760-1799) தெற்குத் தமிழ்நாட்டின் பாஞ்சாலங்குறிச்சியை ஆட்சி செய்த 18-ஆம் நூற்றாண்டு பாளையக்காரர் ஆவார்.",
      "பிரிட்டிஷ் கிழக்கிந்திய கம்பெனி பாளையக்காரர்களிடம் இருந்து நில வரியை (கிஸ்தி) பலவந்தமாக வசூலிக்க முயன்ற போது, கட்டபொம்மன் பணிய மறுத்தார்.",
      "1798 செப்டம்பரில் இராமநாதபுரம் அரண்மனையில் நடைபெற்ற சந்திப்பில், கலெக்டர் ஜாக்சனின் வரி கோரிக்கையைக் கட்டபொம்மன் நிராகரித்துத் தன் மண்ணின் உரிமையை நிலைநாட்டினார்.",
      "அவரது எதிர்ப்பு முதல் பாளையக்காரர் போருக்கு (1799) வழிவகுத்தது. கயத்தாறில் தூக்கிலிடப்பட்ட அவரது தியாகம், பிரிட்டிஷ் ஆட்சிக்கு எதிரான விடுதலை உணர்ச்சியைத் தூண்டியது."
    ],
    quiz: [
      { id: 1, question: "Which palayam fortress town did Veerapandiya Kattabomman rule?", questionTamil: "வீரபாண்டிய கட்டபொம்மன் எந்த பாளையக் கோட்டை நகரை ஆட்சி செய்தார்?", options: ["Panchalankurichi", "Madurai", "Coimbatore", "Chennai"], optionsTamil: ["பாஞ்சாலங்குறிச்சி (Panchalankurichi)", "மதுரை", "கோயம்புத்தூர்", "சென்னை"], correctIndex: 0, explanation: "He ruled Panchalankurichi in Thoothukudi district.", explanationTamil: "அவர் பாஞ்சாலங்குறிச்சியை ஆட்சி செய்தார்." },
      { id: 2, question: "In which year did Kattabomman confront Collector Jackson at Ramanathapuram Palace?", questionTamil: "இராமநாதபுரம் அரண்மனையில் கலெக்டர் ஜாக்சனை கட்டபொம்மன் சந்தித்த ஆண்டு எது?", options: ["September 1798", "1947", "1857", "1900"], optionsTamil: ["1798 செப்டம்பர்", "1947", "1857", "1900"], correctIndex: 0, explanation: "The historic meeting took place in September 1798.", explanationTamil: "இச்சந்திப்பு 1798 செப்டம்பரில் நடைபெற்றது." },
      { id: 3, question: "What tax term was used by the East India Company for land revenue demands?", questionTamil: "நில வருவாய் வரிக்காக கிழக்கிந்திய கம்பெனி பயன்படுத்திய சொல் எது?", options: ["Kist (Land Tax)", "GST", "VAT", "Toll"], optionsTamil: ["கிஸ்தி (Kist / நில வரி)", "ஜிஎஸ்டி", "வாட்", "டோல்"], correctIndex: 0, explanation: "Land revenue taxes were called Kist.", explanationTamil: "நில வரி 'கிஸ்தி' எனப்பட்டது." },
      { id: 4, question: "Where was Veerapandiya Kattabomman executed by the British in October 1799?", questionTamil: "1799 அக்டோபரில் பிரிட்டிஷாரால் வீரபாண்டிய கட்டபொம்மன் எங்கு தூக்கிலிடப்பட்டார்?", options: ["Kayathar", "Madurai", "Chennai", "Thanjavur"], optionsTamil: ["கயத்தாறு (Kayathar)", "மதுரை", "சென்னை", "தஞ்சாவூர்"], correctIndex: 0, explanation: "He was executed at Kayathar on October 16, 1799.", explanationTamil: "அவர் கயத்தாறில் தூக்கிலிடப்பட்டார்." },
      { id: 5, question: "What historical conflict was triggered by Kattabomman's defiance against taxation?", questionTamil: "வரி செலுத்த மறுத்த கட்டபொம்மனின் எதிர்ப்பால் வெடித்த வரலாற்றுப் போர் எது?", options: ["First Polygar War (1799)", "World War 1", "Sepoy Mutiny", "Carnatic War"], optionsTamil: ["முதல் பாளையக்காரர் போர் (1799)", "முதல் உலகப்போர்", "சிப்பாய் கலகம்", "கர்நாடகப் போர்"], correctIndex: 0, explanation: "It triggered the First Polygar War in South India.", explanationTamil: "இது முதல் பாளையக்காரர் போருக்கு வழிவகுத்தது." }
    ]
  },
  {
    id: "c8-9",
    classLevel: "Class 8",
    title: "Hydraulic Engineering of Kallanai (Grand Anicut)",
    category: "Tamil Heritage",
    readTime: "9 mins",
    language: "Bilingual",
    icon: "fi fi-rr-water-rise",
    description: "Study the 2nd-century CE dam construction across the Kaveri, unhewn stone sand-settling mechanics, and ancient canal irrigation.",
    didYouKnowEnglish: "Built by Karikala Chola in the 2nd century CE, Kallanai (Grand Anicut) is recognized as one of the OLDEST functional water-diversion dams in the world still irrigating farm fields after 2,000 years!",
    didYouKnowTamil: "கி.பி 2-ஆம் நூற்றாண்டில் கரிகால சோழனால் கட்டப்பட்ட கல்லணை, 2,000 ஆண்டுகளுக்குப் பிறகும் விவசாயத்திற்குப் பயன்படும் உலகின் மிகப்பழமையான அணையாகும்!",
    activityType: "Observe",
    activityIcon: "🔍",
    activityTitleEnglish: "Observe River Silt & Flow",
    activityTitleTamil: "ஆற்று வண்டல் மற்றும் ஓட்டத்தைக் கவனிப்போம்",
    activityDescEnglish: "Fill a plastic bottle with muddy river or garden water. Shake it and let it settle for 1 hour. Observe heavy sand particles sinking first!",
    activityDescTamil: "ஒரு பாட்டிலில் கலங்கல் நீரை ஊற்றி குலுக்கி 1 மணி நேரம் வைக்கவும். கனமான மணல் துகள்கள் அடியில் படிவதைக் கவனிக்கவும்!",
    contentEnglish: [
      "Kallanai (Grand Anicut), constructed by Early Chola King Karikalan in the 2nd century CE across the Kaveri River, is an ancient hydraulic engineering marvel.",
      "Built at the point where the Kaveri River splits into the Kollidam (Coleroon) and Kaveri branches, the dam wall measures 329 meters long, 20 meters wide, and 5.4 meters high.",
      "Chola engineers used unhewn granite boulders lowered into the rushing riverbed. As water currents washed sand around heavy stones, natural silt compaction anchored them securely into river sand.",
      "The dam successfully diverts Kaveri water into four major irrigation canals (Kaveri, Vennaru, Grand Anicut Canal, and Kollidam), turning the Thanjavur delta into the 'Rice Bowl of Tamil Nadu'."
    ],
    contentTamil: [
      "கி.பி 2-ஆம் நூற்றாண்டில் சோழ மன்னன் கரிகாலனால் காவிரி ஆற்றின் குறுக்கே கட்டப்பட்ட கல்லணை, பண்டைய நீர் பொறியியலின் பிரம்மாண்ட அதிசயமாகும்.",
      "காவிரி ஆறு கொள்ளிடம் மற்றும் காவிரி எனப் பிரியும் இடத்தில் அமைக்கப்பட்ட இந்த அணை 329 மீட்டர் நீளமும், 20 மீட்டர் அகலமும், 5.4 மீட்டர் உயரமும் கொண்டது.",
      "சோழப் பொறியாளர்கள் செதுக்கப்படாத கிரானைட் பாறைகளை ஓடும் ஆற்றுப் படுகையில் இறக்கினர். நீர் ஓட்டத்தால் பாறைகளைச் சுற்றி மணல் படிந்து, இயற்கை உறைப்புத் தொழில்நுட்பத்தால் பாறைகள் உறுதியாயின.",
      "இவ்வணை காவிரி நீரை நான்கு முக்கியக் கால்வாய்களுக்குத் திருப்பிவிட்டு (காவிரி, வெண்ணாறு, கல்லணைக் கால்வாய், கொள்ளிடம்), தஞ்சை மண்டலத்தைத் 'தமிழ்நாட்டின் நெற்களஞ்சியமாக' மாற்றியது."
    ],
    quiz: [
      { id: 1, question: "Which Chola King engineered the Kallanai (Grand Anicut) dam in the 2nd century CE?", questionTamil: "கி.பி 2-ஆம் நூற்றாண்டில் கல்லணையைக் கட்டிய சோழ மன்னன் யார்?", options: ["Karikala Chola", "Raja Raja I", "Rajendra I", "Sundara Chola"], optionsTamil: ["கரிகால சோழன் (Karikalan)", "முதலாம் ராஜராஜன்", "முதலாம் ராஜேந்திரன்", "சுந்தர சோழன்"], correctIndex: 0, explanation: "Karikala Chola constructed Kallanai.", explanationTamil: "கரிகால சோழனே கல்லணையைக் கட்டினார்." },
      { id: 2, question: "Across which river was the Kallanai dam structure engineered?", questionTamil: "கல்லணை எந்த ஆற்றின் குறுக்கே கட்டப்பட்டது?", options: ["Kaveri River", "Vaigai", "Thamirabarani", "Palar"], optionsTamil: ["காவிரி ஆறு (Kaveri)", "வைகை", "தாமிரபரணி", "பாலாறு"], correctIndex: 0, explanation: "Kallanai diverts Kaveri river waters.", explanationTamil: "இது காவிரி ஆற்றின் குறுக்கே கட்டப்பட்டது." },
      { id: 3, question: "What is the total length dimension of the Kallanai dam wall?", questionTamil: "கல்லணைச் சுவரின் மொத்த நீளம் எவ்வளவு?", options: ["329 meters long", "10 meters", "5,000 meters", "50 meters"], optionsTamil: ["329 மீட்டர் நீளம்", "10 மீட்டர்", "5,000 மீட்டர்", "50 மீட்டர்"], correctIndex: 0, explanation: "The dam wall spans 329 meters in length.", explanationTamil: "அணைச் சுவர் 329 மீட்டர் நீளம் கொண்டது." },
      { id: 4, question: "How many major irrigation branch canals are fed by water diverted at Kallanai?", questionTamil: "கல்லணையில் திருப்ப்படும் நீரால் பயன்பெறும் முக்கிய பாசனக் கால்வாய்கள் எத்தனை?", options: ["4 Canals (Kaveri, Vennaru, Grand Anicut Canal, Kollidam)", "1 Canal", "20 Canals", "None"], optionsTamil: ["4 கால்வாய்கள் (காவிரி, வெண்ணாறு, கல்லணைக் கால்வாய், கொள்ளிடம்)", "1", "20", "எதுவுமில்லை"], correctIndex: 0, explanation: "It feeds 4 major delta irrigation canals.", explanationTamil: "இது 4 பாசனக் கால்வாய்களுக்கு நீர் தருகிறது." },
      { id: 5, question: "What natural hydraulic technique anchored unhewn granite stones in the riverbed?", questionTamil: "ஆற்றுப் படுகையில் கிரானைட் பாறைகளை நிலைநிறுத்திய இயற்கை பொறியியல் முறை எது?", options: ["Natural Sand Settling and Silt Compaction", "Modern Cement", "Glue", "Rope tying"], optionsTamil: ["இயற்கை மணல் உறைப்பு & வண்டல் படிதல்", "நவீன சிமெண்ட்", "பசை", "கயிறு கட்டுதல்"], correctIndex: 0, explanation: "Stones sank into sand, anchored by silt compaction.", explanationTamil: "மணல் மற்றும் வண்டல் உறைப்பால் பாறைகள் உறுதியாயின." }
    ]
  },
  {
    id: "c8-10",
    classLevel: "Class 8",
    title: "Dr. M.S. Swaminathan & Agricultural Science",
    category: "Inspirational Biographies",
    readTime: "8 mins",
    language: "Bilingual",
    icon: "fi fi-rr-leaf",
    description: "Study Dr. M.S. Swaminathan's wheat genetics research, semi-dwarf high-yielding crop breeding, and India's Green Revolution.",
    didYouKnowEnglish: "Dr. M.S. Swaminathan was awarded the inaugural World Food Prize in 1987 for his role in developing high-yielding wheat and rice varieties that saved millions from starvation!",
    didYouKnowTamil: "மில்லியன் கணக்கான மக்களைப் பசியிலிருந்து காப்பாற்றிய உயர் மகசூல் கோதுமை ரகங்களை உருவாக்கியதற்காக 1987-ல் முதல் உலக உணவுப் பரிசைப் பெற்றவர் டாக்டர் எம்.எஸ். சுவாமிநாதன்!",
    activityType: "Try at Home",
    activityIcon: "🏠",
    activityTitleEnglish: "Compare Soil Types",
    activityTitleTamil: "மண் வகைகளை ஒப்பிடுவோம்",
    activityDescEnglish: "Collect garden soil, clay, and sand in 3 small cups. Pour equal water into each and observe which soil retains water best!",
    activityDescTamil: "தோட்டத்து மண், களிமண் மற்றும் மணலை 3 குவளைகளில் எடுக்கவும். சம அளவு நீர் ஊற்றி எந்த மண் நீரை அதிகம் சேமிக்கிறது எனக் கவனிக்கவும்!",
    contentEnglish: [
      "Mankombu Sambasivan Swaminathan (1925–2023), born in Kumbakonam, Tamil Nadu, was an internationally acclaimed agricultural geneticist.",
      "During the mid-1960s, India faced severe food grain deficits. Dr. Swaminathan collaborated with Nobel laureate Norman Borlaug to introduce semi-dwarf, high-yielding wheat (Norin-10 genes) and rice (IR8) varieties.",
      "These high-yielding varieties possessed sturdy short stems that resisted lodging (falling over) under heavy grain weight and fertilizer application.",
      "His leadership in transforming India from a food-deficit nation into a food-surplus exporter earned him the title 'Father of India's Green Revolution' and the 1987 World Food Prize."
    ],
    contentTamil: [
      "தமிழ்நாட்டின் கும்பகோணத்தில் பிறந்த மாங்கொம்பு சாம்பசிவன் சுவாமிநாதன் (1925-2023) சர்வதேச அளவில் புகழ்பெற்ற விவசாய மரபியல் விஞ்ஞானி ஆவார்.",
      "1960-களின் மத்தியில் இந்தியாவில் கடும் உணவுத் தானியப் பஞ்சம் ஏற்பட்ட போது, நோபல் வெற்றியாளர் நார்மன் போர்லாக்குடன் இணைந்து குள்ள ரக உயர் மகசூல் கோதுமை மற்றும் நெல் (IR8) ரகங்களை அறிமுகப்படுத்தினார்.",
      "இந்த உயர் மகசூல் ரகங்கள் உறுதியான குள்ளத் தண்டுகளைக் கொண்டிருந்ததால், அதிக தானிய எடையில் சாயாமல் (Lodging) உரங்களை ஏற்று அதிக விளைச்சலைத் தந்தன.",
      "இந்தியாவை உணவுப் பஞ்சத்திலிருந்து ஏற்றுமதி செய்யும் நாடாக மாற்றிய அவரது தலைமைத்துவம், அவருக்கு 'இந்தியப் பசுமைப் புரட்சியின் தந்தை' என்ற பெயரையும் 1987 உலக உணவுப் பரிசையும் பெற்றுத் தந்தது."
    ],
    quiz: [
      { id: 1, question: "Who is celebrated as the 'Father of India's Green Revolution'?", questionTamil: "'இந்தியப் பசுமைப் புரட்சியின் தந்தை' என்று போற்றப்படுபவர் யார்?", options: ["Dr. M.S. Swaminathan", "C.V. Raman", "Aryabhata", "Subramanyan Chandrasekhar"], optionsTamil: ["டாக்டர் எம்.எஸ். சுவாமிநாதன்", "சி.வி. ராமன்", "ஆரியபட்டா", "சுப்பிரமணியன் சந்திரசேகர்"], correctIndex: 0, explanation: "Dr. M.S. Swaminathan led India's Green Revolution.", explanationTamil: "டாக்டர் எம்.எஸ். சுவாமிநாதன் பசுமைப் புரட்சியை வழிநடத்தினார்." },
      { id: 2, question: "Which major international award did Dr. Swaminathan receive as its inaugural winner in 1987?", questionTamil: "1987-ல் முதன்முதலாகத் தொடங்கப்பட்ட எந்த சர்வதேச விருதை டாக்டர் சுவாமிநாதன் பெற்றார்?", options: ["World Food Prize", "Nobel Peace Prize", "Grammy", "Oscar"], optionsTamil: ["உலக உணவுப் பரிசு (World Food Prize)", "நோபல் அமைதிப் பரிசு", "கிராமி", "ஆஸ்கார்"], correctIndex: 0, explanation: "He received the first World Food Prize in 1987.", explanationTamil: "அவர் 1987-ல் முதல் உலக உணவுப் பரிசைப் பெற்றார்." },
      { id: 3, question: "With which Nobel laureate plant breeder did Dr. Swaminathan collaborate?", questionTamil: "எந்த நோபல் பரிசு பெற்ற பயிர் விஞ்ஞானியுடன் டாக்டர் சுவாமிநாதன் இணைந்து பணியாற்றினார்?", options: ["Norman Borlaug", "Albert Einstein", "Isaac Newton", "Edison"], optionsTamil: ["நார்மன் போர்லாக் (Norman Borlaug)", "ஐன்ஸ்டீன்", "நியூட்டன்", "எடிசன்"], correctIndex: 0, explanation: "He worked with Norman Borlaug on dwarf wheat varieties.", explanationTamil: "நார்மன் போர்லாக்குடன் இணைந்து பணியாற்றினார்." },
      { id: 4, question: "What genetic trait prevented high-yielding wheat varieties from falling over under heavy grain weight?", questionTamil: "அதிக தானிய எடையில் கோதுமைப் பயிர்கள் கீழே சாயாமல் தடுத்த மரபணுப் பண்பு எது?", options: ["Semi-dwarf sturdy stems (Resisting lodging)", "Tall thin stems", "No leaves", "Red flowers"], optionsTamil: ["குள்ள உறுதியானத் தண்டுகள் (Resisting lodging)", "நீளமான மெல்லிய தண்டு", "இலைகள் இல்லாமை", "சிவப்பு மலர்"], correctIndex: 0, explanation: "Semi-dwarf genes prevented lodging under heavy grain heads.", explanationTamil: "குள்ளத் தண்டுகள் பயிர் சாய்வதைத் தடுத்தன." },
      { id: 5, question: "In which Tamil Nadu city was Dr. M.S. Swaminathan born in 1925?", questionTamil: "1925-ல் டாக்டர் எம்.எஸ். சுவாமிநாதன் பிறந்த தமிழ்நாட்டு நகரம் எது?", options: ["Kumbakonam", "Madurai", "Chennai", "Coimbatore"], optionsTamil: ["கும்பகோணம்", "மதுரை", "சென்னை", "கோயம்புத்தூர்"], correctIndex: 0, explanation: "He was born in Kumbakonam in 1925.", explanationTamil: "அவர் கும்பகோணத்தில் பிறந்தார்." }
    ]
  }
];

function getNormalizedStudentClass(sessionUser: any): string {
  let text = "";
  if (sessionUser) {
    text += `${sessionUser.class || ''} ${sessionUser.grade || ''} ${sessionUser.name || ''} `;
  }
  if (typeof window !== "undefined") {
    text += `${localStorage.getItem("studentClass") || ''} ${localStorage.getItem("user") || ''} `;
  }
  text = text.toLowerCase();

  if (text.includes("8") || text.includes("viii") || text.includes("eight")) return "Class 8";
  if (text.includes("7") || text.includes("vii") || text.includes("seven")) return "Class 7";
  if (text.includes("6") || text.includes("vi") || text.includes("six")) return "Class 6";
  
  return "Class 8";
}

export default function RedesignedDigitalLibraryPage() {
  const { data: session, status } = useSession();
  const sessionUser = (session?.user as any);

  const studentStandard = useMemo(() => {
    return getNormalizedStudentClass(sessionUser);
  }, [sessionUser]);

  // 🔍 Interactive State Management - Strictly locked to student's grade standard!
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("Class 8");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All Themes");
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const cardsPerPage = 12;

  // Sync default filter whenever session status resolves
  useEffect(() => {
    if (studentStandard) {
      setSelectedClassFilter(studentStandard);
    }
  }, [studentStandard, status]);

  // 📖 Reader Modal State
  const [activeReadingResource, setActiveReadingResource] = useState<Resource | null>(null);
  const [readerLanguage, setReaderLanguage] = useState<"English" | "Tamil">("English");

  // 📝 Quiz Modal State
  const [activeQuizResource, setActiveQuizResource] = useState<Resource | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // 🎯 Dynamic Category options derived strictly from active standard's resources!
  const categoryOptions = useMemo(() => {
    const classStories = resourcesData.filter(res => res.classLevel === selectedClassFilter);
    const categories = Array.from(new Set(classStories.map(res => res.category)));
    return ["All Themes", ...categories];
  }, [selectedClassFilter]);

  // Reset category filter when class changes
  useEffect(() => {
    setSelectedCategoryFilter("All Themes");
  }, [selectedClassFilter]);

  // 📊 Filtered Resources Calculation
  const filteredResources = useMemo(() => {
    return resourcesData.filter(res => {
      // Standard Filter
      if (res.classLevel !== selectedClassFilter) {
        return false;
      }
      // Theme/Category Filter
      if (selectedCategoryFilter !== "All Themes" && selectedCategoryFilter !== "All Categories" && res.category !== selectedCategoryFilter) {
        return false;
      }
      // Language Filter
      if (selectedLanguageFilter !== "All" && selectedLanguageFilter !== "All Languages" && res.language !== selectedLanguageFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${res.title} ${res.category} ${res.description} ${res.classLevel}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [selectedClassFilter, selectedCategoryFilter, selectedLanguageFilter, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClassFilter, selectedCategoryFilter, selectedLanguageFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredResources.length / cardsPerPage));
  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * cardsPerPage;
    return filteredResources.slice(start, start + cardsPerPage);
  }, [filteredResources, currentPage, cardsPerPage]);

  // 📝 Quiz Handlers
  const handleSelectQuizOption = (questionId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateQuizScore = () => {
    if (!activeQuizResource) return 0;
    let score = 0;
    activeQuizResource.quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <PortalLayout
      title="Middle School Digital Learning & Explorations"
      subtitle="Factual Learning Explorations & Standard-Curated Resources · Tamil Nadu Schools"
      avatarLetter="D"
      avatarColor="#2563eb"
      themeClass="theme-student"
      accentColor="#2563eb"
    >
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full text-left font-sans">

        {/* 🏛️ Top Header Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-3 py-1 font-bold text-xs uppercase rounded-lg border border-blue-200 dark:border-blue-800 mb-2">
                <i className="fi fi-rr-book-alt text-xs" /> Standard Curriculum Platform
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {selectedClassFilter} Digital Library & Read & Discover
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
                Explore 10 verified educational learning modules covering Real-World Explorations, Science, Tamil Heritage, Space, and Sustainability.
              </p>
            </div>

            {/* Total Resources Badge */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center text-lg">
                <i className="fi fi-rr-books" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Modules</span>
                <span className="text-base font-black text-slate-800 dark:text-white">{filteredResources.length} Modules</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 Search & Relatable Filter Toolbar */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="relative col-span-1 sm:col-span-2 md:col-span-2">
              <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search topic, theme, scientist, biography..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl py-2 pl-9 pr-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Relatable Category/Theme Filter */}
            <div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <select
                value={selectedLanguageFilter}
                onChange={(e) => setSelectedLanguageFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All">All Languages</option>
                <option value="Bilingual">Bilingual (Tamil/English)</option>
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
              </select>
            </div>

          </div>
        </div>

        {/* 📚 Resource Cards Grid */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm min-h-[500px] flex flex-col justify-between">
          
          {filteredResources.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 my-auto">
              <i className="fi fi-rr-search text-3xl text-slate-400 block mb-2" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No Modules Found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Try clearing search keywords or changing the theme filter.
              </p>
              <button
                onClick={() => { setSelectedCategoryFilter("All Themes"); setSelectedLanguageFilter("All"); setSearchQuery(""); }}
                className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
              >
                Reset Theme Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedResources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between shadow-sm space-y-3"
                >
                  {/* Top Bar: Icon, Title & Class Badge */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      {/* Flat Icon Box */}
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-lg shrink-0">
                        <i className={res.icon} />
                      </div>

                      {/* Class Badge */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {res.classLevel}
                      </span>
                    </div>

                    {/* Module Title */}
                    <h3 className="text-base font-black text-slate-800 dark:text-white leading-snug">
                      {res.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-normal line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  {/* Metadata Row: Category Theme, Time, Language */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 gap-1">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-bold">
                        {res.category}
                      </span>

                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="flex items-center gap-1">
                          <i className="fi fi-rr-clock text-xs" /> {res.readTime}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                          <i className="fi fi-rr-globe text-xs" /> {res.language}
                        </span>
                      </div>
                    </div>

                    {/* Button Group: Read & Discover & Take Quiz */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => { setActiveReadingResource(res); setReaderLanguage("English"); }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-none"
                      >
                        <i className="fi fi-rr-book-alt text-xs" />
                        <span>Read & Discover</span>
                      </button>

                      <button
                        onClick={() => { setActiveQuizResource(res); resetQuiz(); }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-none"
                      >
                        <i className="fi fi-rr-edit text-xs" />
                        <span>Take Quiz</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 📄 Pagination Bar */}
          {filteredResources.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-6 border-t border-slate-100 dark:border-slate-700/60">
              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-slate-800 dark:text-slate-200 font-black">{(currentPage - 1) * cardsPerPage + 1}</span> to{" "}
                <span className="text-slate-800 dark:text-slate-200 font-black">{Math.min(currentPage * cardsPerPage, filteredResources.length)}</span> of{" "}
                <span className="text-slate-800 dark:text-slate-200 font-black">{filteredResources.length}</span> modules
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-600"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 📖 MODAL 1: BILINGUAL READER MODAL WITH VERIFIED "DID YOU KNOW?" AND ACTIVITY */}
      {activeReadingResource && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center text-base shrink-0">
                  <i className={activeReadingResource.icon} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{activeReadingResource.classLevel} · {activeReadingResource.category}</span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{activeReadingResource.title}</h2>
                </div>
              </div>

              {/* Language Switcher & Close */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    onClick={() => setReaderLanguage("English")}
                    className={`px-2.5 py-1 rounded-md transition-none ${readerLanguage === "English" ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300"}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setReaderLanguage("Tamil")}
                    className={`px-2.5 py-1 rounded-md transition-none ${readerLanguage === "Tamil" ? "bg-blue-600 text-white" : "text-slate-600 dark:text-slate-300"}`}
                  >
                    தமிழ்
                  </button>
                </div>

                <button
                  onClick={() => setActiveReadingResource(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm"
                >
                  <i className="fi fi-rr-cross" />
                </button>
              </div>
            </div>

            {/* Modal Content Body - Factual Learning Passages */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
              {(readerLanguage === "English" ? activeReadingResource.contentEnglish : activeReadingResource.contentTamil).map((para, idx) => (
                <p key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {para}
                </p>
              ))}

              {/* 💡 VERIFIED "DID YOU KNOW?" FACT CARD */}
              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 mt-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-base shrink-0 font-bold">
                  <i className="fi fi-rr-bulb" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    {readerLanguage === "English" ? "Verified Fact · Did You Know?" : "சரிபார்க்கப்பட்ட தகவல் · உங்களுக்குத் தெரியுமா?"}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-200 mt-0.5">
                    {readerLanguage === "English" ? activeReadingResource.didYouKnowEnglish : activeReadingResource.didYouKnowTamil}
                  </p>
                </div>
              </div>

              {/* 🛠️ HANDS-ON LEARNING ACTIVITY CARD (Observe, Think, Reflect, Try at Home) */}
              <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-start gap-3 mt-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-base shrink-0 font-bold">
                  <i className={
                    activeReadingResource.activityType === "Try at Home" ? "fi fi-rr-home" :
                    activeReadingResource.activityType === "Observe" ? "fi fi-rr-search" :
                    activeReadingResource.activityType === "Think" ? "fi fi-rr-bulb" :
                    "fi fi-rr-edit"
                  } />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white">
                      {activeReadingResource.activityType} Activity
                    </span>
                    <h4 className="text-xs font-black text-blue-900 dark:text-blue-300">
                      {readerLanguage === "English" ? activeReadingResource.activityTitleEnglish : activeReadingResource.activityTitleTamil}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                    {readerLanguage === "English" ? activeReadingResource.activityDescEnglish : activeReadingResource.activityDescTamil}
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Language: {readerLanguage}</span>
              <button
                onClick={() => {
                  const currentRes = activeReadingResource;
                  setActiveReadingResource(null);
                  setActiveQuizResource(currentRes);
                  resetQuiz();
                }}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <i className="fi fi-rr-edit" />
                <span>Take 5-Question Quiz</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📝 MODAL 2: 5-QUESTION MCQ QUIZ MODAL */}
      {activeQuizResource && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            
            {/* Quiz Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Activity Quiz · 5 Questions</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">{activeQuizResource.title}</h2>
              </div>

              <button
                onClick={() => setActiveQuizResource(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm"
              >
                <i className="fi fi-rr-cross" />
              </button>
            </div>

            {/* Quiz Body */}
            <div className="p-5 overflow-y-auto space-y-6">
              {quizSubmitted ? (
                /* Score Summary Card */
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl text-center space-y-3 border border-slate-200 dark:border-slate-700">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto">
                    <i className="fi fi-rr-trophy" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Quiz Completed!</h3>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    Score: {calculateQuizScore()} / {activeQuizResource.quiz.length}
                  </p>
                  <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                    {calculateQuizScore() === 5 ? "Outstanding! You got all 5 questions correct." : "Good effort! Review explanations below to improve your understanding."}
                  </p>
                  <button
                    onClick={resetQuiz}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg"
                  >
                    Retake Quiz
                  </button>
                </div>
              ) : null}

              {/* Questions List */}
              {activeQuizResource.quiz.map((q, idx) => {
                const userChoice = quizAnswers[q.id];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{q.question}</p>
                        <p className="text-xs text-slate-500 font-medium">{q.questionTamil}</p>
                      </div>
                    </div>

                    {/* Options List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userChoice === optIdx;
                        let btnStyle = "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300";
                          } else if (isSelected) {
                            btnStyle = "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300";
                          }
                        } else if (isSelected) {
                          btnStyle = "bg-blue-600 text-white border-blue-600";
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectQuizOption(q.id, optIdx)}
                            disabled={quizSubmitted}
                            className={`p-2.5 rounded-lg text-xs font-bold text-left border transition-none flex flex-col gap-0.5 ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            <span className="text-[10px] opacity-80">{q.optionsTamil[optIdx]}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if submitted */}
                    {quizSubmitted && (
                      <div className={`p-2.5 rounded-lg text-xs font-semibold border ${isCorrect ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                        <p><strong>Explanation:</strong> {q.explanation}</p>
                        <p className="text-[11px] opacity-90">{q.explanationTamil}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Footer */}
            {!quizSubmitted && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">
                  Answered {Object.keys(quizAnswers).length} of {activeQuizResource.quiz.length}
                </span>
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < activeQuizResource.quiz.length}
                  className="px-4 py-2 bg-blue-600 disabled:opacity-40 text-white text-xs font-bold rounded-lg disabled:cursor-not-allowed"
                >
                  Submit Quiz Answers
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </PortalLayout>
  );
}
