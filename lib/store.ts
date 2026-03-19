'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  AppUser,
  AuthSession,
  CreationRecord,
  GiftObject,
  PublicShareRecord,
  ShareRecord,
} from '@/types/database';

interface AppState {
  user: AppUser | null;
  session: AuthSession | null;
  setAuth: (user: AppUser, session: AuthSession | null) => void;
  clearAuth: () => void;

  sceneObjects: GiftObject[];
  setSceneObjects: (objects: GiftObject[]) => void;
  addSceneObject: (object: GiftObject) => void;
  clearSceneObjects: () => void;

  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;

  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;

  generationProgress: number;
  setGenerationProgress: (value: number | ((current: number) => number)) => void;

  currentCreation: CreationRecord | null;
  setCurrentCreation: (creation: CreationRecord | null) => void;

  creations: CreationRecord[];
  setCreations: (creations: CreationRecord[]) => void;

  currentShare: ShareRecord | null;
  setCurrentShare: (share: ShareRecord | null) => void;

  currentPublicShare: PublicShareRecord | null;
  setCurrentPublicShare: (share: PublicShareRecord | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      setAuth: (user, session) => set({ user, session }),
      clearAuth: () =>
        set({
          user: null,
          session: null,
          currentCreation: null,
          currentShare: null,
          currentPublicShare: null,
          sceneObjects: [],
          selectedObjectId: null,
        }),

      sceneObjects: [],
      setSceneObjects: (objects) => set({ sceneObjects: objects }),
      addSceneObject: (object) =>
        set((state) => ({
          sceneObjects: [...state.sceneObjects, object],
        })),
      clearSceneObjects: () => set({ sceneObjects: [], selectedObjectId: null }),

      selectedObjectId: null,
      setSelectedObjectId: (id) => set({ selectedObjectId: id }),

      isGenerating: false,
      setIsGenerating: (value) => set({ isGenerating: value }),

      generationProgress: 0,
      setGenerationProgress: (value) =>
        set((state) => ({
          generationProgress: typeof value === 'function' ? value(state.generationProgress) : value,
        })),

      currentCreation: null,
      setCurrentCreation: (creation) => set({ currentCreation: creation }),

      creations: [],
      setCreations: (creations) => set({ creations }),

      currentShare: null,
      setCurrentShare: (share) => set({ currentShare: share }),

      currentPublicShare: null,
      setCurrentPublicShare: (share) => set({ currentPublicShare: share }),
    }),
    {
      name: 'giftgen-app-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);
