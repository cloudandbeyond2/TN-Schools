// ============================================================================
// Botany Centre — grade-aware syllabus map (Class 8 / 10 / 11 botany portions).
// Reuses the shared unit/grade types from zoologySyllabus. All study prose is
// authored in-house; figures reference the TN state textbooks.
// ============================================================================
import type { ZoologyGrade, ZoologyUnit } from "./zoologySyllabus";
import { resolveGrade } from "./zoologySyllabus";

export type BotanyUnit = ZoologyUnit;
export type BotanyGrade = ZoologyGrade;

const grade8: BotanyGrade = {
  grade: 8,
  label: "Class 8 · Science | 8-ஆம் வகுப்பு · அறிவியல்",
  medium: "Tamil",
  book: "Class 8 Science (Tamil) | 8-ஆம் வகுப்பு அறிவியல் (தமிழ்)",
  intro: "In Class 8 botany we explore the plant world — how plants are grouped, how they make their own food, and how we grow crops to feed everyone. / 8-ஆம் வகுப்பு தாவரவியலில் நாம் தாவர உலகத்தை ஆராய்வோம் - தாவரங்கள் எவ்வாறு வகைப்படுத்தப்படுகின்றன, அவை எவ்வாறு தங்கள் உணவை தயாரிக்கின்றன, மற்றும் அனைவருக்கும் உணவளிக்க பயிர்களை எவ்வாறு வளர்க்கிறோம்.",
  units: [
    {
      id: "plant-world",
      title: "The Plant World | தாவர உலகம்",
      textbookRef: "Class 8 Science · Unit 17 · p.215 | 8-ஆம் வகுப்பு அறிவியல் · அலகு 17 · பக்கம் 215",
      emoji: "🌿",
      color: "emerald",
      objectives: [
        "Group plants into herbs, shrubs, trees and climbers. / தாவரங்களை மூலிகைகள், புதர்கள், மரங்கள் மற்றும் ஏறு கொடிகள் என வகைப்படுத்துதல்.",
        "Describe the parts of a plant and their jobs. / தாவரத்தின் உறுப்புகளையும் அவற்றின் பணிகளையும் விளக்குதல்.",
        "Tell flowering from non-flowering plants. / பூக்கும் தாவரங்களை பூவாத் தாவரங்களில் இருந்து வேறுபடுத்துதல்."
      ],
      concepts: [
        {
          heading: "Kinds of plants | தாவரங்களின் வகைகள்",
          body: "Plants come in many forms — soft herbs, woody shrubs and tall trees, plus creepers and climbers. Sorting them helps us study and use them. / தாவரங்கள் மென்மையான மூலிகைகள், புதர்கள், உயரமான மரங்கள், படர் கொடிகள் என பல வடிவங்களில் வளர்கின்றன. இவற்றை வகைப்படுத்துவது தாவரங்களைப் பற்றி படிக்க உதவுகிறது."
        },
        {
          heading: "Parts and jobs | உறுப்புகளும் பணிகளும்",
          body: "Roots anchor the plant and drink water; the stem carries water and holds leaves up; leaves make food; flowers make seeds for the next generation. / வேர்கள் தாவரத்தை மண்ணில் நிலைநிறுத்தி நீரை உறிஞ்சுகின்றன; தண்டு நீரை கடத்தி இலைகளைத் தாங்குகிறது; இலைகள் உணவை தயாரிக்கின்றன; பூக்கள் அடுத்த தலைமுறைக்கான விதைகளை உருவாக்குகின்றன."
        },
      ],
      figure: {
        caption: "Parts of a flowering plant — see the labelled diagram in the unit. / ஒரு பூக்கும் தாவரத்தின் பாகங்கள் - அலகில் உள்ள பெயரிடப்பட்ட வரைபடத்தைப் பார்க்கவும்.",
        page: "p.215–228"
      },
      research: [
        { title: "Plants that clean air | காற்றைத் தூய்மைப்படுத்தும் தாவரங்கள்", body: "Studies keep confirming that green cover cools cities and cleans the air we breathe. / பசுமைப் பரப்பு நகரங்களைக் குளிர்விப்பதோடு நாம் சுவாசிக்கும் காற்றையும் தூய்மைப்படுத்துகிறது என்று ஆய்வுகள் உறுதிப்படுத்துகின்றன.", year: "2024" },
        { title: "Seed banks | விதை வங்கிகள்", body: "Scientists store seeds of thousands of plant species to protect them for the future. / விஞ்ஞானிகள் எதிர்காலப் பாதுகாப்பிற்காக ஆயிரக்கணக்கான தாவர இனங்களின் விதைகளைச் சேமித்து வைக்கின்றனர்.", year: "2024" },
      ],
      news: [
        { title: "Miyawaki forests | மியாவாக்கி காடுகள்", body: "Dense mini-forests are being planted across Tamil Nadu towns to boost green cover fast. / தமிழக நகரங்களில் பசுமைப் பரப்பை வேகமாக அதிகரிக்க அடர்ந்த குறுங்காடுகள் வளர்க்கப்பட்டு வருகின்றன.", tag: "Environment" }
      ],
      glossary: [
        { term: "Herb | சிறுசெடி", ta: "மூலிகை", def: "A small plant with a soft stem. / மென்மையான தண்டு கொண்ட சிறிய தாவரம்." },
        { term: "Photosynthesis | ஒளிச்சேர்க்கை", ta: "ஒளிச்சேர்க்கை", def: "How green plants make food using sunlight. / பச்சையத் தாவரங்கள் சூரிய ஒளியைப் பயன்படுத்தி உணவைத் தயாரிக்கும் முறை." },
      ],
      quiz: [
        {
          q: "Which part of the plant makes food? / தாவரத்தின் எந்தப் பகுதி உணவை தயாரிக்கிறது?",
          options: ["Root | வேர்", "Leaf | இலை", "Stem | தண்டு"],
          answer: 1,
          explain: "Leaves make food by photosynthesis. / இலைகள் ஒளிச்சேர்க்கை மூலம் உணவை தயாரிக்கின்றன."
        }
      ],
    },
    {
      id: "crop-management",
      title: "Crop Production & Management | பயிர்ப் பெருக்கம் மற்றும் மேலாண்மை",
      textbookRef: "Class 8 Science · Unit 21 · p.271 | 8-ஆம் வகுப்பு அறிவியல் · அலகு 21 · பக்கம் 271",
      emoji: "🌾",
      color: "amber",
      objectives: [
        "List the steps of growing a crop. / பயிர் வளர்ப்பின் படிநிலைகளை வரிசைப்படுத்துதல்.",
        "Explain irrigation, manure and fertilisers. / நீர்ப்பாசனம், இயற்கை மற்றும் செயற்கை உரங்களை விளக்குதல்.",
        "Describe how crops are stored safely. / அறுவடை செய்யப்பட்ட பயிர்களைப் பாதுகாப்பாகச் சேமிக்கும் முறைகளை விவரித்தல்."
      ],
      concepts: [
        {
          heading: "From soil to harvest | மண் தயாரிப்பு முதல் அறுவடை வரை",
          body: "Farming follows steps: preparing soil, sowing seeds, adding water and nutrients, removing weeds, and finally harvesting and storing the crop. / விவசாயம் பல படிநிலைகளைக் கொண்டது: மண் தயாரித்தல், விதை விதைத்தல், நீர் மற்றும் ஊட்டச்சத்து அளித்தல், களை நீக்குதல், அறுவடை செய்தல் மற்றும் சேமித்தல்."
        },
        {
          heading: "Feeding the soil | மண்ணுக்கு ஊட்டமளித்தல்",
          body: "Manure and fertilisers replace the nutrients crops take from the soil, keeping the land fertile year after year. / பயிர்கள் மண்ணிலிருந்து உறிஞ்சும் ஊட்டச்சத்துக்களை இயற்கை மற்றும் செயற்கை உரங்கள் ஈடுசெய்து, நிலத்தை வளமாக வைக்கின்றன."
        },
      ],
      figure: {
        caption: "Stages of crop production — see the unit's process diagram. / பயிர் உற்பத்தியின் நிலைகள் - அலகில் உள்ள செயல்முறை வரைபடத்தைப் பார்க்கவும்.",
        page: "p.271–288"
      },
      research: [
        { title: "Precision farming | துல்லியப் பண்ணையம்", body: "Sensors and drones now help farmers water and feed crops exactly where needed, saving resources. / சென்சார்கள் மற்றும் ட்ரோன்கள் விவசாயிகளுக்குத் தேவைப்படும் இடத்தில் துல்லியமாக நீர் மற்றும் உரம் அளிக்க உதவுகின்றன.", year: "2025" },
        { title: "Drought-tolerant crops | வறட்சியைத் தாங்கும் பயிர்கள்", body: "New crop varieties are bred to grow with less water as climates change. / பருவநிலை மாற்றத்திற்கு ஏற்ப குறைந்த நீரில் வளரக்கூடிய புதிய பயிர் ரகங்கள் உருவாக்கப்படுகின்றன.", year: "2024" },
      ],
      news: [
        { title: "Millets revival | சிறுதானியங்களின் மறுமலர்ச்சி", body: "India is promoting millets as climate-smart, nutritious crops. / இந்தியா சிறுதானியங்களை ஊட்டச்சத்து மிக்க, காலநிலைக்கேற்ற பயிர்களாக ஊக்குவித்து வருகிறது.", tag: "Agriculture" }
      ],
      glossary: [
        { term: "Irrigation | நீர்ப்பாசனம்", ta: "நீர்ப்பாசனம்", def: "Supplying water to crops. / பயிர்களுக்கு நீர் பாய்ச்சும் முறை." },
        { term: "Manure | இயற்கை உரம்", ta: "எரு", def: "Natural material that enriches the soil. / மண்ணை வளப்படுத்தும் இயற்கை கழிவுப் பொருள்." },
      ],
      quiz: [
        {
          q: "Adding water to crops is called… / பயிர்களுக்கு நீர் பாய்ச்சுவது எவ்வாறு அழைக்கப்படும்?",
          options: ["Sowing | விதைத்தல்", "Irrigation | நீர்ப்பாசனம்", "Harvesting | அறுவடை செய்தல்"],
          answer: 1,
          explain: "Irrigation is supplying water to crops. / நீர்ப்பாசனம் என்பது பயிர்களுக்கு செயற்கையாக நீர் பாய்ச்சும் முறை ஆகும்."
        }
      ],
    },
  ],
};

const grade10: BotanyGrade = {
  grade: 10,
  label: "Class 10 · Science | 10-ஆம் வகுப்பு · அறிவியல்",
  medium: "English",
  book: "Class 10 Science (English) | 10-ஆம் வகுப்பு அறிவியல் (ஆங்கிலம்)",
  intro: "Class 10 botany covers how plants feed, transport materials, respond with hormones and reproduce. Work each unit's objectives, diagram and quiz to prepare for the board exam. / 10-ஆம் வகுப்பு தாவரவியல் தாவரங்களின் உணவு தயாரிப்பு, சுழற்சி முறை, ஹார்மோன்கள் மற்றும் இனப்பெருக்கம் ஆகியவற்றை உள்ளடக்கியது.",
  units: [
    {
      id: "plant-nutrition",
      title: "Nutrition & Photosynthesis | ஊட்டச்சத்து & ஒளிச்சேர்க்கை",
      textbookRef: "Class 10 Science · Unit 12 · p.174 | 10-ஆம் வகுப்பு அறிவியல் · அலகு 12 · பக்கம் 174",
      emoji: "☀️",
      color: "emerald",
      objectives: [
        "Write the photosynthesis equation. / ஒளிச்சேர்க்கையின் சமன்பாட்டை எழுதுதல்.",
        "Explain the role of chlorophyll and stomata. / பச்சையம் மற்றும் இலைத்துளையின் பணிகளை விளக்குதல்.",
        "Describe how plants store food. / தாவரங்கள் உணவை எவ்வாறு சேமிக்கின்றன என்பதை விவரித்தல்."
      ],
      concepts: [
        {
          heading: "Making food from light | ஒளியிலிருந்து உணவு தயாரித்தல்",
          body: "Green plants use sunlight, water and carbon dioxide to make glucose and release oxygen. Chlorophyll in the leaves captures the light energy. / பச்சையத் தாவரங்கள் சூரிய ஒளி, நீர் மற்றும் கார்பன் டை ஆக்சைடைப் பயன்படுத்தி குளுக்கோஸைத் தயாரித்து ஆக்சிஜனை வெளியிடுகின்றன."
        },
        {
          heading: "Gates on the leaf | இலைத்துளைகள்",
          body: "Tiny pores called stomata let gases in and out and control water loss. / இலைத்துளைகள் எனப்படும் சிறிய துவாரங்கள் வாயுப் பரிமாற்றம் மற்றும் நீராவிப்போக்கைக் கட்டுப்படுத்துகின்றன."
        },
      ],
      figure: {
        caption: "Photosynthesis in a leaf — see the labelled diagram. / இலையில் ஒளிச்சேர்க்கை நடக்கும் முறை - பெயரிடப்பட்ட வரைபடத்தைப் பார்க்கவும்.",
        page: "p.174–186"
      },
      research: [
        { title: "Artificial photosynthesis | செயற்கை ஒளிச்சேர்க்கை", body: "Scientists are building devices that copy leaves to make clean fuel from sunlight. / சூரிய ஒளியில் இருந்து தூய எரிபொருளைத் தயாரிக்க இலைகளைப் போன்ற செயற்கை அமைப்புகளை விஞ்ஞானிகள் உருவாக்கி வருகின்றனர்.", year: "2024" },
        { title: "Boosting crop yield | பயிர் விளைச்சலை அதிகரித்தல்", body: "Researchers are tuning photosynthesis to help crops grow more food. / அதிக உணவு உற்பத்திக்காக ஒளிச்சேர்க்கை திறனை மேம்படுத்தும் ஆராய்ச்சிகள் நடக்கின்றன.", year: "2025" },
      ],
      news: [
        { title: "Carbon capture by plants | தாவரங்களின் கார்பன் சேமிப்பு", body: "Forests and crops remain our biggest natural tool against rising carbon dioxide. / காடுகளும் பயிர்களுமே வளிமண்டலக் கார்பன் டை ஆக்சைடை உறிஞ்சும் முதன்மை இயற்கை காரணி ஆகும்.", tag: "Climate" }
      ],
      glossary: [
        { term: "Chlorophyll | பச்சையம்", def: "The green pigment that captures light. / ஒளியை உறிஞ்சும் பச்ச நிற நிறமி." },
        { term: "Stomata | இலைத்துளை", def: "Tiny leaf pores for gas exchange. / வாயுப் பரிமாற்றத்திற்கான சிறிய இலைத் துவாரங்கள்." },
      ],
      quiz: [
        {
          q: "Photosynthesis releases which gas? / ஒளிச்சேர்க்கையின் போது வெளியாகும் வாயு எது?",
          options: ["Carbon dioxide | கார்பன் டை ஆக்சைடு", "Oxygen | ஆக்சிஜன்", "Nitrogen | நைட்ரஜன்"],
          answer: 1,
          explain: "Plants release oxygen during photosynthesis. / தாவரங்கள் ஒளிச்சேர்க்கையின் போது ஆக்சிஜனை வெளியிடுகின்றன."
        }
      ],
    },
    {
      id: "plant-transport",
      title: "Transportation in Plants | தாவரங்களில் கடத்துமுறை",
      textbookRef: "Class 10 Science · Unit 14 · p.200 | 10-ஆம் வகுப்பு அறிவியல் · அலகு 14 · பக்கம் 200",
      emoji: "💧",
      color: "sky",
      objectives: [
        "Compare xylem and phloem. / சைலம் மற்றும் புளோயத்தை ஒப்பிடுதல்.",
        "Explain transpiration. / நீராவிப்போக்கை விளக்குதல்.",
        "Describe how water rises in tall trees. / உயரமான மரங்களில் நீர் எவ்வாறு மேலேறுகிறது என்பதை விவரித்தல்."
      ],
      concepts: [
        {
          heading: "Two pipelines | இரண்டு கடத்துப் பாதைகள்",
          body: "Xylem carries water and minerals up from the roots; phloem carries food made in the leaves to the rest of the plant. / சைலம் திசு நீரையும் தாதுக்களையும் வேரிலிருந்து மேலே கடத்துகிறது; புளோயம் திசு இலையில் தயாரிக்கப்பட்ட உணவை தாவரத்தின் பிற பகுதிகளுக்குக் கடத்துகிறது."
        },
        {
          heading: "The pull from leaves | இலைகளின் உறிஞ்சு விசை",
          body: "Water evaporating from leaves (transpiration) pulls a continuous column of water up from the roots. / இலைகளில் இருந்து நீர் ஆவியாதல் (நீராவிப்போக்கு) வேர்களிலிருந்து நீரை மேலே இழுக்க ஒரு தொடர்ச்சியான விசையை உருவாக்குகிறது."
        },
      ],
      figure: {
        caption: "Xylem and phloem transport — see the unit's diagram. / சைலம் மற்றும் புளோயம் கடத்துமுறை - அலகில் உள்ள வரைபடத்தைப் பார்க்கவும்.",
        page: "p.200–217"
      },
      research: [
        { title: "Smart irrigation | ஸ்மார்ட் நீர்ப்பாசனம்", body: "Sensors read plant water stress so farmers water exactly when needed. / சென்சார்கள் தாவரத்தின் நீர் தேவையை அளவிட்டு துல்லியமாகப் பாசனம் செய்ய உதவுகின்றன.", year: "2024" }
      ],
      news: [
        { title: "Urban trees & cooling | நகர்ப்புற மரங்கள் & குளிர்விப்பு", body: "Transpiration from street trees measurably cools neighbourhoods. / மரங்களின் நீராவிப்போக்கு நகரப் பகுதிகளைக் குளிர்விக்க பெரிதும் உதவுகிறது.", tag: "Environment" }
      ],
      glossary: [
        { term: "Xylem | சைலம்", def: "Tissue that carries water upward. / நீரை மேலே கடத்தும் கடத்துத் திசு." },
        { term: "Transpiration | நீராவிப்போக்கு", def: "Loss of water vapour from leaves. / இலைகளின் வழியே நீர் நீராவியாக வெளியேறும் நிகழ்வு." },
      ],
      quiz: [
        {
          q: "Which tissue carries water up the plant? / தாவரத்தின் மேலே நீரை கடத்தும் திசு எது?",
          options: ["Phloem | புளோயம்", "Xylem | சைலம்", "Cortex | புறணி"],
          answer: 1,
          explain: "Xylem carries water and minerals upward. / சைலம் திசு நீரையும் கனிமங்களையும் வேரிலிருந்து மேல்நோக்கி கடத்துகிறது."
        }
      ],
    },
  ],
};

const grade11: BotanyGrade = {
  grade: 11,
  label: "Class 11 · Bio-Botany | 11-ஆம் வகுப்பு · உயிரி-தாவரவியல்",
  medium: "Tamil",
  book: "Class 11 Bio-Botany (Tamil) | 11-ஆம் வகுப்பு உயிரி-தாவரவியல் (தமிழ்)",
  intro: "Class 11 Botany builds strong plant-science fundamentals — classification, structure, and how plants function — for board and NEET success. / 11-ஆம் வகுப்பு தாவரவியல் பாடப்பிரிவு வகைப்பாடு, தாவர உடலமைப்பு மற்றும் அதன் பணிகளை விளக்குகிறது.",
  units: [
    {
      id: "plant-kingdom",
      title: "Plant Kingdom | தாவர உலகம் (வகைப்பாடு)",
      textbookRef: "Class 11 Bio-Botany · Chapter 2 | 11-ஆம் வகுப்பு உயிரி-தாவரவியல் · அத்தியாயம் 2",
      emoji: "🌱",
      color: "emerald",
      objectives: [
        "Classify plants from algae to flowering plants. / பாசிகள் முதல் பூக்கும் தாவரங்கள் வரை வகைப்படுத்துதல்.",
        "Use features like seeds and vascular tissue. / விதைகள் மற்றும் வாஸ்குலார் திசுக்களின் பண்புகளைப் பயன்படுத்துதல்.",
        "Give examples of each group. / ஒவ்வொரு பிரிவிற்கும் பொருத்தமான உதாரணங்களை வழங்குதல்."
      ],
      concepts: [
        {
          heading: "From simple to seed plants | எளிய தாவரங்கள் முதல் விதை தாவரங்கள் வரை",
          body: "Plants range from simple algae and mosses, through ferns, up to seed plants — gymnosperms (naked seeds) and angiosperms (flowering plants). / தாவரங்கள் எளிய பாசிகள் முதல் ஜிம்னோஸ்பெர்ம்கள் (திறந்த விதைத் தாவரங்கள்) மற்றும் ஆன்ஜியோஸ்பெர்ம்கள் (மூடிய விதைத் தாவரங்கள்) வரை பல பிரிவுகளாகப் பிரிக்கப்பட்டுள்ளன."
        },
        {
          heading: "Why classify | வகைப்பாட்டின் முக்கியத்துவம்",
          body: "Grouping plants by shared features helps us study, name and use them across the world. / தாவரங்களின் பொதுவான பண்புகளின் அடிப்படையில் வகைப்படுத்துவது அவற்றைப் படிக்கவும் பயன்படுத்தவும் உதவுகிறது."
        },
      ],
      figure: {
        caption: "Major plant groups — see the classification chart. / முக்கிய தாவரப் பிரிவுகள் - வகைப்பாட்டு அட்டவணையைப் பார்க்கவும்.",
        page: "Chapter 2"
      },
      research: [
        { title: "Plant DNA trees | தாவர டி.என்.ஏ மரங்கள்", body: "Genetic studies refine how plant groups are related on the tree of life. / மரபணு ஆய்வுகள் தாவரங்களின் பரிணாம உறவுகளைத் துல்லியமாக விளக்குகின்றன.", year: "2024" }
      ],
      news: [
        { title: "New species | புதிய தாவரங்கள் கண்டறிதல்", body: "Botanists still discover new plant species in the Western Ghats each year. / தாவரவியலாளர்கள் மேற்குத் தொடர்ச்சி மலைகளில் ஆண்டுதோறும் புதிய தாவர வகைகளைக் கண்டறிந்து வருகின்றனர்.", tag: "Discovery" }
      ],
      glossary: [
        { term: "Angiosperm | ஆன்ஜியோஸ்பெர்ம்", ta: "மலரும் தாவரம்", def: "A flowering, seed-producing plant. / மூடிய விதைகளைக் கொண்ட பூக்கும் தாவரம்." },
        { term: "Gymnosperm | ஜிம்னோஸ்பெர்ம்", ta: "வெளிவிதைத் தாவரம்", def: "A plant with naked (uncovered) seeds. / திறந்த விதைகளைக் கொண்ட பூவாத் தாவரம்." },
      ],
      quiz: [
        {
          q: "Flowering plants are called… / பூக்கும் தாவரங்கள் எவ்வாறு அழைக்கப்படுகின்றன?",
          options: ["Gymnosperms | ஜிம்னோஸ்பெர்ம்கள்", "Angiosperms | ஆன்ஜியோஸ்பெர்ம்கள்", "Algae | பாசிகள்"],
          answer: 1,
          explain: "Angiosperms are flowering, seed plants. / ஆன்ஜியோஸ்பெர்ம்கள் மூடிய விதைகளைக் கொண்ட பூக்கும் தாவரங்கள் ஆகும்."
        }
      ],
    },
  ],
};

export const BOTANY_SYLLABUS: Record<number, BotanyGrade> = { 8: grade8, 10: grade10, 11: grade11 };
export const BOTANY_GRADES = [8, 10, 11];
export const BOTANY_APPROVAL_STATUS = "botany-approved";
export { resolveGrade };
