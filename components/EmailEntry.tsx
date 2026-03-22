'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { beginCognitoLogin, createDevelopmentUser, isCognitoConfigured, isDevelopmentAuthMode } from '@/lib/auth';
import { useAppStore } from '@/lib/store';

export default function EmailEntry() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, setAuth } = useAppStore();

  useEffect(() => {
    if (user) {
      router.replace('/studio');
    }
  }, [router, user]);

  const handleDevelopmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    const developmentUser = createDevelopmentUser(email);
    setAuth(developmentUser, null);
    router.push('/studio');
  };

  const handleCognitoLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await beginCognitoLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start Cognito login');
      setIsLoading(false);
    }
  };

  const showDevelopmentFallback = isDevelopmentAuthMode();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          >
            <div className="relative w-12 h-12 transform rotate-12">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg shadow-lg" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full bg-gradient-to-b from-amber-400 to-amber-500" />
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-400 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-2xl shadow-emerald-500/30 mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent mb-3">
            GiftGen
          </h1>
          <p className="text-slate-400 text-lg">
            Generate, wrap, and share AI gifts in a 3D studio
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          {isCognitoConfigured() ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Sign in with Cognito</h2>
                <p className="text-slate-400 text-sm">
                  Use the hosted AWS sign-in flow for the real environment path.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCognitoLogin}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 text-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Redirecting…</span>
                  </>
                ) : (
                  <>
                    <span>Continue with Cognito</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleDevelopmentSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Enter your email to get started
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-4 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-lg"
                  disabled={isLoading}
                />
                <p className="mt-3 text-xs text-slate-500">
                  Cognito is not configured, so the frontend is using development auth.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 text-lg"
              >
                <span>Start Creating</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>
          )}

          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          Reference frontend ported to the current AWS, Modal, and Cognito stack
        </p>
      </div>
    </div>
  );
}
