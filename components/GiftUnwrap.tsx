'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { getPublicShare } from '@/lib/backend';
import { extractShareSlug, publicShareToSceneObjects } from '@/lib/gifts';
import { useAppStore } from '@/lib/store';

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

interface GiftUnwrapProps {
  initialSlug?: string;
}

export default function GiftUnwrap({ initialSlug = '' }: GiftUnwrapProps) {
  const [slugInput, setSlugInput] = useState(initialSlug);
  const [lookupSlug, setLookupSlug] = useState(initialSlug);
  const [isLoading, setIsLoading] = useState(Boolean(initialSlug));
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { currentPublicShare, setCurrentPublicShare } = useAppStore();

  useEffect(() => {
    if (!lookupSlug) {
      return;
    }

    setIsLoading(true);
    setError(null);

    getPublicShare(lookupSlug)
      .then((share) => {
        setCurrentPublicShare(share);
        setSlugInput(lookupSlug);
        setIsUnwrapped(Boolean(initialSlug));
      })
      .catch((err) => {
        setCurrentPublicShare(null);
        setError(err instanceof Error ? err.message : 'Could not load gift');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [initialSlug, lookupSlug, setCurrentPublicShare]);

  const objects = useMemo(
    () => (currentPublicShare ? publicShareToSceneObjects(currentPublicShare) : []),
    [currentPublicShare]
  );

  const handleLookup = async () => {
    const slug = extractShareSlug(slugInput);
    if (!slug) {
      setError('Enter a share slug or URL');
      return;
    }
    setLookupSlug(slug);
    router.push(`/share/${slug}`);
  };

  const handleUnwrap = async () => {
    if (!currentPublicShare) return;
    setIsUnwrapping(true);
    setTimeout(() => {
      setIsUnwrapping(false);
      setIsUnwrapped(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-slate-800/50">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
          Unwrap a Gift
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/my-gifts')} className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
            My Gifts
          </button>
          <button onClick={() => router.push('/studio')} className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
            Create Gift
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          {!currentPublicShare && !isLoading ? (
            <div className="max-w-xl mx-auto rounded-3xl border border-slate-700/50 bg-slate-900/70 p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Open a Shared Gift</h2>
              <p className="text-slate-400 mb-6">Paste a GiftGen share URL or slug to load the wrapped gift.</p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  placeholder="giftgen.mithrak.com/share/your-slug"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-white placeholder:text-slate-500"
                />
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <button
                  onClick={handleLookup}
                  className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 font-semibold text-white"
                >
                  Find Gift
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Finding a gift for you...</p>
            </div>
          ) : !isUnwrapped ? (
            <div className="text-center">
              <div
                className={`relative mx-auto mb-8 cursor-pointer transition-all duration-500 ${
                  isUnwrapping ? 'scale-110 animate-shake' : 'hover:scale-105'
                }`}
                onClick={!isUnwrapping ? handleUnwrap : undefined}
              >
                <div className="w-48 h-48 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-2xl shadow-rose-500/30" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-full bg-gradient-to-b from-amber-400 to-amber-500" />
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-6 bg-gradient-to-r from-amber-400 to-amber-500" />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="w-12 h-12 bg-amber-400 rounded-full shadow-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">{currentPublicShare?.title || 'A Mystery Gift'}</h2>
              <p className="text-slate-400 mb-6">
                From {currentPublicShare?.owner_display_name || 'Another GiftGen creator'}
              </p>

              <button
                onClick={handleUnwrap}
                disabled={isUnwrapping}
                className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-rose-500/25"
              >
                {isUnwrapping ? 'Unwrapping…' : 'Click to Unwrap'}
              </button>
            </div>
          ) : (
            <div className="w-full">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">Surprise!</h2>
                <p className="text-slate-400">Here&apos;s what was inside &quot;{currentPublicShare?.title}&quot;</p>
              </div>

              <div className="h-[500px] rounded-2xl overflow-hidden mb-6">
                <Scene3D viewOnly objects={objects} />
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={() => router.push('/unwrap')}
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-semibold rounded-xl transition-all"
                >
                  Find Another Gift
                </button>
                <button
                  onClick={() => router.push('/studio')}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
                >
                  Create Your Own
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
