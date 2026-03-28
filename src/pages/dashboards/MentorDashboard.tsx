import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, MessageSquare, Plus } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import type { MentorshipApplication, Mentorship, MentorshipProgram } from '../../types';

export const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MentorshipApplication[]>([]);
  const [mentees, setMentees] = useState<Mentorship[]>([]);
  const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newProgram, setNewProgram] = useState({ title: '', description: '', slots: 5, duration: '' });

  useEffect(() => {
    if (!user?.sub) return;
    const fetchData = async () => {
      try {
        const [reqRes, activeRes, progRes] = await Promise.all([
          api.get(`/mentorship/mentor/${user.sub}/requests`),
          api.get(`/mentorship/mentor/${user.sub}/mentees`),
          api.get(`/mentorship/programs/mentor/${user.sub}`)
        ]);
        setRequests(reqRes.data);
        setMentees(activeRes.data);
        setPrograms(progRes.data);
      } catch (err) {
        console.error('Failed to load mentor dashboard data', err);
      }
    };
    fetchData();
  }, [user?.sub]);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/mentorship/programs', { ...newProgram, mentorId: user?.sub });
      setPrograms([res.data, ...programs]);
      setNewProgram({ title: '', description: '', slots: 5, duration: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create program', err);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/mentorship/${id}/status`, { status });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
      if (status === 'APPROVED') {
        const req = requests.find(r => r.id === id);
        if (req) {
          setMentees(prev => [...prev, {
            id: req.id,
            mentorId: user!.sub,
            womanId: req.womanId,
            womanName: req.womanName,
            womanInitials: req.womanInitials,
            startDate: new Date().toLocaleDateString()
          } as any]);
        }
      }
    } catch (err) {
      console.error('Failed to review request', err);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-secondary to-teal-500 p-8 rounded-2xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mentor Environment</h1>
          <p className="mt-1 text-teal-100 font-medium">Create programs, review requests, and guide your active mentees.</p>
        </div>
        <Button 
          variant="primary" 
          className="bg-white text-secondary hover:bg-teal-50 border-none shadow-lg"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-5 w-5 mr-2" /> {showForm ? 'Cancel' : 'New Program'}
        </Button>
      </div>

      {showForm && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Launch New Mentorship Program</h2>
          </div>
          <form onSubmit={handleCreateProgram} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Program Title"
                placeholder="e.g. Cloud Architecture Masterclass"
                value={newProgram.title}
                onChange={e => setNewProgram({...newProgram, title: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Available Slots"
                  type="number"
                  value={newProgram.slots}
                  onChange={e => setNewProgram({...newProgram, slots: parseInt(e.target.value)})}
                  required
                />
                <Input
                  label="Duration"
                  placeholder="e.g. 3 months"
                  value={newProgram.duration}
                  onChange={e => setNewProgram({...newProgram, duration: e.target.value})}
                  required
                />
              </div>
            </div>
            <Textarea
              label="Description & Curriculum"
              placeholder="What will your mentees learn?"
              rows={4}
              value={newProgram.description}
              onChange={e => setNewProgram({...newProgram, description: e.target.value})}
              required
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" className="px-8">
                Publish Program
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* Your Programs */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-500" />
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">Your Programs</h2>
        </div>
        {programs.length === 0 ? (
          <EmptyState icon={Users} title="No programs launched" description="Launch your first mentorship program to start accepting applicants." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-6 gap-4">
            {programs.map((prog: MentorshipProgram) => (
              <div key={prog.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 leading-tight">{prog.title}</h3>
                  <Badge status={prog.status === 'OPEN' ? 'APPROVED' : 'REJECTED'} />
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{prog.description}</p>
                <div className="mt-2 flex items-center justify-between text-xs font-semibold text-gray-400">
                  <span>{prog.slots} slots available</span>
                  <span className="text-secondary">{prog._count?.applications || 0} applicants</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Mentees" value={mentees.length} icon={Users} accent="secondary" />
        <StatCard label="Pending Requests" value={pendingCount} icon={Clock} accent="amber" />
        <StatCard label="Total Requests" value={requests.length} icon={CheckCircle} accent="primary" />
        <StatCard label="Messages" value={5} icon={MessageSquare} accent="rose" />
      </div>

      {/* Mentorship Requests */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">Mentorship Requests</h2>
          </div>
          {pendingCount > 0 && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <EmptyState icon={Users} title="No requests yet" description="New mentorship applications will appear here." />
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((req: MentorshipApplication) => (
              <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm shrink-0">
                    {req.womanInitials}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{req.womanName}</h3>
                      <Badge status={req.status} />
                    </div>
                    <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 max-w-lg">
                      "{req.message}"
                    </p>
                    <p className="text-xs text-gray-400 font-medium">Received {req.createdAt}</p>
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
                      Accept & Establish Link
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
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">Active Mentees</h2>
        </div>

        {mentees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No active mentees yet"
            description="Accept an incoming request above to start a mentorship session."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {mentees.map((m: Mentorship) => (
              <div key={m.id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary font-black text-sm">
                    {m.womanInitials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{m.womanName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Mentorship started {m.startDate}</p>
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
