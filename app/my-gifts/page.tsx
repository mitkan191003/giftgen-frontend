'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { creationToSceneObjects } from '@/lib/gifts';
import { listCreations } from '@/lib/backend';
import { useAppStore } from '@/lib/store';
import type { CreationRecord } from '@/types/database';

const Scene3D = dynamic(() => import('@/components/Scene3D'), { ssr: false });

export default function MyGiftsPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCreation, setSelectedCreation] = useState<CreationRecord | null>(null);
  const router = useRouter();
  const { user, session, creations, setCreations } = useAppStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/');
    }
  }, [mounted, router, user]);

  useEffect(() => {
    if (!user) return;

    listCreations({ user, session })
      .then((items) => {
        setCreations(items);
        if (!selectedCreation && items.length > 0) {
          setSelectedCreation(items[0]);
        }
      })
      .catch((error) => {
        console.error('Error loading creations:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [session, setCreations, user]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/studio')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="h-8 w-px bg-slate-700" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            My Gifts
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/studio')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Gift</span>
          </button>
          <button
            onClick={() => router.push('/unwrap')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span>Unwrap</span>
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 border-r border-slate-800/50 bg-slate-900/30 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-medium text-slate-400 mb-4">
              Created Gifts ({creations.length})
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : creations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">No gifts yet</p>
                <p className="text-slate-600 text-xs mt-1">Generate a gift in the studio to see it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {creations.map((creation) => (
                  <button
                    key={creation.id}
                    onClick={() => setSelectedCreation(creation)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      selectedCreation?.id === creation.id
                        ? 'bg-purple-500/20 border border-purple-500/50'
                        : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{creation.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">
                          {creation.status}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(creation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-6">
          {selectedCreation ? (
            <div className="h-full flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCreation.title}</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {selectedCreation.final_prompt}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCreation(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 rounded-2xl overflow-hidden border border-slate-700/50">
                <Scene3D viewOnly objects={creationToSceneObjects(selectedCreation)} />
              </div>

              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
                <span><span className="text-slate-400">Drag:</span> Rotate</span>
                <span><span className="text-slate-400">Right-drag:</span> Pan</span>
                <span><span className="text-slate-400">Scroll:</span> Zoom</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-800/50 flex items-center justify-center">
                  <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Select a Gift</h3>
                <p className="text-slate-400 text-sm">Choose one of your creations to inspect it in 3D</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
