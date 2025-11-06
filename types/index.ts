// Course and Exam Types
export interface ExamData {
  id: string;
  name: string;
  fullName: string;
  description: string;
  duration: string;
  modules: number;
  totalLessons: number;
  practiceQuestions: number;
  studyHours: number;
  thumbnail: string;
}

export interface State {
  id: string;
  name: string;
  exams: ExamData[];
}

export interface ExamsIndex {
  states: State[];
}

export interface Module {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  quizQuestions: number;
}

export interface Course {
  courseId: string;
  title: string;
  description: string;
  modules: Module[];
}

export interface LessonSection {
  heading: string;
  content: string;
  image?: string;
  list?: string[];
}

export interface LessonContent {
  introduction: string;
  sections: LessonSection[];
  keyTakeaways: string[];
}

export interface Activity {
  title: string;
  instructions: string;
  tasks?: string[];
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  duration: string;
  content: LessonContent;
  activity: Activity;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface ModuleData {
  moduleId: string;
  lessons: Lesson[];
  quiz: Quiz;
}

// User and Progress Types
export interface UserProgress {
  userId: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  lastAccessed: Date;
  score?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'basic' | 'premium' | 'pro';
  createdAt: Date;
  progress: UserProgress[];
}

// Component Props Types
export interface ExamCardProps extends ExamData {
  stateId: string;
}

export interface PageParams {
  params: {
    stateId?: string;
    examId?: string;
    moduleId?: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
