import mongoose, { Schema, Document } from 'mongoose';

// AI Tutor Chat Log
export interface IAIChat extends Document {
  studentId: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  subject?: string;
  language: 'tamil' | 'english' | 'bilingual';
  createdAt: Date;
}

const AIChatSchema = new Schema<IAIChat>({
  studentId:  { type: String, required: true, index: true },
  sessionId:  { type: String, required: true },
  messages: [{
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  subject:   { type: String },
  language:  { type: String, enum: ['tamil', 'english', 'bilingual'], default: 'bilingual' },
}, { timestamps: true });

export const AIChat = mongoose.models.AIChat || mongoose.model<IAIChat>('AIChat', AIChatSchema);

// Digital Portfolio
export interface IPortfolio extends Document {
  studentId:  string;
  academics:  Array<{ title: string; grade: string; year: number; }>;
  projects:   Array<{ title: string; description: string; url?: string; }>;
  certificates: Array<{ name: string; issuedBy: string; date: Date; fileUrl?: string; }>;
  achievements: Array<{ title: string; description: string; date: Date; }>;
  digiLockerLinked: boolean;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>({
  studentId:        { type: String, required: true, unique: true },
  academics:        [{ title: String, grade: String, year: Number }],
  projects:         [{ title: String, description: String, url: String }],
  certificates:     [{ name: String, issuedBy: String, date: Date, fileUrl: String }],
  achievements:     [{ title: String, description: String, date: Date }],
  digiLockerLinked: { type: Boolean, default: false },
}, { timestamps: true });

export const Portfolio = mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);

// Wellness / Mood Tracking
export interface IWellness extends Document {
  studentId: string;
  mood: 'great' | 'good' | 'okay' | 'stressed' | 'tired';
  stressScore: number;
  notes?: string;
  counselingReferred: boolean;
  date: Date;
}
const WellnessSchema = new Schema<IWellness>({
  studentId: { type: String, required: true, index: true },

  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'stressed', 'tired'],
    required: true
  },

  stressScore: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },

  notes: {
    type: String
  },

  counselingReferred: {
    type: Boolean,
    default: false
  },

  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const Wellness = mongoose.models.Wellness || mongoose.model<IWellness>('Wellness', WellnessSchema);

// Learning Path
export interface ILearningPath extends Document {
  studentId:      string;
  weakSubjects:   string[];
  weakChapters:   Array<{ subject: string; chapter: string; score: number; }>;
  studyPlan:      Array<{ day: string; tasks: string[]; }>;
  weeklyGoals:    string[];
  updatedAt:      Date;
}

const LearningPathSchema = new Schema<ILearningPath>({
  studentId:    { type: String, required: true, unique: true },
  weakSubjects: [String],
  weakChapters: [{ subject: String, chapter: String, score: Number }],
  studyPlan:    [{ day: String, tasks: [String] }],
  weeklyGoals:  [String],
}, { timestamps: true });

export const LearningPath = mongoose.models.LearningPath || mongoose.model<ILearningPath>('LearningPath', LearningPathSchema);

// ─── Super Admin Dynamic Page Management ──────────────────────

export interface IManagedPage extends Document {
  title: string;
  route: string;
  icon: string;
  roles: string[];
  portal: string;
  isEnabled: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ManagedPageSchema = new Schema<IManagedPage>({
  title: { type: String, required: true },
  route: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  roles: { type: [String], default: [] },
  portal: { type: String, default: 'STUDENT' },
  isEnabled: { type: Boolean, default: true },
  description: { type: String },
}, { timestamps: true });

export const ManagedPage = mongoose.models.ManagedPage || mongoose.model<IManagedPage>('ManagedPage', ManagedPageSchema);

// ─── AI Personal Guide self-care habits tracking & rewards ──────────

export interface IPersonalGuideHabitLog extends Document {
  studentId: string;
  date: string; // YYYY-MM-DD
  reflectionJournal?: string;
  screenTimeBreak: boolean;
  sleepHours: number;
  pointsEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalGuideHabitLogSchema = new Schema<IPersonalGuideHabitLog>({
  studentId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  reflectionJournal: { type: String },
  screenTimeBreak: { type: Boolean, default: false },
  sleepHours: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
}, { timestamps: true });

// Ensure unique habit logging per student per day
PersonalGuideHabitLogSchema.index({ studentId: 1, date: 1 }, { unique: true });

export const PersonalGuideHabitLog = mongoose.models.PersonalGuideHabitLog || mongoose.model<IPersonalGuideHabitLog>('PersonalGuideHabitLog', PersonalGuideHabitLogSchema);

export interface IPersonalGuideReward extends Document {
  studentId: string;
  points: number;
  streak: number;
  badges: string[];
  lastLoggedDate?: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

const PersonalGuideRewardSchema = new Schema<IPersonalGuideReward>({
  studentId: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  lastLoggedDate: { type: String },
}, { timestamps: true });

export const PersonalGuideReward = mongoose.models.PersonalGuideReward || mongoose.model<IPersonalGuideReward>('PersonalGuideReward', PersonalGuideRewardSchema);

// Board Prep Progress & Goals
export interface IBoardPrep extends Document {
  studentId: string;
  class: string; // "9" or "10"
  syllabusProgress: Array<{
    subject: string;
    completed: number;
    totalChapters: number;
  }>;
  goals: Array<{
    task: string;
    done: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const BoardPrepSchema = new Schema<IBoardPrep>({
  studentId: { type: String, required: true, index: true },
  class: { type: String, required: true },
  syllabusProgress: [{
    subject: { type: String, required: true },
    completed: { type: Number, required: true },
    totalChapters: { type: Number, required: true }
  }],
  goals: [{
    task: { type: String, required: true },
    done: { type: Boolean, default: false }
  }]
}, { timestamps: true });

BoardPrepSchema.index({ studentId: 1, class: 1 }, { unique: true });

export const BoardPrep = mongoose.models.BoardPrep || mongoose.model<IBoardPrep>('BoardPrep', BoardPrepSchema);

// Language Coaching Progress
export interface ILanguageCoachingProgress extends Document {
  studentId: string;
  sentencesSpoken: number;
  newWordsCount: number;
  grammarScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const LanguageCoachingProgressSchema = new Schema<ILanguageCoachingProgress>({
  studentId: { type: String, required: true, unique: true },
  sentencesSpoken: { type: Number, default: 0 },
  newWordsCount: { type: Number, default: 0 },
  grammarScore: { type: Number, default: 80 }
}, { timestamps: true });

export const LanguageCoachingProgress = mongoose.models.LanguageCoachingProgress || mongoose.model<ILanguageCoachingProgress>('LanguageCoachingProgress', LanguageCoachingProgressSchema);


// ─── Personal Guide Task & Response Models ────────────────────────────────────

export interface IPersonalGuideTask extends Document {
  teacherId: string;
  studentId: string;
  schoolId: string;
  title: string;
  question: string;
  taskType: 'reflection' | 'goal' | 'question' | 'custom';
  status: 'pending' | 'answered' | 'reviewed';
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalGuideTaskSchema = new Schema<IPersonalGuideTask>({
  teacherId:  { type: String, required: true, index: true },
  studentId:  { type: String, required: true, index: true },
  schoolId:   { type: String, required: true, index: true },
  title:      { type: String, required: true },
  question:   { type: String, required: true },
  taskType:   { type: String, enum: ['reflection', 'goal', 'question', 'custom'], default: 'question' },
  status:     { type: String, enum: ['pending', 'answered', 'reviewed'], default: 'pending' },
  dueDate:    { type: String },
}, { timestamps: true });

export const PersonalGuideTask = mongoose.models.PersonalGuideTask || mongoose.model<IPersonalGuideTask>('PersonalGuideTask', PersonalGuideTaskSchema);


export interface IPersonalGuideResponse extends Document {
  taskId: string;
  studentId: string;
  teacherId: string;
  responseText: string;
  teacherFeedback?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

const PersonalGuideResponseSchema = new Schema<IPersonalGuideResponse>({
  taskId:          { type: String, required: true, index: true },
  studentId:       { type: String, required: true },
  teacherId:       { type: String, required: true },
  responseText:    { type: String, required: true },
  teacherFeedback: { type: String },
  submittedAt:     { type: Date, default: Date.now },
  reviewedAt:      { type: Date },
});

export const PersonalGuideResponse = mongoose.models.PersonalGuideResponse || mongoose.model<IPersonalGuideResponse>('PersonalGuideResponse', PersonalGuideResponseSchema);

// ─── Digital Library AI Study Companion Cache ──────────────────────

export interface ILibraryCompanion extends Document {
  resourceId: string;
  summary: string;
  keyPoints: string[];
  formulas: string[];
  mindMap: string;
  examQuestions: Array<{
    question: string;
    answerKey: string;
    marks: number;
  }>;
  flashcards?: Array<{
    id: string;
    front: string;
    back: string;
  }>;
  visualMindMap?: {
    topic: string;
    branches: Array<{
      title: string;
      details: string[];
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LibraryCompanionSchema = new Schema<ILibraryCompanion>({
  resourceId:    { type: String, required: true, unique: true, index: true },
  summary:       { type: String, required: true },
  keyPoints:     { type: [String], default: [] },
  formulas:      { type: [String], default: [] },
  mindMap:       { type: String, default: "" },
  examQuestions: [{
    question:    { type: String, required: true },
    answerKey:   { type: String, required: true },
    marks:       { type: Number, default: 1 }
  }],
  flashcards:    { type: [Schema.Types.Mixed], default: [] },
  visualMindMap: { type: Schema.Types.Mixed, default: null }
}, { timestamps: true });

export const LibraryCompanion = mongoose.models.LibraryCompanion || mongoose.model<ILibraryCompanion>('LibraryCompanion', LibraryCompanionSchema);

// ─── Digital Library Flashcard Bookmarks ───────────────────────────

export interface IFlashcardBookmark extends Document {
  studentId: string;
  resourceId: string;
  flashcardId: string;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardBookmarkSchema = new Schema<IFlashcardBookmark>({
  studentId:   { type: String, required: true, index: true },
  resourceId:  { type: String, required: true, index: true },
  flashcardId: { type: String, required: true },
  front:       { type: String, required: true },
  back:        { type: String, required: true }
}, { timestamps: true });

// Ensure uniqueness of a bookmark per student per resource per flashcard
FlashcardBookmarkSchema.index({ studentId: 1, resourceId: 1, flashcardId: 1 }, { unique: true });

export const FlashcardBookmark = mongoose.models.FlashcardBookmark || mongoose.model<IFlashcardBookmark>('FlashcardBookmark', FlashcardBookmarkSchema);

// ─── Student Digital Library Learning Progress ─────────────────────

export interface ILibraryProgress extends Document {
  studentId: string;
  resourceId: string;
  resourceTitle: string;
  subject: string;
  type: string;
  lastChapter: string;
  progressPercent: number;
  timeSpentSeconds: number;
  lastOpenedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LibraryProgressSchema = new Schema<ILibraryProgress>({
  studentId:        { type: String, required: true, index: true },
  resourceId:       { type: String, required: true, index: true },
  resourceTitle:    { type: String, required: true },
  subject:          { type: String, required: true },
  type:             { type: String, required: true },
  lastChapter:      { type: String, default: "Summary" },
  progressPercent:  { type: Number, default: 0, min: 0, max: 100 },
  timeSpentSeconds: { type: Number, default: 0 },
  lastOpenedAt:     { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique progress tracking per student per resource
LibraryProgressSchema.index({ studentId: 1, resourceId: 1 }, { unique: true });

export const LibraryProgress = mongoose.models.LibraryProgress || mongoose.model<ILibraryProgress>('LibraryProgress', LibraryProgressSchema);
