"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function ActiveQuizPage() {
  const params = useParams();
  const slug = params?.category as string;
  const quizId = params?.quizId as string;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const decodedSlug = decodeURIComponent(slug);

  const quizDatabase: Record<string, Record<string, { title: string, questions: { q: string, options: string[], correct: number }[] }>> = {
    "science-(அறிவியல்)": {
      "q1": {
        title: "States of Matter",
        questions: [
          { q: "Which state of matter has a definite shape and volume?", options: ["Solid", "Liquid", "Gas", "Plasma"], correct: 0 },
          { q: "The process of a liquid turning into a gas is called?", options: ["Melting", "Freezing", "Evaporation", "Condensation"], correct: 2 },
          { q: "Water freezes at what temperature in Celsius?", options: ["100°C", "0°C", "50°C", "-10°C"], correct: 1 }
        ]
      },
      "q2": {
        title: "Human Body Systems",
        questions: [
          { q: "Which organ pumps blood throughout the body?", options: ["Lungs", "Brain", "Heart", "Kidney"], correct: 2 },
          { q: "What is the longest bone in the human body?", options: ["Femur", "Humerus", "Tibia", "Fibula"], correct: 0 },
          { q: "Which gas do we breathe out?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2 }
        ]
      },
      "q3": {
        title: "Light & Sound",
        questions: [
          { q: "Light travels fastest in?", options: ["Water", "Glass", "Air", "Vacuum"], correct: 3 },
          { q: "Which of the following is a luminous object?", options: ["Moon", "Earth", "Sun", "Mirror"], correct: 2 },
          { q: "Sound cannot travel through?", options: ["Air", "Water", "Steel", "Vacuum"], correct: 3 }
        ]
      }
    },
    "math-(கணிதம்)": {
      "q1": {
        title: "Fractions & Decimals",
        questions: [
          { q: "What is 1/2 as a decimal?", options: ["0.2", "0.5", "1.2", "0.25"], correct: 1 },
          { q: "Which fraction is equivalent to 2/4?", options: ["1/3", "3/4", "1/2", "2/3"], correct: 2 },
          { q: "What is 0.75 as a fraction?", options: ["3/4", "1/2", "1/4", "4/3"], correct: 0 }
        ]
      },
      "q2": {
        title: "Algebraic Expressions",
        questions: [
          { q: "If x = 3, what is 2x + 4?", options: ["10", "7", "12", "9"], correct: 0 },
          { q: "Simplify: 3y + 2y - y", options: ["6y", "4y", "5y", "2y"], correct: 1 },
          { q: "What is the variable in the expression 5m - 2?", options: ["5", "2", "m", "-2"], correct: 2 }
        ]
      },
      "q3": {
        title: "Geometry Basics",
        questions: [
          { q: "How many degrees are in a right angle?", options: ["45°", "90°", "180°", "360°"], correct: 1 },
          { q: "What is the sum of angles in a triangle?", options: ["90°", "180°", "360°", "270°"], correct: 1 },
          { q: "A polygon with 5 sides is called a?", options: ["Hexagon", "Pentagon", "Octagon", "Quadrilateral"], correct: 1 }
        ]
      }
    },
    "social-science": {
      "q1": {
        title: "Indus Valley Civilization",
        questions: [
          { q: "Which river is associated with the Indus Valley Civilization?", options: ["Ganga", "Yamuna", "Indus", "Brahmaputra"], correct: 2 },
          { q: "The Great Bath was found in which city?", options: ["Harappa", "Mohenjo-Daro", "Lothal", "Kalibangan"], correct: 1 },
          { q: "Which animal was NOT known to the Indus people?", options: ["Bull", "Elephant", "Horse", "Rhino"], correct: 2 }
        ]
      },
      "q2": {
        title: "Earth and Solar System",
        questions: [
          { q: "Which is the third planet from the Sun?", options: ["Venus", "Earth", "Mars", "Jupiter"], correct: 1 },
          { q: "What causes day and night on Earth?", options: ["Revolution", "Rotation", "Eclipse", "Tides"], correct: 1 },
          { q: "Which planet is known as the Red Planet?", options: ["Saturn", "Jupiter", "Mars", "Uranus"], correct: 2 }
        ]
      },
      "q3": {
        title: "Indian Constitution",
        questions: [
          { q: "Who is known as the Father of the Indian Constitution?", options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Dr. B.R. Ambedkar", "Sardar Patel"], correct: 2 },
          { q: "How many Fundamental Rights are there initially?", options: ["5", "6", "7", "8"], correct: 2 },
          { q: "When did the Constitution of India come into effect?", options: ["1947", "1950", "1952", "1949"], correct: 1 }
        ]
      }
    },
    "tamil-&-english": {
      "q1": {
        title: "Tenses & Verbs",
        questions: [
          { q: "Which is the past tense of 'Go'?", options: ["Goes", "Going", "Went", "Gone"], correct: 2 },
          { q: "Identify the verb: 'The cat sleeps on the mat.'", options: ["cat", "sleeps", "on", "mat"], correct: 1 },
          { q: "Future continuous tense of 'play':", options: ["will play", "was playing", "will be playing", "played"], correct: 2 }
        ]
      },
      "q2": {
        title: "Thirukkural Meanings",
        questions: [
          { q: "Who wrote Thirukkural?", options: ["Avvaiyar", "Thiruvalluvar", "Kambar", "Bharathiar"], correct: 1 },
          { q: "How many chapters (Adhigaram) are in Thirukkural?", options: ["133", "1330", "100", "10"], correct: 0 },
          { q: "How many couplets (Kurals) does each chapter have?", options: ["5", "10", "15", "20"], correct: 1 }
        ]
      },
      "q3": {
        title: "Synonyms & Antonyms",
        questions: [
          { q: "What is the synonym of 'Happy'?", options: ["Sad", "Joyful", "Angry", "Tired"], correct: 1 },
          { q: "What is the antonym of 'Brave'?", options: ["Cowardly", "Bold", "Strong", "Fierce"], correct: 0 },
          { q: "Synonym for 'Rapid':", options: ["Slow", "Steady", "Fast", "Heavy"], correct: 2 }
        ]
      }
    }
  };

  const defaultQuiz = {
    title: "General Knowledge",
    questions: [
      { q: "What is the capital of Tamil Nadu?", options: ["Madurai", "Coimbatore", "Chennai", "Trichy"], correct: 2 },
      { q: "Which is the national bird of India?", options: ["Parrot", "Peacock", "Eagle", "Crow"], correct: 1 }
    ]
  };

  const currentQuizData = (quizDatabase[decodedSlug] && quizDatabase[decodedSlug][quizId]) || defaultQuiz;
  const questions = currentQuizData.questions;

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <PortalLayout
      title="Quiz Gameplay"
      subtitle={currentQuizData.title}
      avatarLetter="A"
      avatarColor="#10b981"
      themeClass="theme-student"
      accentColor="#10b981"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
           <Link href={`/student/middle-school/quizzes/${slug}`} className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
              <span>←</span> Quit Quiz
           </Link>
           <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 font-bold text-emerald-400">
             Score: {score} / {questions.length}
           </div>
        </div>

        {!isFinished ? (
          <div className="glass rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden">
             {/* Progress Bar */}
             <div className="w-full bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                ></div>
             </div>

             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Question {currentQuestion + 1} of {questions.length}</h2>
             <h3 className="text-2xl font-black text-white mb-8">{questions[currentQuestion].q}</h3>

             <div className="space-y-4 mb-8">
                {questions[currentQuestion].options.map((opt, idx) => {
                  let btnClass = "bg-slate-900/60 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 text-white";
                  
                  if (isAnswered) {
                    if (idx === questions[currentQuestion].correct) {
                      btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400"; // Correct answer is always highlighted
                    } else if (idx === selectedAnswer) {
                      btnClass = "bg-red-500/20 border-red-500 text-red-400"; // Wrong selected answer
                    } else {
                      btnClass = "bg-slate-900/30 border-slate-800 text-slate-500 opacity-50"; // Other unselected answers fade out
                    }
                  }

                  return (
                    <button 
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left px-6 py-4 rounded-2xl border-2 font-bold text-lg transition-all ${btnClass}`}
                    >
                      {opt}
                    </button>
                  );
                })}
             </div>

             {isAnswered && (
               <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4">
                  <button 
                    onClick={nextQuestion}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-colors"
                  >
                    {currentQuestion === questions.length - 1 ? "See Results" : "Next Question →"}
                  </button>
               </div>
             )}
          </div>
        ) : (
          <div className="glass rounded-3xl p-10 border border-emerald-500/30 text-center bg-gradient-to-b from-emerald-900/20 to-transparent">
             <div className="text-8xl mb-6">🏆</div>
             <h2 className="text-3xl font-black text-white mb-2">Quiz Complete!</h2>
             <p className="text-slate-400 mb-8">You scored {score} out of {questions.length}</p>
             
             <div className="flex justify-center gap-6 mb-10">
                <div className="bg-slate-900/60 px-6 py-4 rounded-2xl border border-amber-500/30">
                   <span className="block text-xs uppercase font-bold text-slate-400 mb-1">XP Earned</span>
                   <span className="block text-3xl font-black text-amber-400">+{score * 50}</span>
                </div>
                <div className="bg-slate-900/60 px-6 py-4 rounded-2xl border border-emerald-500/30">
                   <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Accuracy</span>
                   <span className="block text-3xl font-black text-emerald-400">{Math.round((score / questions.length) * 100)}%</span>
                </div>
             </div>

             <div className="flex justify-center gap-4">
                <Link href={`/student/middle-school/quizzes/${slug}`} className="px-6 py-3 border border-slate-600 hover:bg-slate-800 rounded-xl font-bold text-white transition-colors">
                  Back to Topic
                </Link>
                <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/20 transition-colors">
                  Play Again
                </button>
             </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
