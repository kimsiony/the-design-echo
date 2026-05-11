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
  completedReadings: number[];
  unlockedItems: string[];
  createdAt: string;
}

export interface QuizResult {
  profileName: string;
  readingId: number;
  score: number;
  date: string;
}

interface AppState {
  profiles: UserProfile[];
  currentProfileName: string | null;
  user: UserProfile | null;
  isOnboarded: boolean;
  quizResults: QuizResult[];

  setUser: (user: UserProfile) => void;
  loginAs: (name: string) => void;
  logout: () => void;
  deleteProfile: (name: string) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  completeReading: (readingId: number) => void;
  addXP: (amount: number) => void;
  addStars: (amount: number) => void;
  unlockItem: (itemId: string) => void;
  saveQuizResult: (result: Omit<QuizResult, 'profileName'>) => void;
  resetProgress: () => void;
}

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

function syncProfile(profiles: UserProfile[], updated: UserProfile): UserProfile[] {
  const idx = profiles.findIndex((p) => p.name === updated.name);
  if (idx === -1) return [...profiles, updated];
  const next = [...profiles];
  next[idx] = updated;
  return next;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      currentProfileName: null,
      user: null,
      isOnboarded: false,
      quizResults: [],

      setUser: (user) => set((state) => ({
        user,
        currentProfileName: user.name,
        isOnboarded: true,
        profiles: syncProfile(state.profiles, user),
      })),

      loginAs: (name) => set((state) => {
        const profile = state.profiles.find((p) => p.name === name);
        if (!profile) return state;
        return { user: profile, currentProfileName: name, isOnboarded: true };
      }),

      logout: () => set({ user: null, currentProfileName: null }),

      deleteProfile: (name) => set((state) => {
        const profiles = state.profiles.filter((p) => p.name !== name);
        const isCurrent = state.currentProfileName === name;
        return {
          profiles,
          user: isCurrent ? null : state.user,
          currentProfileName: isCurrent ? null : state.currentProfileName,
          quizResults: state.quizResults.filter((q) => q.profileName !== name),
        };
      }),

      updateUser: (updates) => set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, ...updates };
        return {
          user: updated,
          profiles: syncProfile(state.profiles, updated),
        };
      }),

      completeReading: (readingId) => set((state) => {
        if (!state.user) return state;
        if (state.user.completedReadings.includes(readingId)) return state;

        const today = new Date().toISOString().split('T')[0];
        const lastRead = state.user.lastReadDate;

        let newStreak = state.user.streak;
        if (isToday(lastRead)) {
          // no change
        } else if (isYesterday(lastRead)) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        let xpGain = XP_PER_READING;
        let starGain = STARS_PER_READING;
        if (newStreak > 1) {
          xpGain += STREAK_BONUS_XP;
          starGain += STREAK_BONUS_STARS;
        }

        const newXP = state.user.xp + xpGain;
        const updated: UserProfile = {
          ...state.user,
          completedReadings: [...state.user.completedReadings, readingId],
          xp: newXP,
          level: calculateLevel(newXP),
          stars: state.user.stars + starGain,
          streak: newStreak,
          lastReadDate: today,
        };
        return { user: updated, profiles: syncProfile(state.profiles, updated) };
      }),

      addXP: (amount) => set((state) => {
        if (!state.user) return state;
        const newXP = state.user.xp + amount;
        const updated = { ...state.user, xp: newXP, level: calculateLevel(newXP) };
        return { user: updated, profiles: syncProfile(state.profiles, updated) };
      }),

      addStars: (amount) => set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, stars: state.user.stars + amount };
        return { user: updated, profiles: syncProfile(state.profiles, updated) };
      }),

      unlockItem: (itemId) => set((state) => {
        if (!state.user) return state;
        if (state.user.unlockedItems.includes(itemId)) return state;
        const updated = { ...state.user, unlockedItems: [...state.user.unlockedItems, itemId] };
        return { user: updated, profiles: syncProfile(state.profiles, updated) };
      }),

      saveQuizResult: (result) => set((state) => ({
        quizResults: [
          ...state.quizResults,
          { ...result, profileName: state.currentProfileName ?? '' },
        ],
      })),

      resetProgress: () => set({
        profiles: [],
        currentProfileName: null,
        user: null,
        isOnboarded: false,
        quizResults: [],
      }),
    }),
    {
      name: 'bible-adventure-storage',
      version: 2,
      migrate: (persisted: any, version) => {
        if (!persisted) return persisted;
        if (version < 2) {
          const profiles: UserProfile[] = persisted.user ? [persisted.user] : [];
          return {
            ...persisted,
            profiles,
            currentProfileName: persisted.user?.name ?? null,
            quizResults: (persisted.quizResults ?? []).map((q: any) => ({
              ...q,
              profileName: persisted.user?.name ?? '',
            })),
          };
        }
        return persisted;
      },
    }
  )
);

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
