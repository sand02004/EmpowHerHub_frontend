import React, { useState, useEffect } from 'react';
import { Briefcase, Users, BookOpen, FileText, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import type { Opportunity, OpportunityApplication, MentorshipApplication, MentorshipProgram } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

// ────────────────────────────────────────────────────────────────────────────

export const WomanDashboard: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
  const [myApplications, setMyApplications] = useState<OpportunityApplication[]>([]);
  const [mentorshipApplications, setMentorshipApplications] = useState<MentorshipApplication[]>([]);

  // Apply opportunity modal
  const [applyModal, setApplyModal] = useState<{ open: boolean; opportunity: Opportunity | null }>({ open: false, opportunity: null });
  const [coverLetter, setCoverLetter] = useState('');

  // Apply mentorship modal
  const [programModal, setProgramModal] = useState<{ open: boolean; program: MentorshipProgram | null }>({ open: false, program: null });
  const [mentorMessage, setMentorMessage] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [oppsRes, progsRes, appsRes, mentorAppsRes] = await Promise.all([
          api.get('/opportunities').catch((e) => { console.error('Opps Error:', e); return { data: [] }; }),
          api.get('/mentorship/programs').catch((e) => { console.error('Progs Error:', e); return { data: [] }; }),
          api.get(`/opportunities/user-applications/${user?.sub}`).catch((e) => { console.error('Apps Error:', e); return { data: [] }; }),
          api.get(`/mentorship/mentee/${user?.sub}`).catch((e) => { console.error('MentorApps Error:', e); return { data: [] }; })
        ]);
        setOpportunities(oppsRes.data);
        setPrograms(progsRes.data);
        setMyApplications(appsRes.data);
        setMentorshipApplications(mentorAppsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, []);

  const handleApplyOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!applyModal.opportunity) return;
      await api.post('/opportunities/apply', {
        opportunityId: applyModal.opportunity.id,
        applicantId: user?.sub,
        coverLetter
      });
      // Optionally re-fetch applications or optimistically update
      setMyApplications(prev => [...prev, {
        id: Date.now().toString(),
        opportunityId: applyModal.opportunity!.id,
        opportunity: applyModal.opportunity,
        userId: user?.sub,
        coverLetter,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      } as any]);
    } catch (err) {
      console.error('Failed to apply for opportunity', err);
    }
    setApplyModal({ open: false, opportunity: null });
    setCoverLetter('');
  };

  const handleApplyMentorship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!programModal.program) return;
      await api.post('/mentorship/apply', {
        programId: programModal.program.id,
        mentorId: programModal.program.mentorId,
        menteeId: user?.sub,
        message: mentorMessage
      });
      setMentorshipApplications(prev => [...prev, {
        id: Date.now().toString(),
        programId: programModal.program!.id,
        programTitle: programModal.program!.title,
        womanId: user?.sub,
        message: mentorMessage,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      } as any]);
    } catch (err) {
      console.error('Failed to request mentorship', err);
    }
    setProgramModal({ open: false, program: null });
    setMentorMessage('');
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-purple-500 p-8 rounded-2xl text-white">
        <h1 className="text-3xl font-extrabold tracking-tight">Your Empowerment Journey</h1>
        <p className="mt-1 text-purple-100 font-medium">Track your applications, skill tests, and mentorship — all in one place.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="My Applications" value={myApplications.length} icon={FileText} accent="primary" />
        <StatCard label="Tests Completed" value={1} icon={BookOpen} accent="secondary" />
        <StatCard label="Active Mentorships" value={0} icon={Users} accent="amber" />
        <StatCard label="New Messages" value={0} icon={CheckCircle} accent="rose" />
      </div>

      {/* Available Opportunities */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">Available Opportunities</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {opportunities.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No opportunities currently available.</div>
          ) : opportunities.map((opp) => (
            <div key={opp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{opp.title}</h3>
                  <Badge status={opp.type} />
                </div>
                <p className="text-sm text-gray-500">{opp.sponsorName}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Deadline: {opp.deadline}</span>
                </div>
              </div>
              <Button
                variant="primary"
                className="shrink-0"
                onClick={() => setApplyModal({ open: true, opportunity: opp })}
              >
                Apply Now
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Available Mentorship Programs */}
      <section>
        <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest mb-4">Available Mentorship Programs</h2>
        {programs.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm bg-gray-50 rounded-2xl border border-gray-200">No mentorship programs available at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {programs.map((prog) => (
            <div key={prog.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 hover:shadow-sm transition-shadow flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 leading-tight">{prog.title}</h3>
                <Badge status="APPROVED" />
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
        )}
      </section>

      {/* My Applications Table */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">My Applications</h2>
        </div>
        {myApplications.length === 0 ? (
          <EmptyState icon={Briefcase} title="No applications yet" description="Apply to opportunities above to see them here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="text-left px-6 py-3">Opportunity</th>
                  <th className="text-left px-6 py-3">Applied On</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myApplications.map((app: any) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{app.opportunity?.title || 'Unknown Opportunity'}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><Badge status={app.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Mentorship Applications */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">My Mentorship Requests</h2>
        </div>
        {mentorshipApplications.length === 0 ? (
          <EmptyState icon={Users} title="No mentorship requests yet" />
        ) : (
          <div className="divide-y divide-gray-100">
            {mentorshipApplications.map((ma: any) => (
              <div key={ma.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{ma.mentor?.firstName} {ma.mentor?.lastName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Sent {new Date(ma.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge status={ma.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Apply to Opportunity Modal */}
      <Modal
        isOpen={applyModal.open}
        onClose={() => setApplyModal({ open: false, opportunity: null })}
        title={`Apply: ${applyModal.opportunity?.title ?? ''}`}
        size="md"
      >
        <form onSubmit={handleApplyOpportunity} className="space-y-5">
          <Textarea
            label="Cover Letter"
            placeholder="Tell us why you're the perfect candidate..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            required
            className="min-h-[150px]"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setApplyModal({ open: false, opportunity: null })}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Application</Button>
          </div>
        </form>
      </Modal>

      {/* Apply for Mentorship Modal */}
      <Modal
        isOpen={programModal.open}
        onClose={() => setProgramModal({ open: false, program: null })}
        title={`Apply for Program: ${programModal.program?.title ?? ''}`}
        size="md"
      >
        <form onSubmit={handleApplyMentorship} className="space-y-5">
          <Textarea
            label="Your Message"
            placeholder="Introduce yourself and explain why you want to join this program..."
            value={mentorMessage}
            onChange={(e) => setMentorMessage(e.target.value)}
            required
            className="min-h-[130px]"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setProgramModal({ open: false, program: null })}>Cancel</Button>
            <Button type="submit" variant="primary">Send Application</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
