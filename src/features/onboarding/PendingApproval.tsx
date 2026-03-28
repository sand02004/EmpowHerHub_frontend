import React from 'react';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const PendingApproval: React.FC = () => {
  const { logout, simulateAdminApproval, isDemo } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex flex-col items-center justify-center px-4">
      {/* Background blobs */}
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-amber-200/20 rounded-full filter blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-orange-200/20 rounded-full filter blur-3xl" />

      <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-10 max-w-lg w-full text-center relative z-10">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Clock className="w-12 h-12 text-amber-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-gray-900 mb-3">Profile Under Review</h1>
        <p className="text-gray-500 text-base leading-relaxed mb-6">
          Thank you for completing your profile! Our administrative team is carefully reviewing your
          details to ensure the quality of our network. This usually takes 24–48 hours.
        </p>

        {/* Status timeline */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 text-xs font-black">✓</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600">Registered</span>
          </div>
          <div className="flex-1 h-0.5 bg-emerald-200" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 text-xs font-black">✓</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600">Profile Done</span>
          </div>
          <div className="flex-1 h-0.5 bg-amber-200" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center animate-pulse">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-xs font-semibold text-amber-600">In Review</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-black">4</span>
            </div>
            <span className="text-xs font-semibold text-gray-400">Approved</span>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
          <p className="text-amber-800 text-sm font-semibold">
            📧 You will receive an email notification once your profile is approved or if we need
            additional information.
          </p>
        </div>

        {/* Demo shortcut */}
        {isDemo && (
          <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 mb-6">
            <p className="text-violet-700 text-xs font-bold mb-3 uppercase tracking-widest">
              🧪 Demo Mode — Simulate Admin Approval
            </p>
            <button
              onClick={simulateAdminApproval}
              className="w-full py-3 bg-gradient-to-r from-primary to-violet-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Approve My Account (Demo)
            </button>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 mx-auto text-gray-400 hover:text-gray-600 transition-colors text-sm font-semibold"
        >
          <LogOut className="h-4 w-4" />
          Sign out for now
        </button>
      </div>
    </div>
  );
};
