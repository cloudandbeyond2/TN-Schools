"use client";

import PortalLayout from "@/components/PortalLayout";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

/* -------------------------------------------------------------------------- */
/*  Interfaces                                                                */
/* -------------------------------------------------------------------------- */

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

interface VisualScene {
  sceneNum: number;
  titleEnglish: string;
  titleTamil: string;
  textEnglish: string;
  textTamil: string;
  illustrationBg: string; // Tailwind gradient
  icon: string; // Flaticon or Lucide icon
  imageUrl?: string;
}

interface Story {
  id: string;
  classLevel: "Class 6" | "Class 7" | "Class 8";
  title: string;
  titleTamil: string;
  category: "Moral & Values" | "Panchatantra & Fables" | "Tenali Raman & Wit" | "Thirukkural & Heritage" | "Science & Curiosity";
  moralEnglish: string;
  moralTamil: string;
  readTime: string;
  language: string;
  coverGradient: string;
  icon: string;
  summaryEnglish: string;
  summaryTamil: string;
  contentEnglish: string[];
  contentTamil: string[];
  scenes: VisualScene[];
  didYouKnowEnglish: string;
  didYouKnowTamil: string;
  dailyChallengeEnglish: string;
  dailyChallengeTamil: string;
  quiz: Question[];
}

/* -------------------------------------------------------------------------- */
/*  Curated Moral & Educational Stories Dataset                               */
/* -------------------------------------------------------------------------- */

const storiesData: Story[] = [
  // ── 1. TENALI RAMAN & THE TWO THIEVES ──────────────────────────────────────
  {
    id: "story-1",
    classLevel: "Class 6",
    title: "Tenali Raman & the Two Thieves",
    titleTamil: "தெனாலிராமனும் இரு திருடர்களும்",
    category: "Tenali Raman & Wit",
    moralEnglish: "Wisdom and presence of mind can turn a threat into a blessing.",
    moralTamil: "சதுரங்கப் புத்திசாலித்தனமும் சமயோசிதப் புத்தியும் எந்த ஆபத்தையும் நன்மையாக மாற்றும்.",
    readTime: "4 mins",
    language: "Bilingual",
    coverGradient: "from-amber-500 via-orange-500 to-red-500",
    icon: "fi fi-rr-user-crown",
    summaryEnglish: "When two thieves tried to rob Tenali Raman's house at night, he outsmarted them by getting them to water his entire garden for free!",
    summaryTamil: "இரவில் தன் வீட்டைத் திருட வந்த திருடர்களைத் தெனாலிராமன் தன் தந்திரத்தால் இரவு முழுவதும் தன் தோட்டத்திற்கு நீர் பாய்ச்ச வைத்தார்!",
    contentEnglish: [
      "One warm summer night, Tenali Raman noticed two suspicious shadows hiding behind the bushes in his backyard. He realized immediately that they were thieves waiting for his family to fall asleep.",
      "Without letting the thieves know he had seen them, Tenali went inside and spoke loudly to his wife: 'My dear, thieves are roaming around Vijayanagara! Let us hide all our gold, jewels, and silver in a heavy iron box and drop it into our deep backyard well for safety.'",
      "Hearing this, the two greedy thieves rejoiced in their hiding spot. 'What luck!' they whispered. 'We don't even need to search the house. We just need to pull the box out of the well!'",
      "Tenali and his wife carried a heavy wooden chest filled with large stones and dropped it into the deep well with a loud splash. Then they went inside and pretended to sleep.",
      "The thieves rushed to the well with buckets. To reach the heavy box at the bottom, they had to draw out water bucket after bucket. They poured the water into the channels, which flowed straight into Raman's mango trees, vegetable patch, and flower garden.",
      "The thieves worked hard all night long, sweating profusely. By morning twilight, after emptying almost the entire well, they finally pulled the chest up. Opening it excitedly, they found only heavy river stones!",
      "Just then, Tenali Raman stepped out with a smile and said, 'Thank you so much, my dear friends! You watered all my plants so thoroughly. I don't need to pay a gardener today!' The embarrassed thieves ran away for their lives!"
    ],
    contentTamil: [
      "ஒரு வெப்பமான கோடை இரவில், தெனாலிராமன் தன் பின்வீட்டுப் புதரில் இரு உருவங்கள் மறைந்திருப்பதைக் கவனித்தார். அவர்கள் தன் வீட்டைத் திருட வந்த திருடர்கள் என்பதை உடனடியாகப் புரிந்துகொண்டார்.",
      "திருடர்களுக்குத் தான் பார்த்ததைக் காட்டிக் கொள்ளாமல், ராமன் வீட்டிற்குள் சென்று தன் மனைவியிடம் உரக்கக் கூறினார்: 'அன்பே, விஜயநகரத்தில் திருடர்கள் நடமாட்டம் அதிகம்! நம் நகைகளையும் தங்கத்தையும் ஒரு கனமான இரும்புப் பெட்டியில் பூட்டி, நம் தோட்டக் கிணற்றுக்குள்ளே போட்டு வைப்போம்!'",
      "புதரில் இருந்த திருடர்கள் இதைக் கேட்டு மகிழ்ச்சியடைந்தனர். 'என்ன அதிர்ஷ்டம்! வீடு முழுக்கத் தேட வேண்டியதில்லை, கிணற்றிலிருந்து பெட்டியைத் தூக்கினால் போதும்!' என எண்ணினர்.",
      "தெனாலிராமனும் அவர்தம் மனைவியும் கற்கள் நிரப்பப்பட்ட கனமான மரப்பெட்டியைத் தூக்கி கிணற்றுக்குள் 'டமார்' எனப் போட்டனர். பிறகு வீட்டிற்குள் சென்று தூங்குவது போல் நடித்தனர்.",
      "திருடர்கள் வாலிகளுடன் கிணற்றுக்கு ஓடினர். அடியில் இருக்கும் பெட்டியை எடுக்க கிணற்று நீரை வாலி வாலியாக இறைத்து ஊற்றத் தொடங்கினர். அந்த நீர் ராமனது மாமரங்களுக்கும் காய்கறித் தோட்டத்திற்கும் சென்றது.",
      "இரவு முழுவதும் திருடர்கள் வேர்வை சிந்த நீர் இறைத்தனர். விடியற்காலையில் கிணற்று நீர் வற்றியதும் பெட்டியை மேலே தூக்கித் திறந்து பார்த்தனர். அதில் வெறும் பெரிய பாறாங்கற்கள் மட்டுமே இருந்தன!",
      "அப்போது வெளியே வந்த தெனாலிராமன் சிரித்துக்கொண்டே, 'மிக்க நன்றி நண்பர்களே! என் தோட்டம் முழுமைக்கும் நீர் பாய்ச்சி விட்டீர்கள். இனி நான் தோடக்காரனுக்குக் கூலி தரத் தேவையில்லை!' என்றார். ஏமாந்த திருடர்கள் தலைதெறிக்க ஓடினர்!"
    ],
    scenes: [
      { sceneNum: 1, titleEnglish: "Shadows in the Backyard", titleTamil: "பின்வீட்டுப் புதரில் நிழல்கள்", textEnglish: "Tenali Raman spots two thieves hiding behind the bushes at midnight.", textTamil: "நள்ளிரவில் தன் வீட்டுப் புதரில் இரு திருடர்கள் மறைந்திருப்பதை ராமன் காண்கிறார்.", illustrationBg: "from-indigo-900 to-slate-900", icon: "fi fi-rr-eye", imageUrl: "/stories/tenali_raman_thieves_1.jpg" },
      { sceneNum: 2, titleEnglish: "The Master Plan", titleTamil: "ராமனது தந்திரத் திட்டம்", textEnglish: "Raman loudly announces hiding his treasure box inside the deep backyard well.", textTamil: "தன் நகைப் பெட்டியைக் கிணற்றில் மறைப்பதாக ராமன் மனைவியிடம் உரக்கக் கூறுகிறார்.", illustrationBg: "from-amber-700 to-yellow-900", icon: "fi fi-rr-comment-alt", imageUrl: "/stories/tenali_raman_thieves_2.jpg" },
      { sceneNum: 3, titleEnglish: "Watering the Garden All Night", titleTamil: "இரவு முழுவதும் நீர் இறைத்தல்", textEnglish: "The greedy thieves empty buckets of water into Raman's dry garden channels.", textTamil: "திருடர்கள் ஆசையுடன் கிணற்று நீரை வாலி வாலியாக இறைத்துத் தோட்டத்திற்குப் பாய்ச்சுகின்றனர்.", illustrationBg: "from-blue-800 to-cyan-900", icon: "fi fi-rr-water", imageUrl: "/stories/tenali_raman_thieves_3.jpg" },
      { sceneNum: 4, titleEnglish: "The Big Reveal", titleTamil: "பெட்டியில் இருந்தது என்ன?", textEnglish: "Opening the chest, they find heavy stones! Raman thanks them for watering his garden.", textTamil: "பெட்டியில் வெறும் கற்கள்! ராமன் அவர்களுக்கு நன்றி கூற, திருடர்கள் ஓட்டம் பிடிக்கின்றனர்.", illustrationBg: "from-emerald-800 to-teal-900", icon: "fi fi-rr-laugh", imageUrl: "/stories/tenali_raman_thieves_4.jpg" }
    ],
    didYouKnowEnglish: "Tenali Ramakrishna was one of the Ashtadiggajas (eight great poets) in the court of Emperor Krishnadevaraya of the Vijayanagara Empire!",
    didYouKnowTamil: "தெனாலி ராமகிருஷ்ணன் விஜயநகரப் பேரரசர் கிருஷ்ணதேவராயரின் அவையில் இருந்த 'அஷ்டதிக்கஜங்கள்' எனும் எட்டுப் பெருங்கவிஞர்களில் ஒருவர்!",
    dailyChallengeEnglish: "When faced with a tough problem today, pause for 30 seconds to think of a calm, clever solution instead of panicking.",
    dailyChallengeTamil: "இன்று ஏதேனும் சிக்கல் வந்தால், பதற்றப்படாமல் 30 நொடிகள் அமைதியாக யோசித்து ஒரு புதிய தீர்வை யோசியுங்கள்.",
    quiz: [
      { id: 1, question: "Why did Tenali Raman announce putting the treasure in the well?", questionTamil: "தெனாலிராமன் தன் நகைப் பெட்டியைக் கிணற்றில் போடுவதாக ஏன் உரக்கக் கூறினார்?", options: ["To trick thieves into emptying his well & watering plants", "Because he forgot his locker key", "To throw away old clothes", "To clean the well"], optionsTamil: ["திருடர்களைக் கொண்டு கிணற்று நீரை இறைத்துத் தோட்டத்திற்குப் பாய்ச்ச", "சாவியைத் தொலைத்ததால்", "பழைய துணிகளை வீச", "கிணற்றைச் சுத்தம் செய்ய"], correctIndex: 0, explanation: "Raman tricked the thieves into watering his garden all night.", explanationTamil: "ராமன் தன் புத்திசாலித்தனத்தால் திருடர்களை நீர் இறைக்க வைத்தார்." },
      { id: 2, question: "What was actually inside the heavy box dropped into the well?", questionTamil: "கிணற்றில் போடப்பட்ட கனமான பெட்டிக்குள் உண்மையிலேயே என்ன இருந்தது?", options: ["Heavy stones & rocks", "Gold coins", "Diamonds", "Water"], optionsTamil: ["கனமான பாறாங்கற்கள்", "தங்க நாணயங்கள்", "வைரங்கள்", "தண்ணீர்"], correctIndex: 0, explanation: "Raman filled the wooden chest with heavy stones.", explanationTamil: "ராமன் பெட்டியில் பாறாங்கற்களை அடைத்து வைத்தார்." },
      { id: 3, question: "What is the moral of this Tenali Raman story?", questionTamil: "இந்தக் கதையின் முதன்மை நீதி என்ன?", options: ["Presence of mind & wit can overcome any danger", "Never plant trees", "Always lock doors with gold", "Running fast is key"], optionsTamil: ["சமையோசிதப் புத்தி எந்த ஆபத்தையும் நன்மையாக மாற்றும்", "மரம் நடக்கூடாது", "தங்கத்தால் பூட்ட வேண்டும்", "வேகமாக ஓட வேண்டும்"], correctIndex: 0, explanation: "Smart thinking turns a robbery attempt into garden help.", explanationTamil: "புத்தி கூர்மையால் ஆபத்தைச் சாதகமாக மாற்றலாம்." }
    ]
  },

  // ── 2. THE WEAVER'S PATIENCE (THIRUKKURAL STORY) ──────────────────────────
  {
    id: "story-2",
    classLevel: "Class 7",
    title: "The Weaver's Patience (Thirukkural Moral)",
    titleTamil: "நெசவாளியின் பொறுமை (திருக்குறள் கதை)",
    category: "Thirukkural & Heritage",
    moralEnglish: "Patience and humility extinguish anger just as water extinguishes fire (Poraiyudaimai).",
    moralTamil: "பொறுமையும் அடக்கமும் கோபத்தை நீர் போல் தணித்து எதிரியையும் நண்பனாக்கும் (பொறையுடைமை).",
    readTime: "5 mins",
    language: "Bilingual",
    coverGradient: "from-emerald-500 via-teal-500 to-cyan-600",
    icon: "fi fi-rr-scroll",
    summaryEnglish: "Saint Thiruvalluvar teaches a arrogant young man the power of patience after the man ruins a finest silk saree thread by thread.",
    summaryTamil: "ஒரு ஆணவமிக்க இளைஞன் பட்டுப் புடவையை நூல் நூலாகக் கிழித்த போதும், திருவள்ளுவர் காட்டிய பொறுமை அவனை நல்வழிப்படுத்தியது!",
    contentEnglish: [
      "In the ancient town of Mylapore, Saint Thiruvalluvar earned his living by weaving fine cotton and silk fabrics. He was revered across Tamil Nadu not only for his wisdom but also for his unshakeable calm and patience.",
      "A wealthy, arrogant young man wanted to test Thiruvalluvar's patience. He thought, 'Everyone praises this weaver for never getting angry. Let me see if I can make him burst in rage!'",
      "The young man walked up to Thiruvalluvar's loom, picked up a beautifully woven saree, and asked haughtily, 'What is the price of this saree?' Thiruvalluvar replied gently, 'Two gold coins, my son.'",
      "The young man immediately tore the saree into two pieces! Holding one half, he sneered, 'Now what is the price of this half?' Thiruvalluvar smiled peacefully and said, 'One gold coin.'",
      "Surprised that the weaver showed no anger, the young man tore the cloth into smaller and smaller rags until it was completely ruined. 'And now?' he challenged.",
      "Thiruvalluvar calmly replied, 'My son, now it is useless rags and has no price. But think of the farmer who grew the cotton, the spinner who made the thread, and the weaver who labored for days. Their hard work was wasted today.'",
      "Overcome with shame and remorse, the young man fell at Thiruvalluvar's feet. He realized that true strength lies not in anger, but in supreme self-control and patience."
    ],
    contentTamil: [
      "பண்டைய மயிலாப்பூரில் திருவள்ளுவர் நெசவுத் தொழில் செய்து வாழ்ந்து வந்தார். அவரது ஞானத்திற்காக மட்டுமன்றி, எத்தகைய நிலையிலும் கோபப்படாத ஒப்பற்ற பொறுமைக்காகவும் மக்கள் அவரைப் போற்றினர்.",
      "ஒரு பணக்கார இளைஞன் வள்ளுவரின் பொறுமையைச் சோதிக்க விரும்பினான். 'இவர் ஒருபோதும் கோபப்படுவதில்லை என்று அனைவரும் கூறுகிறார்கள். இவரை எப்படியாவது கோபப்பட வைக்கிறேன்!' எனச் சூளுரைத்தான்.",
      "அவன் வள்ளுவரின் நெசவுக்கூடத்திற்குச் சென்று, அழகாக நெய்யப்பட்ட ஒரு பட்டுப் புடவையை எடுத்து, 'இந்தச் சேலையின் விலை என்ன?' எனக் கர்வம் பொங்கக் கேட்டான். வள்ளுவர் புன்னகையுடன், 'இரண்டு பொற்காசுகள், மகனே' என்றார்.",
      "அந்த இளைஞன் உடனே அந்தச் சேலையை இரண்டாகக் கிழித்தான்! ஒரு பாதியை ஏளனமாக உயர்த்திக் காட்டி, 'இப்போது இந்த பாதியின் விலை என்ன?' என்றான். வள்ளுவர் அமைதியாக, 'ஒரு பொற்காசு' என்றார்.",
      "வள்ளுவரிடம் கோபத்தின் அறிகுறியே இல்லாததைக் கண்டு வியந்த இளைஞன், அந்தத் துணியைச் சிறு சிறு துண்டுகளாகக் கிழித்து வீணடித்தான். 'இப்போது இதன் விலை என்ன?' என மார்தட்டினான்.",
      "வள்ளுவர் கனிவோடு, 'மகனே, இப்போது இது வீணான கந்தல். இதற்கு விலையில்லை. ஆனால் பஞ்சை வளர்த்த விவசாயி, நூலாக நோற்ற தொழிலாளி, நெய்த நெசவாளி ஆகியோரின் உழைப்பை யோசித்துப் பார். அது இன்று வீணாகிவிட்டது' என்றார்.",
      "தன் தவறையும் கர்வத்தையும் உணர்ந்த இளைஞன் வெட்கித் தலைகுனிந்து வள்ளுவரின் கால்களில் விழுந்து மன்னிப்புக் கேட்டான். உண்மையான வலிமை கோபத்தில் இல்லை, சகிப்புத்தன்மையிலும் பொறுமையிலுமே உள்ளது என்பதை உணர்ந்தான்."
    ],
    scenes: [
      { sceneNum: 1, titleEnglish: "The Peaceful Weaver", titleTamil: "சாந்த குணத்து நெசவாளர்", textEnglish: "Saint Thiruvalluvar weaves fine silk fabrics in Mylapore with deep calm.", textTamil: "மயிலாப்பூரில் திருவள்ளுவர் சாந்த குணத்துடன் ஆடை நெய்கிறார்.", illustrationBg: "from-teal-800 to-slate-900", icon: "fi fi-rr-user font-bold", imageUrl: "/stories/thiruvalluvar_weaver_1.jpg" },
      { sceneNum: 2, titleEnglish: "The Arrogant Test", titleTamil: "ஆணவச் சோதனை", textEnglish: "A wealthy youth tears a fine saree in half to provoke Thiruvalluvar into anger.", textTamil: "வள்ளுவரைக் கோபமூட்ட ஒரு இளைஞன் பட்டுச் சேலையை இரண்டாகக் கிழிக்கிறான்.", illustrationBg: "from-red-900 to-rose-900", icon: "fi fi-rr-cross-circle", imageUrl: "/stories/thiruvalluvar_2.jpg" },
      { sceneNum: 3, titleEnglish: "Rags and Wisdom", titleTamil: "கந்தலும் காரிய அறிவும்", textEnglish: "Even when reduced to rags, Thiruvalluvar gently explains the value of human labor.", textTamil: "சேலை கந்தலான போதும், வள்ளுவர் கோபப்படாமல் உழைப்பின் மதிப்பைக் கற்பிக்கிறார்.", illustrationBg: "from-amber-800 to-orange-900", icon: "fi fi-rr-heart", imageUrl: "/stories/thiruvalluvar_3.jpg" },
      { sceneNum: 4, titleEnglish: "Transformation of Heart", titleTamil: "மனமாற்றம்", textEnglish: "The young man surrenders his ego and learns the Thirukkural teaching of patience.", textTamil: "இளைஞன் தன் அகந்தையை விடுத்து வள்ளுவரின் காலடியில் விழுந்து பொறையுடைமையைக் கற்கிறான்.", illustrationBg: "from-emerald-900 to-cyan-900", icon: "fi fi-rr-sparkles", imageUrl: "/stories/thiruvalluvar_4.jpg" }
    ],
    didYouKnowEnglish: "Thirukkural contains 1,330 couplets divided into 133 chapters, covering Virtue (Aram), Wealth (Porul), and Love (Inbam)!",
    didYouKnowTamil: "திருக்குறள் 133 அதிகாரங்களில் 1,330 குறட்பாக்களைக் கொண்டு அறம், பொருள், இன்பம் என்ற மூன்று பால்களாகப் பிரிக்கப்பட்டுள்ளது!",
    dailyChallengeEnglish: "If someone gets angry with you today, respond with patience and gentle words instead of shouting back.",
    dailyChallengeTamil: "இன்று யாரேனும் உங்களிடம் கோபப்பட்டால், திருப்பி கத்தாமல் பொறுமையாகவும் கனிவாகவும் பேசுங்கள்.",
    quiz: [
      { id: 1, question: "Why did the young man tear Thiruvalluvar's silk saree?", questionTamil: "இளைஞன் திருவள்ளுவரின் பட்டுச் சேலையை ஏன் கிழித்தான்?", options: ["To test if he could make Thiruvalluvar angry", "Because the saree was dirty", "To make smaller handkerchiefs", "By accident"], optionsTamil: ["வள்ளுவரை கோபப்பட வைக்க முடியுமா எனச் சோதிக்க", "சேலை அழுக்காக இருந்ததால்", "கைக்குட்டை செய்ய", "தவறுதலாக"], correctIndex: 0, explanation: "He wanted to break Thiruvalluvar's famous calm and patience.", explanationTamil: "வள்ளுவரின் அமைதியைச் சோதிக்கவே அங்ஙனம் செய்தான்." },
      { id: 2, question: "How did Thiruvalluvar react when his hard work was ruined?", questionTamil: "தன் உழைப்பு வீணடிக்கப்பட்ட போது திருவள்ளுவர் எவ்வாறு எதிர்வினையாற்றினார்?", options: ["He remained calm and explained the value of labor", "He shouted at the youth", "He called the guards", "He cried"], optionsTamil: ["அமைதியாக இருந்து உழைப்பின் மதிப்பைக் கற்பித்தார்", "இளைஞனை நோக்கிக் கத்தினார்", "காவலர்களை அழைத்தார்", "அழுதார்"], correctIndex: 0, explanation: "He showed supreme patience (Poraiyudaimai) and gentle wisdom.", explanationTamil: "அவர் பொறையுடைமையுடன் சகிப்புத்தன்மையைக் காட்டினார்." },
      { id: 3, question: "Which Tamil virtue does this story emphasize?", questionTamil: "இந்தக் கதை உணர்த்தும் முக்கியமானத் தமிழ் அறநெறிப் பண்பு எது?", options: ["Patience & Forbearance (Poraiyudaimai)", "Greed", "Anger", "Pride"], optionsTamil: ["பொறையுடைமை (Patience & Forbearance)", "பேராசை", "கோபம்", "அகந்தை"], correctIndex: 0, explanation: "It illustrates Chapter 16 of Thirukkural: Poraiyudaimai.", explanationTamil: "திருக்குறளின் பொறையுடைமை அதிகாரத்தை இது விளக்குகிறது." }
    ]
  },

  // ── 3. THE SPARK OF CURIOSITY: YOUNG RAMAN'S PRISM ────────────────────────
  {
    id: "story-3",
    classLevel: "Class 6",
    title: "Young Raman & the Magic Prism",
    titleTamil: "சிறுவன் ராமனும் அதிசய ப்ரிஸமும்",
    category: "Science & Curiosity",
    moralEnglish: "Curiosity and asking 'Why?' lead to incredible scientific breakthroughs.",
    moralTamil: "ஆர்வத்துடன் 'ஏன், எதற்கு?' எனக் கேள்வி கேட்பதே புதிய அறிவியல் கண்டுபிடிப்புகளுக்கு அடித்தளம்.",
    readTime: "5 mins",
    language: "Bilingual",
    coverGradient: "from-blue-600 via-indigo-600 to-purple-600",
    icon: "fi fi-rr-atom",
    summaryEnglish: "Discover how young C.V. Raman's childhood curiosity about light and ocean blue eventually earned India its first Nobel Prize in Physics!",
    summaryTamil: "ஒளி மற்றும் கடலின் நீல நிறத்தைப் பற்றிச் சிறுவயதில் சி.வி. ராமன் கேட்ட கேள்விகளே இந்தியாவிற்கு இயற்பியலுக்கான முதல் நோபல் பரிசைப் பெற்றுத் தந்தன!",
    contentEnglish: [
      "In Thiruvanaikaval near Tiruchirappalli, a young boy named Venkata Raman spent hours sitting under the shade of neem trees, staring at raindrops and glass prisms.",
      "While other children played games, Raman loved holding a small glass prism up to sunlight, marvelling at how invisible white light split into a brilliant rainbow of seven colors (VIBGYOR).",
      "He asked his schoolteacher: 'Sir, why does white sunlight contain red, yellow, and blue? And why is the sky blue instead of green?' The teacher smiled and encouraged him: 'Keep asking questions, Raman! Nature reveals her secrets to those who look closely.'",
      "Years later, while sailing across the Mediterranean Sea in 1921, adult C.V. Raman looked down at the deep blue ocean water. Most scientists believed the sea only reflected the blue sky. But Raman was not satisfied with simple answers.",
      "He took out a pocket spectroscope and light filters right there on the ship deck! He proved that water molecules themselves scatter light rays, discovering the famous 'Raman Effect' on February 28, 1928.",
      "His relentless childhood curiosity brought India its first Nobel Prize in Physics in 1930. National Science Day is celebrated every year on February 28 to honor his discovery!"
    ],
    contentTamil: [
      "திருச்சிராப்பள்ளி அருகே உள்ள திருவானைக்காவலில் வெங்கட ராமன் என்ற சிறுவன் வேப்பமர நிழலில் அமர்ந்து மழைத்துளிகளையும் கண்ணாடி ப்ரிஸங்களையும் மணிநேரக் கணக்கில் உற்று நோக்குவது வழக்கம்.",
      "மற்ற சிறுவர்கள் விளையாட்டுக்களில் ஈடுபடும்போது, ராமன் கண்ணாடி ப்ரிஸத்தை சூரிய ஒளியில் பிடித்து, கண்ணுக்குத் தெரியாத வெள்ளை ஒளி ஏழு வண்ண வானவில்லாகப் (VIBGYOR) பிரிவதைக் கண்டு வியப்படைவான்.",
      "அவன் ஆசிரியரிடம், 'ஐயா, வெள்ளை ஒளியில் சிவப்பு, மஞ்சள், நீலம் எப்படி உள்ளது? வானம் ஏன் நீல நிறமாக இருக்கிறது?' எனக் கேட்பான். ஆசிரியர், 'ராமன், கேள்விகள் கேட்டுக்கொண்டே இரு! கூர்ந்து கவனிப்போருக்கு இயற்கை தன் ரகசியங்களை வெளிப்படுத்தும்' என்றார்.",
      "ஆண்டுகள் கழித்து 1921-ல் மத்திய தரைக்கடலில் கப்பலில் பயணித்த போது, ராமன் ஆழ்கடலின் நீல நிறத்தைப் பார்த்தார். பெரும்பாலான விஞ்ஞானிகள் கடல் வானத்தின் நீல நிறத்தைப் பிரதிபலிக்கிறது என எண்ணினர். ஆனால் ராமன் திருப்தியடையவில்லை.",
      "கப்பல் தளத்திலேயே தன் பாக்கெட் ஸ்பெக்ட்ரோஸ்கோப்பை எடுத்து ஆய்வு செய்தார்! நீர் மூலக்கூறுகளே ஒளியைச் சிதறடிக்கின்றன என்பதை நிரூபித்து, 1928 பிப்ரவரி 28 அன்று 'ராமன் விளைவை' (Raman Effect) கண்டுபிடித்தார்.",
      "அவரது சிறுவயது தேடலும் ஆர்வமுமே 1930-ல் இந்தியாவிற்கு இயற்பியலுக்கான முதல் நோபல் பரிசைப் பெற்றுத் தந்தன. அவரது கண்டுபிடிப்பைப் போற்றவே ஒவ்வொரு ஆண்டும் பிப்ரவரி 28 'தேசிய அறிவியல் தினமாக'க் கொண்டாடப்படுகிறது!"
    ],
    scenes: [
      { sceneNum: 1, titleEnglish: "Prism and Rainbows", titleTamil: "ப்ரிஸமும் வானவில்லும்", textEnglish: "Young Raman holds a glass prism up to sunlight, questioning how white light splits.", textTamil: "சிறுவன் ராமன் ப்ரிஸத்தைப் பிடித்து சூரிய ஒளி பிரிவதைக் கூர்ந்து கவனிக்கிறான்.", illustrationBg: "from-blue-900 to-indigo-950", icon: "fi fi-rr-sun", imageUrl: "/stories/cv_raman_1.jpg" },
      { sceneNum: 2, titleEnglish: "Voyage Across the Sea", titleTamil: "மத்திய தரைக்கடல் பயணம்", textEnglish: "On a ocean voyage in 1921, adult Raman wonders why the sea shines deep blue.", textTamil: "1921-ல் கப்பல் பயணத்தில் கடல் நீர் ஏன் ஆழமான நீல நிறத்தில் ஒளிர்கிறது என யோசிக்கிறார்.", illustrationBg: "from-cyan-900 to-blue-950", icon: "fi fi-rr-water-rise", imageUrl: "/stories/cv_raman_2.jpg" },
      { sceneNum: 3, titleEnglish: "The Raman Effect (1928)", titleTamil: "ராமன் விளைவு (1928)", textEnglish: "Using pocket instruments, he proves light scattering by liquid molecules.", textTamil: "திரவ மூலக்கூறுகளால் ஒளி சிதறடிக்கப்படுவதை ஆய்வுக் கருவிகளால் நிரூபிக்கிறார்.", illustrationBg: "from-purple-900 to-indigo-900", icon: "fi fi-rr-atom", imageUrl: "/stories/cv_raman_3.jpg" },
      { sceneNum: 4, titleEnglish: "Nobel Glory & National Science Day", titleTamil: "நோபல் பரிசும் அறிவியல் தினமும்", textEnglish: "India celebrates National Science Day on Feb 28 to honor Raman's Nobel achievement.", textTamil: "ராமனின் நோபல் சாதனைக்காகப் பிப்ரவரி 28 தேசிய அறிவியல் தினமாகக் கொண்டாடப்படுகிறது.", illustrationBg: "from-amber-800 to-yellow-900", icon: "fi fi-rr-trophy", imageUrl: "/stories/cv_raman_4.jpg" }
    ],
    didYouKnowEnglish: "February 28 is celebrated as National Science Day in India every year to mark the discovery of the Raman Effect!",
    didYouKnowTamil: "ராமன் விளைவு கண்டுபிடிக்கப்பட்ட பிப்ரவரி 28-ஆம் தேதி தான் இந்தியாவில் 'தேசிய அறிவியல் தினமாக'க் கொண்டாடப்படுகிறது!",
    dailyChallengeEnglish: "Ask your science teacher or parent 1 curious question today starting with 'Why does...?'",
    dailyChallengeTamil: "இன்று உங்கள் ஆசிரியர் அல்லது பெற்றோரிடம் 'ஏன்...?' எனத் தொடங்கும் ஒரு அறிவியல் கேள்வியைக் கேளுங்கள்.",
    quiz: [
      { id: 1, question: "What scientific phenomenon did Sir C.V. Raman discover on February 28, 1928?", questionTamil: "1928 பிப்ரவரி 28 அன்று சர் சி.வி. ராமன் கண்டுபிடித்த அறிவியல் நிகழ்வு எது?", options: ["The Raman Effect (Light Scattering)", "Gravity", "Electricity", "Steam Engine"], optionsTamil: ["ராமன் விளைவு / ஒளிச்சிதறல் (Raman Effect)", "புவியீர்ப்பு", "மின்சாரம்", "நீராவி என்ஜின்"], correctIndex: 0, explanation: "He discovered the scattering of light by liquid molecules.", explanationTamil: "திரவ மூலக்கூறுகளால் ஒளி சிதறடிக்கப்படுவதைக் கண்டுபிடித்தார்." },
      { id: 2, question: "Why is National Science Day celebrated on February 28 in India?", questionTamil: "இந்தியாவில் பிப்ரவரி 28 ஏன் தேசிய அறிவியல் தினமாகக் கொண்டாடப்படுகிறது?", options: ["To commemorate the discovery of the Raman Effect", "Raman's birthday", "Independence Day", "First rocket launch"], optionsTamil: ["ராமன் விளைவு கண்டுபிடிக்கப்பட்ட நாளாகக் கொண்டாட", "ராமனின் பிறந்த நாள்", "சுதந்திர தினம்", "முதல் ராக்கெட்"], correctIndex: 0, explanation: "It marks the historical date of the Raman Effect discovery.", explanationTamil: "ராமன் விளைவு அறியப்பட்ட வரலாற்று சிறப்புமிக்க நாள்." },
      { id: 3, question: "In which subject did C.V. Raman win India's first Nobel Prize in 1930?", questionTamil: "1930-ல் சி.வி. ராமன் எந்தத் துறையில் இந்தியாவிற்கு முதல் நோபல் பரிசைப் பெற்றார்?", options: ["Physics", "Literature", "Peace", "Economics"], optionsTamil: ["இயற்பியல் (Physics)", "இலக்கியம்", "அமைதி", "பொருளாதாரம்"], correctIndex: 0, explanation: "Sir C.V. Raman was awarded the Nobel Prize in Physics.", explanationTamil: "இயற்பியலுக்கான நோபல் பரிசு அவருக்கு வழங்கப்பட்டது." }
    ]
  },

  // ── 4. PANCHATANTRA: THE WISE JACKAL & THE DRUM ───────────────────────────
  {
    id: "story-4",
    classLevel: "Class 6",
    title: "Panchatantra: The Wise Jackal & the Drum",
    titleTamil: "பஞ்சதந்திரம்: புத்திசாலி நரியும் முரசும்",
    category: "Panchatantra & Fables",
    moralEnglish: "Do not fear the unknown; investigate with courage before acting.",
    moralTamil: "தெரியாத ஒன்றைக் கண்டு பயப்படாமல் துணிச்சலுடன் ஆராய்ந்து உண்மையை அறிய வேண்டும்.",
    readTime: "4 mins",
    language: "Bilingual",
    coverGradient: "from-purple-600 via-pink-600 to-rose-600",
    icon: "fi fi-rr-paw",
    summaryEnglish: "A hungry jackal hears a terrifying loud booming sound in the forest. Instead of fleeing in panic, he investigates and discovers a tasty feast!",
    summaryTamil: "காட்டில் எழும்பிய பயங்கரமான ஒலியைக் கேட்டு ஓடாமல், துணிச்சலுடன் ஆராய்ந்த நரிக்குப் பெரிய விருந்து காத்திருந்தது!",
    contentEnglish: [
      "Deep in a lush green forest, a hungry jackal named Gomaya was searching for food. He hadn't eaten anything for two full days and his stomach was rumbling.",
      "Suddenly, a thunderous booming sound echoed across the trees: 'Dhoom! Dhoom! Dhoom!' The forest creatures froze in terror, believing a giant monster had entered the woods.",
      "Gomaya's heart beat fast with fear. He thought, 'Should I run away and save my life?' But then he stopped and thought carefully: 'Fear makes us foolish. Before I run, I must find out what is making this sound.'",
      "Crawling stealthily behind high bushes, Gomaya crept toward the noise. He saw a strange round object lying under a tall tree. Whenever the wind blew, the branches of the tree struck against this hollow object, producing the loud 'Dhoom!' sound.",
      "It was nothing but a heavy war drum left behind by soldiers after a battle! Laughing at his own fear, the jackal examined the drum. He noticed that animals had left food stored nearby.",
      "Gomaya ate a hearty meal and felt proud that he investigated bravely instead of fleeing in blind panic!"
    ],
    contentTamil: [
      "ஒரு செழிப்பான அடர்ந்த காட்டில், கோமாயன் என்ற பசியுள்ள நரி உணவைத் தேடிக் கொண்டிருந்தது. இரண்டு நாட்களாக எதுவும் சாப்பிடாததால் அதன் வயிறு பசி தீயில் எரிந்தது.",
      "திடீரென மரங்களுக்கிடையே பயங்கரமான பேரொலி முழங்கியது: 'டூம்! டூம்! டூம்!' ஒரு பெரிய அரக்கன் காட்டிற்குள் வந்துவிட்டான் என எண்ணிக் காட்டு விலங்குகள் அச்சத்தில் உறைந்தன.",
      "கோமாயனின் இதயமும் பயத்தில் வேகமாக அடித்தது. 'நான் ஓடி உயிரைக் காப்பாற்றிக் கொள்ளவா?' என யோசித்தது. ஆனால் உடனே நிதானித்து, 'பயம் நம் அறிவைக் கெடுக்கும். ஓடுவதற்கு முன் அந்த ஒலி எங்ஙனம் உருவாகிறது என ஆராய வேண்டும்' என எண்ணியது.",
      "புதர்களுக்குப் பின்னால் மெதுவாக ஊர்ந்து ஒலி வந்த திசையை நோக்கிச் சென்றது. ஒரு உயரமான மரத்தின் அடியில் ஒரு விசித்திரமான உருண்டை வடிவம் கிடப்பதைக் கண்டது. காற்று வீசும்போது மரக்கிளைகள் அந்த முரசில் மோதி 'டூம்!' எனச் சத்தமிட்டன.",
      "அது போர்க்களத்தில் படைவீரர்கள் விட்டுச் சென்ற ஒரு போர் முரசு மட்டுமே! தன் பயத்தைக் கண்டு சிரித்த நரி, முரசின் அருகே வீரர்கள் விட்டுச் சென்ற சுவையான உணவைக் கண்டது.",
      "கோமாயன் வயிறார உண்டு மகிழ்ந்தது. குருட்டுத்தனமாகப் பயந்து ஓடாமல் துணிவுடன் ஆராய்ந்த தன் முடிவைக் குறித்துப் பெருமிதம் கொண்டது!"
    ],
    scenes: [
      { sceneNum: 1, titleEnglish: "Booming Thunder", titleTamil: "காட்டில் பயங்கர ஒலி", textEnglish: "A loud 'Dhoom!' sound frightens all animals in the deep forest.", textTamil: "காட்டில் 'டூம்!' எனும் பேரொலி கேட்டு விலங்குகள் பயந்து நடுங்குகின்றன.", illustrationBg: "from-purple-950 to-slate-900", icon: "fi fi-rr-volume", imageUrl: "/stories/panchatantra_1.jpg" },
      { sceneNum: 2, titleEnglish: "Courage Over Fear", titleTamil: "பயத்தை வென்ற துணிவு", textEnglish: "The hungry jackal decides to investigate the source of the noise rather than fleeing.", textTamil: "பயந்து ஓடாமல் ஒலியின் மூலத்தை ஆராய நரி துணிகிறது.", illustrationBg: "from-indigo-900 to-purple-900", icon: "fi fi-rr-search", imageUrl: "/stories/panchatantra_2.jpg" },
      { sceneNum: 3, titleEnglish: "The War Drum", titleTamil: "மரக்கிளையும் போர் முரசும்", textEnglish: "Wind branches were simply hitting an abandoned war drum under a tree.", textTamil: "காற்று வீசும்போது மரக்கிளைகள் போர் முரசில் மோதுவதைக் காண்கிறது.", illustrationBg: "from-rose-900 to-pink-950", icon: "fi fi-rr-music", imageUrl: "/stories/panchatantra_3.jpg" },
      { sceneNum: 4, titleEnglish: "A Rewarding Feast", titleTamil: "சுவையான உணவு", textEnglish: "The jackal enjoys a hearty feast left near the drum.", textTamil: "முரசின் அருகே இருந்த உணவை நரி வயிறார சாப்பிடுகிறது.", illustrationBg: "from-emerald-900 to-teal-900", icon: "fi fi-rr-smile", imageUrl: "/stories/panchatantra_4.jpg" }
    ],
    didYouKnowEnglish: "The Panchatantra stories were written over 2,000 years ago by Pandit Vishnu Sharma to teach princes statesmanship and wisdom!",
    didYouKnowTamil: "பஞ்சதந்திரக் கதைகள் 2,000 ஆண்டுகளுக்கு முன் பண்டிதர் விஷ்ணு சர்மாவால் இளவரசர்களுக்கு ராஜதந்திரத்தையும் அறிவையும் புகட்ட எழுதப்பட்டவை!",
    dailyChallengeEnglish: "If you hear a strange rumor or scary story today, don't believe it immediately; check the facts first!",
    dailyChallengeTamil: "இன்று ஏதேனும் வதந்தி அல்லது பயமுறுத்தும் கதையைக் கேட்டால், உடனடியாக நம்பாமல் உண்மையைச் சரிபார்க்கவும்!",
    quiz: [
      { id: 1, question: "What was making the loud booming 'Dhoom!' sound in the forest?", questionTamil: "காட்டில் 'டூம்!' எனப் பேரொலி எழுப்பியது எது?", options: ["Wind blowing tree branches against an old war drum", "A giant monster", "A lion roaring", "A thunderstorm"], optionsTamil: ["போர் முரசில் மரக்கிளைகள் காற்றில் மோதியது", "ஒரு அரக்கன்", "சிங்கத்தின் கர்ஜனை", "இடி மின்னல்"], correctIndex: 0, explanation: "It was an abandoned war drum hit by swaying tree branches.", explanationTamil: "காற்றில் மரக்கிளைகள் முரசில் மோதியதால் ஒலி எழுந்தது." },
      { id: 2, question: "What did the jackal do when he heard the scary noise?", questionTamil: "பயங்கர ஒலியைக் கேட்டபோது நரி என்ன செய்தது?", options: ["He investigated bravely to find the truth", "He ran out of the forest", "He hid under a rock forever", "He cried out for help"], optionsTamil: ["துணிச்சலுடன் சென்று உண்மையை ஆராய்ந்தது", "காட்டை விட்டு ஓடியது", "பாறையின் அடியில் மறைந்தது", "அழுது கூச்சலிட்டது"], correctIndex: 0, explanation: "He controlled his fear and investigated carefully.", explanationTamil: "பயத்தைக் கட்டுப்படுத்தி துணிவுடன் ஆராய்ந்தது." },
      { id: 3, question: "What moral does this Panchatantra fable teach?", questionTamil: "இந்த பஞ்சதந்திரக் கதை உணர்த்தும் நீதி என்ன?", options: ["Investigate the unknown with courage instead of fearing blindly", "Always run away from drums", "Never eat in forests", "Drums are monsters"], optionsTamil: ["குருட்டுத்தனமாகப் பயப்படாமல் துணிச்சலுடன் ஆராய வேண்டும்", "முரசைக் கண்டால் ஓட வேண்டும்", "காட்டில் சாப்பிடக் கூடாது", "முரசு ஒரு அரக்கன்"], correctIndex: 0, explanation: "Courageous investigation overcomes imaginary fears.", explanationTamil: "துணிச்சலான ஆராய்ச்சி பயத்தை நீக்கும்." }
    ]
  },

  // ── 5. KALAM & THE FALLEN BIRD ─────────────────────────────────────────────
  {
    id: "story-5",
    classLevel: "Class 8",
    title: "Young Kalam & the Fallen Bird",
    titleTamil: "சிறுவன் கலாமும் அடிபட்ட குருவியும்",
    category: "Moral & Values",
    moralEnglish: "Compassion towards all living beings elevates the human spirit.",
    moralTamil: "எல்லா உயிர்களிடத்தும் காட்டும் கருணையே மனித ஆன்மாவை உயர்த்தும் ஒப்பற்ற பண்பு.",
    readTime: "5 mins",
    language: "Bilingual",
    coverGradient: "from-teal-600 via-emerald-600 to-green-700",
    icon: "fi fi-rr-feather",
    summaryEnglish: "How a childhood act of rescuing a injured sparrow shaped Dr. A.P.J. Abdul Kalam's lifelong empathy and dedication to humanity.",
    summaryTamil: "சிறுவயதில் காயமடைந்த குருவியைக் காப்பாற்றிய சம்பவம் எவ்வாறு அப்துல் கலாமின் நெஞ்சில் வாழ்நாள் கருணையை விதைத்தது!",
    contentEnglish: [
      "In the coastal town of Rameswaram, young Abdul Kalam walked to school every morning along sandy coconut groves. He loved observing seabirds soaring high above the blue waves of the ocean.",
      "One stormy afternoon, after heavy rain, Kalam found a tiny baby sparrow lying helpless on the wet muddy ground. Its tiny wing was injured by a fallen twig, and it was shivering cold.",
      "While other boys ran past to play football, Kalam gently scooped up the shivering bird in his small hands. He dried its feathers with his cotton shirt and brought it home.",
      "His father, Jainulabdeen, helped Kalam build a cozy nest out of clean cotton and twigs in their veranda. Kalam fed the tiny bird drops of water and soft grain for five days, nursing its wing.",
      "On the sixth morning, the sparrow chirped happily, fluttered its healed wings, and flew high up into the blue sky. Kalam's eyes filled with tears of joy.",
      "His father placed a loving hand on Kalam's shoulder and said, 'My son, true greatness is not measured by how high you fly, but by how gently you lift up those who have fallen.'",
      "Kalam remembered this lesson forever. Throughout his life as a rocket scientist and President of India, he remained known for his humbleness and deep compassion for every human being."
    ],
    contentTamil: [
      "ராமேஸ்வரம் கடற்கரை நகரில், சிறுவன் அப்துல் கலாம் தினமும் காலையில் தென்னந்தோப்புகள் வழியே பள்ளிக்கு நடந்து செல்வான். நீலக் கடல் அலைகளின் மேல் உயரே பறக்கும் கடற்பறவைகளைக் கண்டு ரசிப்பான்.",
      "ஒரு மழைக்கால மாலையில், கனமழைக்குப் பிறகு, கலாம் சேறும் சகதியுமான தரையில் ஒரு சிறிய சிட்டுக்குருவி அடிபட்டுக்கிடப்பதைக் கண்டான். ஒரு உடைந்த கிளையால் அதன் சிறகு காயமடைந்து குளிரில் நடுங்கிக் கொண்டிருந்தது.",
      "மற்ற சிறுவர்கள் கால்பந்து விளையாட ஓடிய போது, கலாம் தன் சிறிய கைகளில் அந்த நடுங்கும் குருவியை மென்மையாக ஏந்தினான். தன் பருத்திச் சட்டையால் அதன் இறகுகளைத் துடைத்து வீட்டிற்குத் தூக்கி வந்தான்.",
      "அவரது தந்தை ஜைனுலாப்தீன் கலாமுக்கு உதவி செய்து, திண்ணையில் பருத்தி மற்றும் குச்சிகளால் ஒரு கதகதப்பான கூட்டை அமைத்தார். கலாம் ஐந்து நாட்களாக அந்தச் சிறிய பறவைக்குத் தண்ணீர்த்துளிகளையும் தானியங்களையும் ஊட்டிப் பராமரித்தான்.",
      "ஆறாவது நாள் காலையில், குருவி மகிழ்ச்சியுடன் கீச்சிட்டு, குணமாகிய இறகுகளை விரித்து நீல வானத்தில் உயரே பறந்தது. கலாமின் கண்கள் ஆனந்தக் கண்ணீரால் நிறைந்தன.",
      "அவரது தந்தை கலாமின் தோளைத் தொட்டு, 'என் மகனே, உண்மையான பெருமை நீ எவ்வளவு உயரத்தில் பறக்கிறாய் என்பதில் இல்லை; கீழே விழுந்தவர்களை நீ எவ்வளவு கனிவோடு தூக்கி நிறுத்துகிறாய் என்பதில்தான் உள்ளது' என்றார்.",
      "கலாம் இந்த வாழ்வியல் பாடத்தை என்றென்றும் நினைவில் கொண்டார். விண்வெளி விஞ்ஞானியாகவும் இந்தியக் குடியரசுத் தலைவராகவும் உயர்ந்த போதும், ஒவ்வொரு மனிதரிடமும் அவர் காட்டிய கனிவும் எளிமையுமே அவரை உலகப் புகழடைச் செய்தன!"
    ],
    scenes: [
      { sceneNum: 1, titleEnglish: "Stormy Afternoon", titleTamil: "மழைக்கால மாலை", textEnglish: "Young Kalam finds an injured baby sparrow shivering in wet mud after heavy rain.", textTamil: "கனமழைக்குப் பின் சேற்றில் அடிபட்டு நடுங்கும் சிட்டுக்குருவியை கலாம் காண்கிறான்.", illustrationBg: "from-slate-900 to-teal-950", icon: "fi fi-rr-cloud-rain", imageUrl: "/stories/kalam_1.jpg" },
      { sceneNum: 2, titleEnglish: "Gentle Hands of Care", titleTamil: "கனிவான கைகள்", textEnglish: "Kalam dries the bird with his shirt and brings it home to nurse its wing.", textTamil: "தன் சட்டையால் குருவியைத் துடைத்து வீட்டிற்குத் தூக்கி வந்து பராமரிக்கிறான்.", illustrationBg: "from-teal-900 to-emerald-950", icon: "fi fi-rr-heart font-bold", imageUrl: "/stories/kalam_2.jpg" },
      { sceneNum: 3, titleEnglish: "Taking Flight Again", titleTamil: "மீண்டும் வானில் சிறகடித்தல்", textEnglish: "After 5 days of care, the healed sparrow chirps happily and flies high into the sky.", textTamil: "5 நாட்கள் பராமரிப்பிற்குப் பின் குருவி குணமடைந்து வானில் பறக்கிறது.", illustrationBg: "from-sky-800 to-teal-900", icon: "fi fi-rr-paper-plane", imageUrl: "/stories/kalam_3.jpg" },
      { sceneNum: 4, titleEnglish: "Father's Immortal Wisdom", titleTamil: "தந்தையின் பொன்மொழி", textEnglish: "'Greatness is lifting up those who have fallen.' Kalam carried this lesson forever.", textTamil: "'விழுந்தவர்களைத் தூக்கி நிறுத்துவதே பெருமை.' கலாம் இதனை வாழ்நாள் பாடமாகக் கொண்டார்.", illustrationBg: "from-amber-800 to-yellow-900", icon: "fi fi-rr-sun", imageUrl: "/stories/kalam_4.jpg" }
    ],
    didYouKnowEnglish: "Dr. A.P.J. Abdul Kalam spent over 70% of his time after his presidency travelling to schools and colleges, interacting with over 20 million students!",
    didYouKnowTamil: "டாக்டர் கலாம் குடியரசுத் தலைவர் பதவிக்குப் பிறகும் தன் நேரத்தின் 70% மேல் பள்ளி கல்லூரிகளுக்குச் சென்று 2 கோடிக்கும் அதிகமான மாணவர்களுடன் கலந்துரையாடினார்!",
    dailyChallengeEnglish: "Show kindness to an animal or help a classmate who is struggling with studies today.",
    dailyChallengeTamil: "இன்று ஏதேனும் ஒரு விலங்கிற்கு அன்பைக் காட்டுங்கள் அல்லது படிப்பதில் சிரமப்படும் வகுப்பறை நண்பனுக்கு உதவுங்கள்.",
    quiz: [
      { id: 1, question: "What did young Kalam find on the muddy ground after the rain?", questionTamil: "மழைக்குப் பின் சேற்றுத் தரையில் சிறுவன் கலாம் கண்டது என்ன?", options: ["An injured baby sparrow", "A lost wallet", "A cricket ball", "A gold ring"], optionsTamil: ["அடிபட்ட சிறிய சிட்டுக்குருவி", "தொலைந்த பணப்பை", "கிரிக்கெட் பந்து", "தங்க மோதிரம்"], correctIndex: 0, explanation: "He found an injured baby sparrow shivering in the mud.", explanationTamil: "அடிபட்டு நடுங்கிய சிட்டுக்குருவியைக் கண்டான்." },
      { id: 2, question: "What wisdom did Kalam's father teach him after the bird flew away?", questionTamil: "குருவி பறந்த பிறகு கலாமின் தந்தை கற்பித்த பொன்மொழி என்ன?", options: ["True greatness is lifting up those who have fallen", "Birds are dangerous", "Always catch wild animals", "Never dry clothes"], optionsTamil: ["விழுந்தவர்களைக் கனிவோடு தூக்கி நிறுத்துவதே உண்மையான பெருமை", "பறவைகள் ஆபத்தானவை", "விலங்குகளைப் பிடிக்க வேண்டும்", "துணிகளைக் காய வைக்கக் கூடாது"], correctIndex: 0, explanation: "His father taught him that helping the fallen defines true greatness.", explanationTamil: "எளியோருக்கு உதவுவதே பெருமை எனக் கற்பித்தார்." },
      { id: 3, question: "What core value does this story highlight from Dr. Kalam's life?", questionTamil: "டாக்டர் கலாமின் வாழ்க்கையிலிருந்து இந்தக் கதை உணர்த்தும் முதன்மைப் பண்பு எது?", options: ["Compassion and Empathy towards all living beings", "Greed for money", "Fame", "Pride"], optionsTamil: ["எல்லா உயிர்களிடத்தும் காட்டும் கருணையும் இரக்கமும் (Compassion)", "பண ஆசை", "புகழ் ஆசை", "அகந்தை"], correctIndex: 0, explanation: "It demonstrates how compassion shapes human nobility.", explanationTamil: "கருணையே மனித நேயத்தின் உச்சம் என்பதை உணர்த்துகிறது." }
    ]
  }
];

/* -------------------------------------------------------------------------- */
/*  Scene Illustration Art Generator Component                                */
/* -------------------------------------------------------------------------- */

function SceneIllustrationArt({ storyId, sceneNum, titleEnglish, titleTamil, icon, bgGradient }: {
  storyId: string;
  sceneNum: number;
  titleEnglish: string;
  titleTamil: string;
  icon: string;
  bgGradient: string;
}) {
  // 1. C.V. Raman - Prism Rainbow (story-3, scene 1)
  if (storyId === "story-3" && sceneNum === 1) {
    return (
      <div className="relative w-full h-full bg-slate-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-1 bg-white/80 rotate-45 origin-top-left shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
        <div className="relative z-10 w-24 h-24 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
            <polygon points="50,15 90,85 10,85" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2.5" />
          </svg>
        </div>
        <div className="w-full max-w-xs h-5 mt-3 flex rounded-full overflow-hidden shadow-lg border border-white/20 animate-pulse">
          <div className="flex-1 bg-purple-600" />
          <div className="flex-1 bg-indigo-600" />
          <div className="flex-1 bg-blue-500" />
          <div className="flex-1 bg-emerald-500" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-orange-500" />
          <div className="flex-1 bg-red-600" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white mt-3 drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 2. C.V. Raman - Ocean Voyage (story-3, scene 2)
  if (storyId === "story-3" && sceneNum === 2) {
    return (
      <div className="relative w-full h-full bg-gradient-to-b from-indigo-950 via-blue-950 to-slate-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 w-16 h-16 text-sky-300 mb-2 animate-bounce">
          <i className="fi fi-rr-water-rise text-5xl" />
        </div>
        <div className="w-48 h-8 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 opacity-60 rounded-full blur-md" />
        <h4 className="text-base sm:text-lg font-bold text-white mt-2 drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 3. C.V. Raman - Spectroscope & Light Scattering (story-3, scene 3)
  if (storyId === "story-3" && sceneNum === 3) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 w-20 h-20 rounded-full border-2 border-purple-400/40 flex items-center justify-center animate-spin" style={{ animationDuration: "10s" }}>
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400/50 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-amber-400 shadow-[0_0_15px_#f59e0b]" />
          </div>
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white mt-3 drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 4. C.V. Raman - Nobel Prize Glory (story-3, scene 4)
  if (storyId === "story-3" && sceneNum === 4) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center justify-center mb-2 animate-pulse">
          <div className="w-full h-full rounded-full border-2 border-amber-800 flex items-center justify-center">
            <i className="fi fi-rr-trophy text-amber-950 text-2xl font-bold" />
          </div>
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 5. Panchatantra - Thunder Noise in Forest (story-4, scene 1)
  if (storyId === "story-4" && sceneNum === 1) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-purple-950 via-slate-950 to-emerald-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute w-32 h-32 rounded-full border-2 border-amber-500/30 animate-ping" />
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl mb-2 shadow-lg">
          <i className="fi fi-rr-volume text-3xl" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 6. Panchatantra - Stealthy Jackal (story-4, scene 2)
  if (storyId === "story-4" && sceneNum === 2) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-green-950 via-teal-950 to-slate-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 flex items-center gap-4 text-emerald-400 mb-2">
          <i className="fi fi-rr-leaf text-3xl" />
          <i className="fi fi-rr-paw text-4xl text-amber-400 animate-bounce" />
          <i className="fi fi-rr-leaf text-3xl" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 7. Panchatantra - The War Drum under Banyan Tree (story-4, scene 3)
  if (storyId === "story-4" && sceneNum === 3) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-amber-950 via-rose-950 to-slate-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-b from-amber-700 to-amber-900 border-4 border-amber-500 shadow-xl flex items-center justify-center mb-2">
          <i className="fi fi-rr-music text-amber-200 text-3xl" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 8. Panchatantra - Feast & Victory (story-4, scene 4)
  if (storyId === "story-4" && sceneNum === 4) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl mb-2 shadow-lg">
          <i className="fi fi-rr-smile text-3xl" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 9. Kalam - Stormy Afternoon & Fallen Bird (story-5, scene 1)
  if (storyId === "story-5" && sceneNum === 1) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 w-16 h-16 text-teal-400 mb-2 animate-bounce">
          <i className="fi fi-rr-cloud-rain text-4xl" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 10. Kalam - Gentle Hands (story-5, scene 2)
  if (storyId === "story-5" && sceneNum === 2) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-3xl mb-2 shadow-lg">
          <i className="fi fi-rr-heart text-3xl" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 11. Kalam - Bird Flying High (story-5, scene 3)
  if (storyId === "story-5" && sceneNum === 3) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-sky-900 via-blue-950 to-teal-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 w-16 h-16 text-amber-400 mb-2 animate-bounce">
          <i className="fi fi-rr-paper-plane text-4xl" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // 12. Kalam - Father's Wisdom (story-5, scene 4)
  if (storyId === "story-5" && sceneNum === 4) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="relative z-10 w-16 h-16 text-yellow-400 mb-2 animate-pulse">
          <i className="fi fi-rr-sun text-4xl" />
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white drop-shadow">{titleEnglish}</h4>
        <p className="text-xs text-amber-300 font-medium">{titleTamil}</p>
      </div>
    );
  }

  // Default Fallback Scene Graphic Card
  return (
    <div className={`w-full h-full bg-gradient-to-br ${bgGradient} p-6 flex flex-col items-center justify-center text-center overflow-hidden`}>
      <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl mb-3 shadow-lg border border-white/20 animate-bounce">
        <i className={icon} />
      </div>
      <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
        {titleEnglish}
      </h4>
      <p className="text-xs sm:text-sm text-amber-300 font-medium mt-1">
        {titleTamil}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Digital Story Realm Component                                         */
/* -------------------------------------------------------------------------- */

export default function RedesignedDigitalLibraryPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;

  // Grade Standard locking logic
  const studentStandard = useMemo(() => {
    let text = `${sessionUser?.class || ''} ${sessionUser?.grade || ''} ${sessionUser?.name || ''} `.toLowerCase();
    if (text.includes("8") || text.includes("viii")) return "Class 8";
    if (text.includes("7") || text.includes("vii")) return "Class 7";
    if (text.includes("6") || text.includes("vi")) return "Class 6";
    return "Class 6";
  }, [sessionUser]);

  // Filters State
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("Class 6");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (studentStandard) {
      setSelectedClassFilter(studentStandard);
    }
  }, [studentStandard]);

  // Modals State
  const [activeReadingStory, setActiveReadingStory] = useState<Story | null>(null);
  const [activeWatchStory, setActiveWatchStory] = useState<Story | null>(null);
  const [activeQuizStory, setActiveQuizStory] = useState<Story | null>(null);

  // Reader Language Toggle
  const [readerLanguage, setReaderLanguage] = useState<"English" | "Tamil">("English");

  // Speech Synthesizer Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Watch Theater Scene Index
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Speech Synthesis Control
  const toggleSpeechAudio = (textToRead: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech audio narration is not supported in your browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel(); // Clear queue
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.lang = readerLanguage === "Tamil" ? "ta-IN" : "en-US";

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Clean speech when reader modal closes
  const handleCloseReader = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveReadingStory(null);
  };

  // Filtered Stories Calculation
  const filteredStories = useMemo(() => {
    return storiesData.filter(st => {
      if (st.classLevel !== selectedClassFilter) return false;
      if (selectedCategoryFilter !== "All Categories" && st.category !== selectedCategoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullText = `${st.title} ${st.titleTamil} ${st.moralEnglish} ${st.moralTamil} ${st.summaryEnglish}`.toLowerCase();
        if (!fullText.includes(q)) return false;
      }
      return true;
    });
  }, [selectedClassFilter, selectedCategoryFilter, searchQuery]);

  // Featured Story (First story of selected class)
  const featuredStory = useMemo(() => {
    return filteredStories[0] || storiesData[0];
  }, [filteredStories]);

  // Quiz Handlers
  const handleSelectQuizOption = (questionId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateQuizScore = () => {
    if (!activeQuizStory) return 0;
    let score = 0;
    activeQuizStory.quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <PortalLayout
      title="Story Books & Moral Tales"
      subtitle="Middle School · Value Stories, Thirukkural Tales & Science Discoveries"
      avatarLetter="S"
      avatarColor="#f59e0b"
      themeClass="theme-student"
      accentColor="#f59e0b"
    >
      <div className="flex flex-col gap-6 w-full text-left font-sans">

        {/* 🌟 HERO BANNER - STORY REALM */}
        <div className="relative overflow-hidden rounded-3xl glass p-6 sm:p-8 border border-amber-500/20 shadow-md bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/10 transition-all">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-500/30">
                <i className="fi fi-rr-star text-xs" /> Featured Moral Story
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight leading-tight">
                {featuredStory.title}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)] leading-relaxed">
                {featuredStory.summaryEnglish}
              </p>

              {/* Glowing Moral Highlight */}
              <div className="inline-flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-semibold">
                <i className="fi fi-rr-bulb text-amber-500 text-base shrink-0" />
                <span><strong>Moral:</strong> {featuredStory.moralEnglish}</span>
              </div>
            </div>

            {/* Quick Action Hero Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={() => { setActiveWatchStory(featuredStory); setCurrentSceneIdx(0); }}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fi fi-rr-play-alt text-sm" />
                <span>Watch Story Theater 🎬</span>
              </button>

              <button
                onClick={() => { setActiveReadingStory(featuredStory); setReaderLanguage("English"); }}
                className="px-6 py-3 glass hover:bg-amber-500/10 text-[var(--text-heading)] font-bold text-xs rounded-xl border border-[var(--border)] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fi fi-rr-book-open-cover text-sm text-amber-500" />
                <span>Read & Listen Aloud 📖</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🔍 FILTER & SEARCH TOOLBAR */}
        <div className="glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Class Grade Level Tabs */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(["Class 6", "Class 7", "Class 8"] as const).map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClassFilter(cls)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedClassFilter === cls
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900/80 text-[var(--text-main)] border-[var(--border)] hover:bg-amber-500/10"
                  }`}
                >
                  {cls} Stories
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
              <input
                type="text"
                placeholder="Search by title, moral, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-[var(--border)] text-[var(--text-main)] rounded-xl py-2 pl-9 pr-3 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-[var(--text-muted)]"
              />
            </div>
          </div>

          {/* Theme / Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {[
              "All Categories",
              "Moral & Values",
              "Panchatantra & Fables",
              "Tenali Raman & Wit",
              "Thirukkural & Heritage",
              "Science & Curiosity"
            ].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border ${
                  selectedCategoryFilter === cat
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-transparent shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800/60 text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-heading)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 📚 STORIES CARDS GRID */}
        <div className="glass rounded-2xl p-5 sm:p-6 border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[var(--text-heading)] flex items-center gap-2">
              <i className="fi fi-rr-books text-amber-500" />
              <span>Available Stories ({filteredStories.length})</span>
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-medium">Bilingual Tamil & English</span>
          </div>

          {filteredStories.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-[var(--border)]">
              <i className="fi fi-rr-search text-3xl text-[var(--text-muted)] block mb-2" />
              <h4 className="text-sm font-bold text-[var(--text-heading)]">No stories match your filter</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1">Try resetting search keywords or category filters.</p>
              <button
                onClick={() => { setSelectedCategoryFilter("All Categories"); setSearchQuery(""); }}
                className="mt-3 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStories.map(st => (
                <div
                  key={st.id}
                  className="group relative glass rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Card Cover Banner */}
                  <div className={`h-28 bg-gradient-to-r ${st.coverGradient} p-4 flex items-start justify-between text-white relative`}>
                    <span className="px-2.5 py-0.5 rounded-md bg-black/30 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border border-white/20">
                      {st.category}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner">
                      <i className={st.icon} />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-muted)]">
                        <span>{st.classLevel}</span>
                        <span className="flex items-center gap-1"><i className="fi fi-rr-clock text-[10px]" /> {st.readTime}</span>
                      </div>

                      <h4 className="text-base font-bold text-[var(--text-heading)] group-hover:text-amber-500 transition-colors leading-snug">
                        {st.title}
                      </h4>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold italic">
                        {st.titleTamil}
                      </p>

                      <p className="text-xs text-[var(--text-muted)] font-normal line-clamp-2 leading-relaxed">
                        {st.summaryEnglish}
                      </p>
                    </div>

                    {/* Moral Box */}
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                      <strong className="text-amber-600 dark:text-amber-400">Moral:</strong> {st.moralEnglish}
                    </div>

                    {/* Card Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border)]">
                      <button
                        onClick={() => { setActiveWatchStory(st); setCurrentSceneIdx(0); }}
                        className="px-2 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
                        title="Watch Visual Story Theater"
                      >
                        <i className="fi fi-rr-play-alt" />
                        <span>Watch</span>
                      </button>

                      <button
                        onClick={() => { setActiveReadingStory(st); setReaderLanguage("English"); }}
                        className="px-2 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[var(--text-heading)] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all border border-[var(--border)]"
                        title="Read & Listen Aloud"
                      >
                        <i className="fi fi-rr-book-alt text-amber-500" />
                        <span>Read</span>
                      </button>

                      <button
                        onClick={() => { setActiveQuizStory(st); setQuizAnswers({}); setQuizSubmitted(false); }}
                        className="px-2 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[var(--text-heading)] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all border border-[var(--border)]"
                        title="Take 3-Question Quiz"
                      >
                        <i className="fi fi-rr-edit text-amber-500" />
                        <span>Quiz</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 🎬 MODAL 1: WATCH VISUAL STORY THEATER */}
      {activeWatchStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 text-white w-full max-w-3xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            
            {/* Theater Top Bar */}
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-sm font-black">
                  🎬
                </span>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Story Theater · Scene {currentSceneIdx + 1} of {activeWatchStory.scenes.length}</span>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">{activeWatchStory.title}</h3>
                </div>
              </div>

              <button
                onClick={() => setActiveWatchStory(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all"
              >
                <i className="fi fi-rr-cross" />
              </button>
            </div>

            {/* Theater Screen Stage */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6 flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
              
              {/* Scene Visual Canvas Box */}
              <div className="relative aspect-video w-full max-h-[50vh] min-h-[220px] sm:min-h-[320px] rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center bg-slate-950">
                {activeWatchStory.scenes[currentSceneIdx].imageUrl ? (
                  <div className="relative w-full h-full group flex items-center justify-center bg-slate-950">
                    <img
                      src={activeWatchStory.scenes[currentSceneIdx].imageUrl}
                      alt={activeWatchStory.scenes[currentSceneIdx].titleEnglish}
                      className="w-full h-full object-contain bg-slate-950 transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-4 sm:p-5 flex flex-col justify-end text-left pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-md self-start border border-amber-500/30">
                        Scene {currentSceneIdx + 1}
                      </span>
                      <h4 className="text-base sm:text-xl font-bold text-white drop-shadow-lg mt-1">
                        {activeWatchStory.scenes[currentSceneIdx].titleEnglish}
                      </h4>
                      <p className="text-xs sm:text-sm text-amber-300 font-medium drop-shadow-md">
                        {activeWatchStory.scenes[currentSceneIdx].titleTamil}
                      </p>
                    </div>
                  </div>
                ) : (
                  <SceneIllustrationArt
                    storyId={activeWatchStory.id}
                    sceneNum={activeWatchStory.scenes[currentSceneIdx].sceneNum}
                    titleEnglish={activeWatchStory.scenes[currentSceneIdx].titleEnglish}
                    titleTamil={activeWatchStory.scenes[currentSceneIdx].titleTamil}
                    icon={activeWatchStory.scenes[currentSceneIdx].icon}
                    bgGradient={activeWatchStory.scenes[currentSceneIdx].illustrationBg}
                  />
                )}
              </div>

              {/* Scene Dialogue / Text Box */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                  {activeWatchStory.scenes[currentSceneIdx].textEnglish}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-400 leading-relaxed">
                  {activeWatchStory.scenes[currentSceneIdx].textTamil}
                </p>
              </div>

              {/* Climax Moral Card if on Last Scene */}
              {currentSceneIdx === activeWatchStory.scenes.length - 1 && (
                <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-3">
                  <i className="fi fi-rr-trophy text-amber-400 text-xl shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">Moral Lesson</span>
                    <span>{activeWatchStory.moralEnglish}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Theater Controls Footer */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentSceneIdx(p => Math.max(0, p - 1))}
                disabled={currentSceneIdx === 0}
                className="px-4 py-2 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <i className="fi fi-rr-angle-left" />
                <span>Prev Scene</span>
              </button>

              {/* Progress Dots */}
              <div className="flex items-center gap-2">
                {activeWatchStory.scenes.map((sc, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSceneIdx(i)}
                    className={`h-2.5 rounded-full transition-all ${i === currentSceneIdx ? "w-6 bg-amber-500" : "w-2.5 bg-slate-700"}`}
                  />
                ))}
              </div>

              {currentSceneIdx < activeWatchStory.scenes.length - 1 ? (
                <button
                  onClick={() => setCurrentSceneIdx(p => p + 1)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  <span>Next Scene</span>
                  <i className="fi fi-rr-angle-right" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    const st = activeWatchStory;
                    setActiveWatchStory(null);
                    setActiveReadingStory(st);
                  }}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  <span>Read Full Story 📖</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 📖 MODAL 2: READ & LISTEN STORY ALOUD MODAL */}
      {activeReadingStory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-[var(--text-main)] w-full max-w-3xl rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            
            {/* Reader Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800 border-b border-[var(--border)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                  <i className={activeReadingStory.icon} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">{activeReadingStory.classLevel} · {activeReadingStory.category}</span>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)] truncate leading-tight">{activeReadingStory.title}</h3>
                </div>
              </div>

              {/* Language Switcher & Close */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setReaderLanguage("English")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${readerLanguage === "English" ? "bg-amber-500 text-white shadow-sm" : "text-[var(--text-muted)]"}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setReaderLanguage("Tamil")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${readerLanguage === "Tamil" ? "bg-amber-500 text-white shadow-sm" : "text-[var(--text-muted)]"}`}
                  >
                    தமிழ்
                  </button>
                </div>

                <button
                  onClick={handleCloseReader}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text-heading)] flex items-center justify-center text-sm"
                >
                  <i className="fi fi-rr-cross" />
                </button>
              </div>
            </div>

            {/* Reader Body Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed">
              
              {/* Audio Listen Aloud Bar */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-300 font-semibold text-xs">
                  <i className="fi fi-rr-volume text-amber-500 text-base" />
                  <span>{isPlayingAudio ? "Playing Audio Narration..." : "Listen to Story Aloud"}</span>
                </div>

                <button
                  onClick={() => {
                    const textToRead = (readerLanguage === "English" ? activeReadingStory.contentEnglish : activeReadingStory.contentTamil).join(" ");
                    toggleSpeechAudio(textToRead);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                    isPlayingAudio ? "bg-rose-500 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
                >
                  <i className={isPlayingAudio ? "fi fi-rr-pause" : "fi fi-rr-play"} />
                  <span>{isPlayingAudio ? "Pause Narration" : "Listen Aloud 🎧"}</span>
                </button>
              </div>

              {/* Story Paragraphs */}
              {(readerLanguage === "English" ? activeReadingStory.contentEnglish : activeReadingStory.contentTamil).map((para, idx) => (
                <p key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-[var(--border)] text-[var(--text-main)] font-normal leading-relaxed">
                  {para}
                </p>
              ))}

              {/* 💡 MORAL HIGHLIGHT CARD */}
              <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3 mt-4">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                  <i className="fi fi-rr-bulb" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    {readerLanguage === "English" ? "Moral of the Story (கதையின் நீதி)" : "கதையின் நீதி"}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-200 mt-1 leading-relaxed">
                    {readerLanguage === "English" ? activeReadingStory.moralEnglish : activeReadingStory.moralTamil}
                  </p>
                </div>
              </div>

              {/* 🌟 DAILY MORAL CHALLENGE CARD */}
              <div className="p-5 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-start gap-3 mt-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                  <i className="fi fi-rr-sparkles" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">
                    {readerLanguage === "English" ? "Today's Moral Action Challenge" : "இன்றைய நற்செயல்"}
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-sky-800 dark:text-sky-200 mt-1 leading-relaxed">
                    {readerLanguage === "English" ? activeReadingStory.dailyChallengeEnglish : activeReadingStory.dailyChallengeTamil}
                  </p>
                </div>
              </div>

            </div>

            {/* Reader Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-medium">Enjoyed the story? Test your learning!</span>
              <button
                onClick={() => {
                  const st = activeReadingStory;
                  handleCloseReader();
                  setActiveQuizStory(st);
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <i className="fi fi-rr-edit" />
                <span>Take 3-Question Quiz 🏆</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🏆 MODAL 3: STORY MASTER QUIZ MODAL */}
      {activeQuizStory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-[var(--text-main)] w-full max-w-2xl rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            
            {/* Quiz Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Story Master Quiz · 3 Questions</span>
                <h3 className="text-base font-bold text-[var(--text-heading)] leading-tight">{activeQuizStory.title}</h3>
              </div>

              <button
                onClick={() => setActiveQuizStory(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text-heading)] flex items-center justify-center text-sm"
              >
                <i className="fi fi-rr-cross" />
              </button>
            </div>

            {/* Quiz Body */}
            <div className="p-5 overflow-y-auto space-y-6">
              {quizSubmitted && (
                <div className="p-6 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-md">
                    <i className="fi fi-rr-trophy" />
                  </div>
                  <h4 className="text-lg font-bold text-[var(--text-heading)]">Quiz Completed!</h4>
                  <p className="text-2xl font-black text-amber-500">
                    Score: {calculateQuizScore()} / {activeQuizStory.quiz.length}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] font-normal">
                    {calculateQuizScore() === 3 ? "Fantastic! You unlocked the Story Master Badge 🏆" : "Good try! Review the answers below to reinforce your moral learning."}
                  </p>
                </div>
              )}

              {/* Questions List */}
              {activeQuizStory.quiz.map((q, idx) => {
                const userChoice = quizAnswers[q.id];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-[var(--border)] space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-[var(--text-heading)]">{q.question}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">{q.questionTamil}</p>
                      </div>
                    </div>

                    {/* Options List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userChoice === optIdx;
                        let btnStyle = "bg-white dark:bg-slate-900 text-[var(--text-main)] border-[var(--border)]";

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/50 font-bold";
                          } else if (isSelected) {
                            btnStyle = "bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/50 font-bold";
                          }
                        } else if (isSelected) {
                          btnStyle = "bg-amber-500 text-white border-amber-500 font-bold";
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectQuizOption(q.id, optIdx)}
                            disabled={quizSubmitted}
                            className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all flex flex-col gap-0.5 ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            <span className="text-[10px] opacity-80">{q.optionsTamil[optIdx]}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {quizSubmitted && (
                      <div className={`p-3 rounded-xl text-xs font-normal border ${isCorrect ? "bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border-emerald-500/30" : "bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] border-[var(--border)]"}`}>
                        <p><strong>Explanation:</strong> {q.explanation}</p>
                        <p className="text-[11px] opacity-90 mt-0.5">{q.explanationTamil}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {quizSubmitted ? `Answered ${Object.keys(quizAnswers).length} of ${activeQuizStory.quiz.length}` : "Select your answers above"}
              </span>

              {!quizSubmitted ? (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < activeQuizStory.quiz.length}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                  className="px-5 py-2 bg-slate-200 dark:bg-slate-700 text-[var(--text-main)] text-xs font-bold rounded-xl transition-all"
                >
                  Retake Quiz
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </PortalLayout>
  );
}
