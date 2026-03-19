'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createShare } from '@/lib/backend';
import { useAppStore } from '@/lib/store';

interface WrapGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WrapGiftModal({ isOpen, onClose }: WrapGiftModalProps) {
  const [shareType, setShareType] = useState<'unlisted' | 'public'>('unlisted');
  const [isWrapping, setIsWrapping] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const router = useRouter();
  const { user, session, currentCreation, sceneObjects, setCurrentShare } = useAppStore();

  const handleWrap = async () => {
    if (!user || !currentCreation) return;

    setIsWrapping(true);

    try {
      const share = await createShare(currentCreation.id, shareType, { user, session });
      setCurrentShare(share);
      setShareUrl(share.public_url);
    } catch (error) {
      console.error('Error wrapping gift:', error);
      alert(error instanceof Error ? error.message : 'Failed to share gift. Please try again.');
    } finally {
      setIsWrapping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!isWrapping ? onClose : undefined} />

      <div className="relative bg-slate-900 rounded-3xl p-8 w-full max-w-md mx-4 border border-slate-700/50 shadow-2xl">
        {shareUrl ? (
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center animate-bounce">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Gift Wrapped!</h3>
            <p className="text-slate-400 mb-5">Your share link is ready.</p>
            <div className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-left break-all text-sm text-slate-200">
              {shareUrl}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all"
              >
                Copy Link
              </button>
              <button
                onClick={() => router.push(`/share/${shareUrl.split('/').pop()}`)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-semibold rounded-xl transition-all"
              >
                Open Share
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={onClose}
              disabled={isWrapping}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-xl transform rotate-3 transition-transform hover:rotate-0">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-full bg-gradient-to-b from-amber-400 to-amber-500" />
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-3 bg-gradient-to-r from-amber-400 to-amber-500" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="w-6 h-6 bg-amber-400 rounded-full shadow" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-800 rounded-full px-3 py-1 border border-slate-600">
                  <span className="text-sm text-emerald-400 font-medium">{sceneObjects.length} items</span>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white text-center mb-2">Wrap Your Gift</h3>
            <p className="text-slate-400 text-center mb-6">
              Publish {currentCreation?.title ? `"${currentCreation.title}"` : 'your gift'} with a shareable link
            </p>

            <div className="mb-6 space-y-3">
              <button
                onClick={() => setShareType('unlisted')}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                  shareType === 'unlisted'
                    ? 'border-emerald-500/60 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="text-white font-medium">Unlisted Share</div>
                <div className="text-sm text-slate-400">Only people with the link can unwrap it</div>
              </button>
              <button
                onClick={() => setShareType('public')}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                  shareType === 'public'
                    ? 'border-rose-500/60 bg-rose-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="text-white font-medium">Public Share</div>
                <div className="text-sm text-slate-400">Visible as a public gift once discovery exists</div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isWrapping}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWrap}
                disabled={isWrapping || !currentCreation}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isWrapping ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Wrapping…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    <span>Create Share Link</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
