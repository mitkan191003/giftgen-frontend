'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { exchangeCodeForSession } from '@/lib/auth';
import { useAppStore } from '@/lib/store';

export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAppStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const authError = searchParams.get('error_description') || searchParams.get('error');

    if (authError) {
      setError(authError);
      return;
    }

    if (!code) {
      setError('Missing authorization code');
      return;
    }

    exchangeCodeForSession(code)
      .then(({ user, session }) => {
        setAuth(user, session);
        router.replace('/studio');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to finish sign in');
      });
  }, [router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/50 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-3">Sign-in failed</h1>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => router.replace('/')}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 font-semibold text-white"
            >
              Back to home
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto mb-5 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2">Finishing sign in</h1>
            <p className="text-slate-400">Connecting your Cognito session to GiftGen…</p>
          </>
        )}
      </div>
    </div>
  );
}
