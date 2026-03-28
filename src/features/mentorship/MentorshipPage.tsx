import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, MessageSquare, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../hooks/useAuth';

import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';

export const getUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return (jwtDecode(token) as any).sub; } catch { return null; }
};

// ── Woman View ────────────────────────────────────────────────────────────────

const WomanMentorship: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [programModal, setProgramModal] = useState<{ open: boolean; program: any | null; }>({ open: false, program: null });
  const [message, setMessage] = useState('');
  const [msgError, setMsgError] = useState('');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get('/mentorship/programs');
        setPrograms(res.data);
      } catch (err) { console.error(err); }
    };
    const fetchApps = async () => {
      const uId = getUserId();
      if (!uId) return;
      try {
        const res = await api.get(`/mentorship/mentee/${uId}`);
        setApplications(res.data);
      } catch (err) { console.error(err); }
    };
    fetchPrograms();
    fetchApps();
  }, []);

  const initials = (f?: string, l?: string) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase();

  const closeModal = () => {
    setProgramModal({ open: false, program: null });
    setMessage('');
    setMsgError('');
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setMsgError('Please write a message to the mentor.');
      return;
    }
    if (!programModal.program) return;
    try {
      const res = await api.post('/mentorship/apply', {
        programId: programModal.program.id,
        mentorId: programModal.program.mentorId, // actual mentor's ID
        menteeId: getUserId()!,
        message
      });
      setApplications([{ ...res.data, mentor: { firstName: programModal.program.mentorFirstName, lastName: programModal.program.mentorLastName } }, ...applications]);
      closeModal();
    } catch(err) { console.error(err); }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary to-purple-500 p-8 rounded-2xl text-white">
        <h1 className="text-3xl font-extrabold tracking-tight">Mentorship</h1>
        <p className="mt-1 text-purple-100 font-medium">
          Connect with experienced industry mentors who will guide your tech career.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Available Programs" value={programs.length} icon={Users} accent="primary" />
        <StatCard label="My Applications" value={applications.length} icon={Clock} accent="secondary" />
        <StatCard
          label="Active Mentorships"
          value={applications.filter((a) => a.status === 'APPROVED').length}
          icon={CheckCircle}
          accent="amber"
        />
      </div>

      {/* Mentor Cards */}
      <section>
        <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest mb-4">
          Available Mentorship Programs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 hover:shadow-sm transition-shadow flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm shrink-0">
                  {initials(prog.mentorFirstName, prog.mentorLastName)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {prog.title}
                  </p>
                  <p className="text-xs text-gray-400">Mentor: {prog.mentorFirstName} {prog.mentorLastName}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">{prog.description}</p>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mt-auto">
                <span>{prog.slots} slots available</span>
                <span className="text-primary">{prog.duration}</span>
              </div>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setProgramModal({ open: true, program: prog })}
              >
                Apply for Program
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* My Applications */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">
            My Mentorship Applications
          </h2>
        </div>
        {applications.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applications yet"
            description="Apply to a mentor above to track your requests here."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {applications.map((app) => (
              <div
                key={app.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-bold text-gray-900">{app.mentorName || (app.mentor ? `${app.mentor.firstName} ${app.mentor.lastName}` : 'Mentor')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Sent {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Apply Modal */}
      <Modal
        isOpen={programModal.open}
        onClose={closeModal}
        title={`Apply to Program: ${programModal.program?.title ?? ''}`}
        size="md"
      >
        <form onSubmit={handleApply} className="space-y-5">
          <Textarea
            label="Your Message"
            placeholder="Introduce yourself and explain what you'd like to learn..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (msgError) setMsgError('');
            }}
            error={msgError}
            required
            className="min-h-[130px]"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ── Mentor View ───────────────────────────────────────────────────────────────

const MentorMentorship: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [mentees, setMentees] = useState<any[]>([]);

  useEffect(() => {
    const fetchMentorData = async () => {
      const uId = getUserId();
      if (!uId) return;
      try {
        const reqs = await api.get(`/mentorship/mentor/${uId}/requests`);
        setRequests(reqs.data);
        const active = await api.get(`/mentorship/mentor/${uId}/mentees`);
        setMentees(active.data);
      } catch (err) { console.error(err); }
    };
    fetchMentorData();
  }, []);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/mentorship/${id}/status`, { status });
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch(err) { console.error(err); }
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const initials = (f?: string, l?: string) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase();

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-secondary to-teal-500 p-8 rounded-2xl text-white">
        <h1 className="text-3xl font-extrabold tracking-tight">Mentorship Management</h1>
        <p className="mt-1 text-teal-100 font-medium">
          Review incoming requests and manage your active mentee connections.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Mentees" value={mentees.length} icon={Users} accent="secondary" />
        <StatCard label="Pending" value={pendingCount} icon={Clock} accent="amber" />
        <StatCard label="Total Requests" value={requests.length} icon={CheckCircle} accent="primary" />
        <StatCard label="Messages" value={5} icon={MessageSquare} accent="rose" />
      </div>

      {/* Requests */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">
              Incoming Requests
            </h2>
          </div>
          {pendingCount > 0 && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        {requests.length === 0 ? (
          <EmptyState icon={Users} title="No requests yet" description="New applications will appear here." />
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm shrink-0">
                    {initials(req.mentee?.firstName, req.mentee?.lastName)}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{req.mentee?.firstName} {req.mentee?.lastName}</h3>
                      <Badge status={req.status} />
                    </div>
                    <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 max-w-lg">
                      "{req.message}"
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      Received {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {req.status === 'PENDING' && (
                  <div className="flex gap-3 shrink-0">
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      onClick={() => handleReview(req.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleReview(req.id, 'APPROVED')}
                    >
                      Accept & Link
                    </Button>
                  </div>
                )}
                {req.status === 'APPROVED' && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Linked
                  </span>
                )}
                {req.status === 'REJECTED' && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                    Rejected
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Mentees */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">
            Active Mentees
          </h2>
        </div>
        {mentees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No active mentees yet"
            description="Accept an incoming request to start a mentorship."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {mentees.map((m) => (
              <div
                key={m.id}
                className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary font-black text-sm">
                    {initials(m.mentee?.firstName, m.mentee?.lastName)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{m.mentee?.firstName} {m.mentee?.lastName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Mentorship started {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" className="text-primary font-semibold">
                  <MessageSquare className="h-4 w-4 mr-1.5" /> Message
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// ── Admin View ────────────────────────────────────────────────────────────────

const AdminMentorship: React.FC = () => {
  const [allRequests, setAllRequests] = useState<any[]>([]);

  useEffect(() => {
    api.get('/mentorship').then(res => setAllRequests(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Mentorship Overview
        </h1>
        <p className="text-gray-500 mt-1">Platform-wide mentorship activity and connections.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Requests" value={allRequests.length} icon={Users} accent="primary" />
        <StatCard
          label="Accepted"
          value={allRequests.filter((r) => r.status === 'APPROVED').length}
          icon={Clock}
          accent="amber"
        />
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">
            All Mentorship Requests
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="text-left px-6 py-3">Mentee</th>
                <th className="text-left px-6 py-3">Mentor</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {req.mentee?.firstName} {req.mentee?.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{req.mentor?.firstName} {req.mentor?.lastName}</td>
                  <td className="px-6 py-4">
                    <Badge status={req.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// ── Root export ───────────────────────────────────────────────────────────────

export const MentorshipPage: React.FC = () => {
  const { role } = useAuth();
  if (role === 'mentor') return <MentorMentorship />;
  if (role === 'admin') return <AdminMentorship />;
  return <WomanMentorship />;
};
