import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User store
interface UserState {
  userId: string | null;
  email: string | null;
  name: string | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  setUser: (user: {
    userId: string;
    email: string;
    name: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
  }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      name: null,
      subscriptionTier: 'free',
      subscriptionStatus: 'inactive',
      setUser: (user) =>
        set({
          userId: user.userId,
          email: user.email,
          name: user.name,
          subscriptionTier: user.subscriptionTier || 'free',
          subscriptionStatus: user.subscriptionStatus || 'inactive',
        }),
      clearUser: () =>
        set({
          userId: null,
          email: null,
          name: null,
          subscriptionTier: 'free',
          subscriptionStatus: 'inactive',
        }),
    }),
    {
      name: 'user-storage',
    }
  )
);

// Enrollment and progress store
interface EnrollmentState {
  enrollments: any[];
  currentEnrollment: any | null;
  progress: Record<string, any>; // lessonId -> progress data
  setEnrollments: (enrollments: any[]) => void;
  setCurrentEnrollment: (enrollment: any) => void;
  updateProgress: (lessonId: string, progressData: any) => void;
  clearProgress: () => void;
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set) => ({
      enrollments: [],
      currentEnrollment: null,
      progress: {},
      setEnrollments: (enrollments) => set({ enrollments }),
      setCurrentEnrollment: (enrollment) => set({ currentEnrollment: enrollment }),
      updateProgress: (lessonId, progressData) =>
        set((state) => ({
          progress: { ...state.progress, [lessonId]: progressData },
        })),
      clearProgress: () => set({ enrollments: [], currentEnrollment: null, progress: {} }),
    }),
    {
      name: 'enrollment-storage',
    }
  )
);

// Quiz store
interface QuizState {
  currentQuiz: any | null;
  answers: Record<string, string>; // questionId -> answer
  score: number | null;
  quizStartTime: number | null;
  setCurrentQuiz: (quiz: any) => void;
  setAnswer: (questionId: string, answer: string) => void;
  setScore: (score: number) => void;
  startQuiz: () => void;
  clearQuiz: () => void;
}

export const useQuizStore = create<QuizState>()((set) => ({
  currentQuiz: null,
  answers: {},
  score: null,
  quizStartTime: null,
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
  setScore: (score) => set({ score }),
  startQuiz: () => set({ quizStartTime: Date.now(), answers: {}, score: null }),
  clearQuiz: () =>
    set({
      currentQuiz: null,
      answers: {},
      score: null,
      quizStartTime: null,
    }),
}));

// Bookmarks store
interface BookmarkState {
  bookmarks: any[];
  addBookmark: (bookmark: any) => void;
  removeBookmark: (lessonId: string) => void;
  setBookmarks: (bookmarks: any[]) => void;
  isBookmarked: (lessonId: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      addBookmark: (bookmark) =>
        set((state) => ({
          bookmarks: [...state.bookmarks, bookmark],
        })),
      removeBookmark: (lessonId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.lesson_id !== lessonId),
        })),
      setBookmarks: (bookmarks) => set({ bookmarks }),
      isBookmarked: (lessonId) => {
        const { bookmarks } = get();
        return bookmarks.some((b) => b.lesson_id === lessonId);
      },
    }),
    {
      name: 'bookmark-storage',
    }
  )
);

// UI store (for modals, notifications, etc.)
interface UIState {
  isEnrollModalOpen: boolean;
  isPricingModalOpen: boolean;
  isCertificateModalOpen: boolean;
  currentCertificate: any | null;
  openEnrollModal: () => void;
  closeEnrollModal: () => void;
  openPricingModal: () => void;
  closePricingModal: () => void;
  openCertificateModal: (certificate: any) => void;
  closeCertificateModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isEnrollModalOpen: false,
  isPricingModalOpen: false,
  isCertificateModalOpen: false,
  currentCertificate: null,
  openEnrollModal: () => set({ isEnrollModalOpen: true }),
  closeEnrollModal: () => set({ isEnrollModalOpen: false }),
  openPricingModal: () => set({ isPricingModalOpen: true }),
  closePricingModal: () => set({ isPricingModalOpen: false }),
  openCertificateModal: (certificate) =>
    set({ isCertificateModalOpen: true, currentCertificate: certificate }),
  closeCertificateModal: () =>
    set({ isCertificateModalOpen: false, currentCertificate: null }),
}));
