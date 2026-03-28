import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { Role } from '../types';

/* ── Feature bullets for left panel ───────────────────────────────────── */
const FEATURES = [
  { text: 'Mentorship from world-class professionals' },
  { text: 'Scholarships, internships & job opportunities' },
  { text: 'Skills assessments that validate your expertise' },
  { text: 'Built-in messaging with mentors & sponsors' },
];

export const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const successMsg = location.state?.message;

  /* ── Real API login ───────────────────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user } = res.data;
      const { role, dashboardPath } = user;
      
      login(role as Role, access_token);
      
      // Navigate to the dashboard path provided by the backend
      const targetPath = dashboardPath || `/dashboard/${role.toLowerCase()}`;
      navigate(targetPath);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] bg-gradient-to-br from-primary-dark via-primary to-violet-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-400/10 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-lg">E</div>
            <span className="text-white font-black text-2xl tracking-tight">EmpowHerHub</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-violet-200 text-sm font-bold uppercase tracking-widest mb-4">Women in Technology</p>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
              Your gateway to a <br />
              <span className="text-violet-200">thriving tech career</span>
            </h1>
            <p className="text-violet-200 mt-4 text-lg leading-relaxed max-w-sm">
              Connect, grow, and succeed with mentors, sponsors, and a community that believes in you.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-violet-100 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-8 pt-4 border-t border-white/10">
            {[
              { n: '10K+', l: 'Women' },
              { n: '500+', l: 'Mentors' },
              { n: '1.2K+', l: 'Opportunities' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-white font-black text-2xl">{s.n}</p>
                <p className="text-violet-300 text-xs font-bold uppercase tracking-wider">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-violet-300 text-xs">© 2026 EmpowHerHub. Empowering women in tech.</p>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 bg-white text-center sm:text-left">
        <div className="lg:hidden mb-8 flex items-center justify-center sm:justify-start gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-black">E</div>
          <span className="font-black text-xl text-primary">EmpowHerHub</span>
        </div>

        <div className="max-w-md w-full mx-auto lg:mx-0 space-y-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1 font-medium">Sign in with your credentials to access your portal.</p>
          </div>

          {successMsg && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-left">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in…' : <><LogIn className="h-4 w-4" /> Sign In</>}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:text-primary-dark">Create one — it's free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
