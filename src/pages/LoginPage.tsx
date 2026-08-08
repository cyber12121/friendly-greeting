import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Sparkles, BookOpen, Target, ArrowRight, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onContinue: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onContinue }) => {
  const { user, loginWithGoogle, logout, loading, error, clearError } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          B2 English Coach
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-xs mx-auto">
          AI-Powered CEFR B2 Mastery & Persistent Learner Analytics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <button
                  onClick={clearError}
                  className="text-[11px] underline text-rose-700 font-bold mt-1 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {user ? (
            /* Logged In State */
            <div className="space-y-6 text-center">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <p className="font-bold">Authenticated with Google</p>
                  <p className="text-slate-600 mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full border border-slate-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">{user.displayName || 'B2 Learner'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">UID: {user.uid.slice(0, 10)}...</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={onContinue}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Launch My Learning Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out State - Login Button */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-base font-bold text-slate-900">Sign in to your account</h3>
                <p className="text-xs text-slate-500">
                  Securely sync your CEFR scores, vocabulary progress, error logs, and AI session history to Cloud Firestore.
                </p>
              </div>

              {/* Google Sign-In Button */}
              <button
                onClick={loginWithGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 px-4 rounded-xl border border-slate-300 shadow-xs transition-all cursor-pointer hover:border-slate-400 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Isolated user data via Firestore security rules</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Automatic session history & score persistence</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cross-device access to grammar & vocabulary logs</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
