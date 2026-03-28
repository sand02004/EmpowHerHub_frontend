import { Sidebar } from '../components/navigation/Sidebar';
import { Topbar } from '../components/navigation/Topbar';
import { useAuth } from '../hooks/useAuth';
import { Outlet } from 'react-router-dom';
import { MandatoryAssessment } from '../features/onboarding/MandatoryAssessment';

export const DashboardLayout = () => {
  const { role, logout, status, assessmentPassed } = useAuth();

  /* ── Onboarding / approval gating ─────────────────────────────────────
   *
   *  Flow:
   *   PENDING   → CompleteProfile   (all non-admin roles)
   *   IN_REVIEW → PendingApproval   (all non-admin roles)
   *   REJECTED  → Rejection screen  (all non-admin roles)
   *   APPROVED + woman + !assessmentPassed → MandatoryAssessment
   *   APPROVED (others)             → normal dashboard
   */
  if (role !== 'admin') {
    if (status === 'REJECTED') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-rose-50 px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-12 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">
              ❌
            </div>
            <h1 className="text-3xl font-black text-red-600 mb-3">Account Rejected</h1>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              Your profile application was reviewed and declined by our administrative team.
              Please contact support if you believe this is a mistake.
            </p>
            <button
              onClick={logout}
              className="px-8 py-3 bg-gray-900 font-bold text-white rounded-xl shadow-md hover:bg-black transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      );
    }

    // Only women take the mandatory skills assessment
    if (role === 'woman' && status === 'APPROVED' && !assessmentPassed) {
      return <MandatoryAssessment />;
    }
  }

  return (
    <div className="flex h-screen bg-[#F8F9FB] overflow-hidden font-sans">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar role={role} onLogout={logout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
