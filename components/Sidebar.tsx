'use client';

import { useEffect, useRef, useState } from 'react';

import { createCreation, waitForCreationReady } from '@/lib/backend';
import { creationToSceneObjects, deriveGiftTitle } from '@/lib/gifts';
import { useAppStore } from '@/lib/store';

interface SidebarProps {
  onWrapGift: () => void;
}

export default function Sidebar({ onWrapGift }: SidebarProps) {
  const [prompt, setPrompt] = useState('');
  const {
    user,
    session,
    sceneObjects,
    setSceneObjects,
    clearSceneObjects,
    currentCreation,
    setCurrentCreation,
    isGenerating,
    setIsGenerating,
    generationProgress,
    setGenerationProgress,
  } = useAppStore();

  const isSubmittingRef = useRef(false);
  const currentGift = sceneObjects.length > 0 ? sceneObjects[sceneObjects.length - 1] : null;

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        const next = prev + Math.random() * 3;
        return next < 90 ? next : 90;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating, setGenerationProgress]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !user || isGenerating || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    clearSceneObjects();
    setCurrentCreation(null);
    setIsGenerating(true);
    setGenerationProgress(5);

    try {
      const title = deriveGiftTitle(prompt);
      const envelope = await createCreation(prompt.trim(), title, { user, session });
      setCurrentCreation(envelope.creation);

      const readyCreation = await waitForCreationReady(
        envelope.creation.id,
        envelope.job.id,
        { user, session },
        setGenerationProgress
      );

      setCurrentCreation(readyCreation);
      setSceneObjects(creationToSceneObjects(readyCreation));
    } catch (error) {
      console.error('Generation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate gift. Please try again.');
      setGenerationProgress(0);
    } finally {
      setIsGenerating(false);
      isSubmittingRef.current = false;
    }
  };

  const handleRegenerate = () => {
    if (currentGift?.prompt) {
      setPrompt(currentGift.prompt);
    }
    clearSceneObjects();
    setCurrentCreation(null);
    setGenerationProgress(0);
  };

  const handleDiscard = () => {
    clearSceneObjects();
    setCurrentCreation(null);
    setPrompt('');
    setGenerationProgress(0);
  };

  return (
    <div className="w-80 h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 flex flex-col">
      <div className="p-6 border-b border-slate-700/50">
        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Gift Creator
        </h2>
        <p className="text-sm text-slate-400 mt-1">Generate 3D gifts through the AWS backend and Modal worker</p>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {!currentGift ? (
          <>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Describe your gift
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A cute teddy bear with a bow tie..."
              className="w-full h-28 px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none transition-all"
              disabled={isGenerating}
            />

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || !user}
              className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Generating... {Math.round(generationProgress)}%</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Gift</span>
                </>
              )}
            </button>

            {isGenerating && (
              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            )}

            {!isGenerating && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm">Describe your gift above</p>
                  <p className="text-slate-600 text-xs mt-1">The backend will queue a Modal generation job</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">Gift Ready!</h3>
                  <p className="text-slate-400 text-sm truncate">{currentCreation?.title || currentGift.name}</p>
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-4 text-center">
              Like what you see? Share it as a gift.
            </p>

            <div className="space-y-3 mt-auto">
              <button
                onClick={onWrapGift}
                className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span>Wrap as Gift</span>
              </button>

              <button
                onClick={handleRegenerate}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Regenerate</span>
              </button>

              <button
                onClick={handleDiscard}
                className="w-full py-2 px-4 text-slate-400 hover:text-red-400 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Discard &amp; Start Over</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
