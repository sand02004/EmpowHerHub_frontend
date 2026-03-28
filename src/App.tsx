import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardLayout } from './layouts/DashboardLayout';
import { SponsorDashboard } from './pages/dashboards/SponsorDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { WomanDashboard } from './pages/dashboards/WomanDashboard';
import { MentorDashboard } from './pages/dashboards/MentorDashboard';
import { Messages } from './pages/dashboards/Messages';
import { Profile } from './pages/dashboards/Profile';
import { OpportunitiesPage } from './features/opportunities/OpportunitiesPage';
import { MentorshipPage } from './features/mentorship/MentorshipPage';
import { TestsPage } from './features/tests/TestsPage';
import { useAuth } from './hooks/useAuth';
import type { Role } from './types';

const RoleDashboardRedirect = ({ role }: { role: Role }) => {
  const destination = role ?? 'woman';
  return <Navigate to={`/dashboard/${destination}`} replace />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  const { role } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white font-sans">
              {}
              <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 md:px-12 h-16 flex items-center justify-between">
                <span className="text-xl font-extrabold text-primary">EmpowHerHub</span>
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </nav>

              {}
              <div className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-28 px-6 md:px-12 border-b border-gray-100">
                <div className="max-w-6xl mx-auto text-center space-y-8">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                  Women in Tech — Empowered
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight">
                    Empowering Women<br />
                    <span className="text-primary">in Technology</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
                    Connect with world-class mentors, land life-changing opportunities,
                    and validate your skills through technical assessments — all in one place.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Link
                      to="/register"
                      className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
                    >
                      Start Your Journey →
                    </Link>
                    <Link
                      to="/login"
                      className="px-10 py-4 bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary rounded-2xl font-bold transition-all text-lg"
                    >
                      Sign In to Dashboard
                    </Link>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-primary py-16 text-white">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
                  <div className="py-4 md:py-0">
                    <p className="text-5xl font-black">10,000+</p>
                    <p className="text-white/70 font-bold uppercase tracking-widest mt-2 text-sm">Women Elevated</p>
                  </div>
                  <div className="py-4 md:py-0">
                    <p className="text-5xl font-black">500+</p>
                    <p className="text-white/70 font-bold uppercase tracking-widest mt-2 text-sm">Expert Mentors</p>
                  </div>
                  <div className="py-4 md:py-0">
                    <p className="text-5xl font-black">1,200+</p>
                    <p className="text-white/70 font-bold uppercase tracking-widest mt-2 text-sm">Opportunities Posted</p>
                  </div>
                </div>
              </div>

              {}
              <div className="py-28 px-6 max-w-6xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                    Built For Everyone
                  </h2>
                  <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                    Whether you want to learn, lead, or launch careers — EmpowHerHub
                    provides the complete infrastructure.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {}
                  <div className="group p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-white border border-primary/10 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">For Women</h3>
                    <ul className="space-y-2 text-gray-600 text-sm font-medium mb-6">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        Find & connect with expert mentors
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        Take technical skills assessments
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        Apply for scholarships & internships
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        Track all applications in one place
                      </li>
                    </ul>
                    <Link
                      to="/register"
                      className="block w-full text-center py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                    >
                      Join as a Woman in Tech
                    </Link>
                  </div>

                  {}
                  <div className="group p-8 rounded-3xl bg-gradient-to-br from-secondary/5 to-white border border-secondary/10 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">For Mentors</h3>
                    <ul className="space-y-2 text-gray-600 text-sm font-medium mb-6">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                        Review & accept mentorship requests
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                        Guide the next generation of engineers
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                        Manage active mentee relationships
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                        Communicate via built-in messaging
                      </li>
                    </ul>
                    <Link
                      to="/register"
                      className="block w-full text-center py-3 bg-secondary text-white rounded-xl font-bold text-sm hover:bg-secondary/90 transition-colors"
                    >
                      Join as a Mentor
                    </Link>
                  </div>

                  {}
                  <div className="group p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all">

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">For Sponsors</h3>
                    <ul className="space-y-2 text-gray-600 text-sm font-medium mb-6">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        Post internships, scholarships & jobs
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        Review incoming applications
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        Accept or reject with one click
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        Access a vetted talent pool
                      </li>
                    </ul>
                    <Link
                      to="/register"
                      className="block w-full text-center py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors"
                    >
                      Join as a Sponsor
                    </Link>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-gray-50 py-24 px-6">
                <div className="max-w-6xl mx-auto space-y-12">
                  <div className="text-center space-y-3">
                    <h2 className="text-4xl font-extrabold text-gray-900">Platform Features</h2>
                    <p className="text-gray-500 text-lg">Everything you need to grow, connect, and succeed.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {title: 'Smart Mentorship', desc: 'Get matched with industry experts aligned with your learning goals and tech stack.' },
                      {title: 'Opportunity Board', desc: 'Browse curated internships, scholarships, and job listings from top tech companies.' },
                      {title: 'Skills Assessments', desc: 'Take standardized tests that validate your technical knowledge to potential employers.' },
                      {title: 'Built-in Messaging', desc: 'Communicate directly with mentors and sponsors through a secure messaging system.' },
                      {title: 'Document Management', desc: 'Upload CVs, certificates, and IDs securely to complete your professional profile.' },
                      {title: 'Admin Oversight', desc: 'Platform integrity maintained through admin approval workflows for all user accounts.' },
                    ].map((f, i) => (
                      <div
                        key={i}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow"
                      >
                        <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {}
              <div className="py-24 px-6 text-center bg-gradient-to-r from-primary to-purple-600">
                <div className="max-w-2xl mx-auto space-y-6">
                  <h2 className="text-4xl font-extrabold text-white">Ready to get started?</h2>
                  <p className="text-purple-100 text-lg font-medium">
                    Join thousands of women building extraordinary tech careers today.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                    <Link
                      to="/register"
                      className="px-10 py-4 bg-white text-primary rounded-2xl font-black shadow-lg hover:shadow-xl transition-all text-lg"
                    >
                      Create Free Account
                    </Link>
                    <Link
                      to="/login"
                      className="px-10 py-4 border-2 border-white/40 text-white rounded-2xl font-bold hover:border-white transition-all text-lg"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>

              {}
              <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center">
                <p className="font-bold text-white text-lg mb-1">EmpowHerHub</p>
                <p className="text-sm">© 2026 EmpowHerHub. Empowering women in technology worldwide.</p>
              </footer>
            </div>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleDashboardRedirect role={role} />} />

          {}
          <Route path="woman" element={<WomanDashboard />} />
          <Route path="mentor" element={<MentorDashboard />} />
          <Route path="sponsor" element={<SponsorDashboard />} />
          <Route path="admin" element={<AdminDashboard />} />

          {}
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="mentorship" element={<MentorshipPage />} />
          <Route path="tests" element={<TestsPage />} />

          {}
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
