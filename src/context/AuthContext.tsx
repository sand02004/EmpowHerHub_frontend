import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { Role } from '../types';

export type { Role };

interface AuthContextValue {
  role: Role;
  token: string | null;
  user: any | null;
  status: string;
  assessmentPassed: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
  login: (role: Role, jwtToken?: string) => void;
  logout: () => void;
  submitProfileForReview: () => void;
  simulateAdminApproval: () => void;
  markAssessmentPassed: () => void;
  markAssessmentFailed: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem('empowher_role') as Role) || null,
  );
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token'),
  );
  const [statusOverride, setStatusOverride] = useState<string | null>(null);
  const [assessmentOverride, setAssessmentOverride] = useState<boolean>(
    () => localStorage.getItem('empowher_assessment') === 'true'
  );

  /* ── login ─────────────────────────────────────────────────────────────── */
  const login = useCallback(
    (newRole: Role, jwtToken?: string) => {
      if (!jwtToken) return;
      localStorage.setItem('empowher_role', newRole!);
      setRole(newRole);
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
    },
    [],
  );

  /* ── logout ─────────────────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    ['empowher_role', 'token', 'empowher_assessment'].forEach((k) =>
      localStorage.removeItem(k),
    );
    setRole(null);
    setToken(null);
    setStatusOverride(null);
    setAssessmentOverride(false);
  }, []);

  const submitProfileForReview = useCallback(() => setStatusOverride('IN_REVIEW'), []);
  const simulateAdminApproval = useCallback(() => setStatusOverride('APPROVED'), []);
  const markAssessmentPassed = useCallback(() => {
    localStorage.setItem('empowher_assessment', 'true');
    setAssessmentOverride(true);
  }, []);
  const markAssessmentFailed = useCallback(() => logout(), [logout]);

  /* ── JWT decode ─────────────────────────────────────────────────────────── */
  const decoded = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode(token) as any;
    } catch {
      return null;
    }
  }, [token]);

  const value: AuthContextValue = {
    role: decoded?.role || role,
    token,
    user: decoded,
    status: statusOverride || decoded?.status || 'PENDING',
    assessmentPassed: assessmentOverride || !!decoded?.assessmentPassed,
    isAuthenticated: !!token,
    isDemo: false,
    login,
    logout,
    submitProfileForReview,
    simulateAdminApproval,
    markAssessmentPassed,
    markAssessmentFailed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
