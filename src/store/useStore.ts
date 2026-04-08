import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES, ThemeType } from "../constants/themes";

export interface Example {
  sentence: string;
  translation: string;
}

export interface Word {
  id: string;
  word: string;
  translation: string;
  examples?: Example[]; 
  level: number;
  nextReview: number;
  history: { date: number; state: "easy" | "hard" }[];
}

interface AppState {
  words: Word[];
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  addWords: (newWords: any[]) => void;
  updateWordProgress: (id: string, success: boolean) => void;
  resetWords: () => void;
  deleteWord: (id: string) => void;
  streak: number;
  lastStudyDate: string | null;
  updateStreak: () => void;
}
const INTERVALS = [1, 7, 30, 90];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      words: [],
      theme: "emerald",
      streak: 0,
      lastStudyDate: null,

      setTheme: (theme) => set({ theme }),

      addWords: (jsonWords) =>
        set((state) => {
          const existingWords = new Set(state.words.map((w) => w.word.toLowerCase()));
          const filteredNewWords = jsonWords
            .filter((w) => !existingWords.has(w.word.toLowerCase()))
            .map((w) => ({
              ...w,
              id: Math.random().toString(36),
              level: 0,
              nextReview: Date.now(),
              history: [],
            }));
          return { words: [...state.words, ...filteredNewWords] };
        }),

      updateWordProgress: (id, success) =>
        set((state) => ({
          words: state.words.map((w) => {
            if (w.id === id) {
              const nextLevel = success 
                ? Math.min(w.level + 1, INTERVALS.length - 1) 
                : 0;

              const reviewOffset = success ? INTERVALS[w.level] : 0;

              return {
                ...w,
                level: nextLevel,
                nextReview: Date.now() + reviewOffset * 24 * 60 * 60 * 1000,
                history: [
                  ...w.history,
                  { date: Date.now(), state: success ? "easy" : "hard" },
                ],
              };
            }
            return w;
          }),
        })),

      updateStreak: () =>
        set((state) => {
          const today = new Date().toLocaleDateString();
          if (state.lastStudyDate === today) return state;

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toLocaleDateString();

          return {
            streak: state.lastStudyDate === yesterdayStr ? state.streak + 1 : 1,
            lastStudyDate: today,
          };
        }),

      resetWords: () => set({ words: [] }),
      deleteWord: (id) => set((state) => ({ words: state.words.filter((w) => w.id !== id) })),
    }),
    {
      name: "vocab-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);