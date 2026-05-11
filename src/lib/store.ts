import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CharacterType = 'sheep' | 'lion' | 'rabbit' | 'explorer' | 'angel' | 'knight';

export interface UserProfile {
  name: string;
  character: CharacterType;
  level: number;
  xp: number;
  stars: number;
  streak: number;
  lastReadDate: string | null;
  completedReadings: number[]; // Array of reading IDs
  unlockedItems: string[];
  createdAt: string;
}

export interface QuizResult {
  readingId: number;
  score: number;
  date: string;
}

interface AppState {
  // User data
  user: UserProfile | null;
  isOnboarded: boolean;
  
  // Quiz history
  quizResults: QuizResult[];
  
  // Actions
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  completeReading: (readingId: number) => void;
  addXP: (amount: number) => void;
  addStars: (amount: number) => void;
  unlockItem: (itemId: string) => void;
  saveQuizResult: (result: QuizResult) => void;
  resetProgress: () => void;
}

// XP required for each level
export const XP_PER_LEVEL = 100;
export const XP_PER_READING = 20;
export const STARS_PER_READING = 5;
export const STREAK_BONUS_XP = 10;
export const STREAK_BONUS_STARS = 2;

function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function isToday(dateString: string | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isYesterday(dateString: string | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isOnboarded: false,
      quizResults: [],
      
      setUser: (user) => set({ user, isOnboarded: true }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      completeReading: (readingId) => set((state) => {
        if (!state.user) return state;
        
        // Check if already completed
        if (state.user.completedReadings.includes(readingId)) {
          return state;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const lastRead = state.user.lastReadDate;
        
        // Calculate streak
        let newStreak = state.user.streak;
        if (isToday(lastRead)) {
          // Already read today, no streak change
        } else if (isYesterday(lastRead)) {
          // Consecutive day, increase streak
          newStreak += 1;
        } else {
          // Streak broken, start new
          newStreak = 1;
        }
        
        // Calculate XP and stars
        let xpGain = XP_PER_READING;
        let starGain = STARS_PER_READING;
        
        // Streak bonus
        if (newStreak > 1) {
          xpGain += STREAK_BONUS_XP;
          starGain += STREAK_BONUS_STARS;
        }
        
        const newXP = state.user.xp + xpGain;
        const newLevel = calculateLevel(newXP);
        
        return {
          user: {
            ...state.user,
            completedReadings: [...state.user.completedReadings, readingId],
            xp: newXP,
            level: newLevel,
            stars: state.user.stars + starGain,
            streak: newStreak,
            lastReadDate: today,
          }
        };
      }),
      
      addXP: (amount) => set((state) => {
        if (!state.user) return state;
        const newXP = state.user.xp + amount;
        return {
          user: {
            ...state.user,
            xp: newXP,
            level: calculateLevel(newXP),
          }
        };
      }),
      
      addStars: (amount) => set((state) => {
        if (!state.user) return state;
        return {
          user: {
            ...state.user,
            stars: state.user.stars + amount,
          }
        };
      }),
      
      unlockItem: (itemId) => set((state) => {
        if (!state.user) return state;
        if (state.user.unlockedItems.includes(itemId)) return state;
        return {
          user: {
            ...state.user,
            unlockedItems: [...state.user.unlockedItems, itemId],
          }
        };
      }),
      
      saveQuizResult: (result) => set((state) => ({
        quizResults: [...state.quizResults, result]
      })),
      
      resetProgress: () => set({
        user: null,
        isOnboarded: false,
        quizResults: [],
      }),
    }),
    {
      name: 'bible-adventure-storage',
    }
  )
);

// Character emoji mappings
export const characterEmojis: Record<CharacterType, string> = {
  sheep: '🐑',
  lion: '🦁',
  rabbit: '🐰',
  explorer: '🧭',
  angel: '👼',
  knight: '⚔️',
};

export const characterNames: Record<CharacterType, string> = {
  sheep: '양',
  lion: '사자',
  rabbit: '토끼',
  explorer: '탐험가',
  angel: '천사',
  knight: '기사',
};

export const characterColors: Record<CharacterType, string> = {
  sheep: 'bg-[oklch(0.95_0.03_90)]',
  lion: 'bg-[oklch(0.9_0.14_60)]',
  rabbit: 'bg-[oklch(0.92_0.08_350)]',
  explorer: 'bg-[oklch(0.85_0.12_150)]',
  angel: 'bg-[oklch(0.92_0.08_230)]',
  knight: 'bg-[oklch(0.88_0.08_280)]',
};
