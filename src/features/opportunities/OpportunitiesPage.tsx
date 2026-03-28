import React, { useState, useEffect } from 'react';
import { PlusCircle, Briefcase, Users, Clock, Trash2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../hooks/useAuth';
import type { Opportunity, OpportunityApplication, CreateOpportunityForm, OpportunityType } from '../../types';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';

export const getUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return (jwtDecode(token) as any).sub; } catch { return null; }
};

const OPPORTUNITY_TYPES = [
  { value: 'Internship', label: 'Internship' },
  { value: 'Scholarship', label: 'Scholarship' },
  { value: 'Training', label: 'Training' },
  { value: 'Job', label: 'Job' },
];

const EMPTY_FORM: CreateOpportunityForm = {
  title: '',
  type: 'Internship',
  description: '',
  requirements: '',
  deadline: '',
};

// ── Woman View ────────────────────────────────────────────────────────────────

const WomanOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [applyModal, setApplyModal] = useState<{ open: boolean; opportunity: any | null; }>({ open: false, opportunity: null });
  const [coverLetter, setCoverLetter] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ coverLetter?: string }>({});

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const res = await api.get('/opportunities');
        setOpportunities(res.data);
      } catch (err) { console.error(err); }
    };
    const fetchApps = async () => {
      const uId = getUserId();
      if (!uId) return;
      try {
        const res = await api.get(`/opportunities/user-applications/${uId}`);
        setApplications(res.data);
      } catch (err) { console.error(err); }
    };
    fetchOpps();
    fetchApps();
  }, []);

  const validate = () => {
    const e: { coverLetter?: string } = {};
    if (!coverLetter.trim()) e.coverLetter = 'Cover letter is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !applyModal.opportunity) return;
    try {
      const res = await api.post('/opportunities/apply', {
        opportunityId: applyModal.opportunity.id,
        applicantId: getUserId()!,
        coverLetter
      });
      setApplications([{ ...res.data, opportunity: applyModal.opportunity }, ...applications]);
      closeModal();
    } catch(err) { console.error(err); }
  };

  const closeModal = () => {
    setApplyModal({ open: false, opportunity: null });
    setCoverLetter('');
    setErrors({});
    setAttachment(null);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary to-purple-500 p-8 rounded-2xl text-white">
        <h1 className="text-3xl font-extrabold tracking-tight">Opportunities</h1>
        <p className="mt-1 text-purple-100 font-medium">
          Browse internships, scholarships, jobs, and training curated for women in tech.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Available" value={opportunities.length} icon={Briefcase} accent="primary" />
        <StatCard label="My Applications" value={applications.length} icon={Users} accent="secondary" />
        <StatCard
          label="Accepted"
          value={applications.filter((a) => a.status === 'APPROVED').length}
          icon={CheckCircle}
          accent="amber"
        />
      </div>

      {/* Opportunities Table */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">
            All Opportunities
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="text-left px-6 py-3">Title</th>
                <th className="text-left px-6 py-3">Type</th>
                <th className="text-left px-6 py-3">Sponsor</th>
                <th className="text-left px-6 py-3">Deadline</th>
                <th className="text-left px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{opp.title}</td>
                  <td className="px-6 py-4">
                    <Badge status={opp.type} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{opp.sponsorName || (opp.sponsor ? `${opp.sponsor.firstName} ${opp.sponsor.lastName}` : '—')}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {new Date(opp.deadline).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="primary"
                      className="text-xs py-1.5 px-3"
                      onClick={() => setApplyModal({ open: true, opportunity: opp })}
                    >
                      Apply Now
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* My Applications */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">
            My Applications
          </h2>
        </div>
        {applications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="Apply to opportunities above to see them here."
          />
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
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {app.opportunityTitle || app.opportunity?.title}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Apply Modal */}
      <Modal
        isOpen={applyModal.open}
        onClose={closeModal}
        title={`Apply: ${applyModal.opportunity?.title ?? ''}`}
        size="md"
      >
        <form onSubmit={handleApply} className="space-y-5">
          <Textarea
            label="Cover Letter"
            placeholder="Tell us why you're the perfect candidate..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            error={errors.coverLetter}
            className="min-h-[150px]"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment (optional)
            </label>
            <input
              type="file"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
              onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ── Sponsor View ──────────────────────────────────────────────────────────────

const SponsorOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<Record<string, any[]>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateOpportunityForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<CreateOpportunityForm>>({});
  const [expandedOppId, setExpandedOppId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsorOpps = async () => {
      try {
        const uId = getUserId();
        if (!uId) return;
        const res = await api.get('/opportunities');
        const myOpps = res.data.filter((o: any) => o.sponsorId === uId);
        setOpportunities(myOpps);
        
        const applicantsMap: Record<string, any[]> = {};
        for (const opp of myOpps) {
          const appRes = await api.get(`/opportunities/${opp.id}/applications`);
          applicantsMap[opp.id] = appRes.data;
        }
        setApplicants(applicantsMap);
      } catch (err) { console.error(err); }
    };
    fetchSponsorOpps();
  }, []);

  const totalApplicants = opportunities.reduce((acc, opp) => acc + (opp.applicantsCount ?? 0), 0);

  const validateForm = () => {
    const e: Partial<CreateOpportunityForm> = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.requirements.trim()) e.requirements = 'Required';
    if (!form.deadline) e.deadline = 'Required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await api.post('/opportunities', {
        ...form,
        sponsorId: getUserId()!,
        deadline: new Date(form.deadline!).toISOString(),
      });
      setOpportunities([res.data, ...opportunities]);
      setApplicants({ ...applicants, [res.data.id]: [] });
      setForm(EMPTY_FORM);
      setFormErrors({});
      setModalOpen(false);
    } catch(err) { console.error(err); }
  };

  const handleDelete = (id: string) => {
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    if (expandedOppId === id) setExpandedOppId(null);
  };

  const handleReview = async (oppId: string, appId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post(`/opportunities/applications/${appId}/status`, { status });
      setApplicants((prev) => ({
        ...prev,
        [oppId]: prev[oppId].map((a) => (a.id === appId ? { ...a, status } : a)),
      }));
    } catch(err) { console.error(err); }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Opportunity Management
          </h1>
          <p className="text-gray-500 mt-1">
            Create, manage, and review applicants for your opportunities.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} variant="primary" className="shrink-0">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Active Postings" value={opportunities.length} icon={Briefcase} accent="primary" />
        <StatCard label="Total Applicants" value={totalApplicants} icon={Users} accent="secondary" />
        <StatCard
          label="Accepted"
          value={Object.values(applicants).flat().filter((a) => a.status === 'APPROVED').length}
          icon={CheckCircle}
          accent="amber"
        />
      </div>

      {/* Opportunities List */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">
            My Opportunities
          </h2>
        </div>
        {opportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No opportunities yet"
            description="Create your first opportunity using the button above."
            actionLabel="Add Opportunity"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {opportunities.map((opp) => {
              const isExpanded = expandedOppId === opp.id;
              const oppApplicants = applicants[opp.id] ?? [];
              return (
                <div key={opp.id}>
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg">{opp.title}</h3>
                        <Badge status={opp.type} />
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{opp.description}</p>
                      <p className="text-xs text-gray-400 font-medium">
                        Deadline: {new Date(opp.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        className="text-center bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedOppId(isExpanded ? null : opp.id)
                        }
                      >
                        <span className="text-2xl font-black text-primary block leading-none">
                          {opp.applicantsCount ?? oppApplicants.length}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mt-0.5">
                          Applicants
                        </span>
                        <span className="text-xs text-primary font-bold mt-1 flex items-center justify-center gap-0.5">
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                          {isExpanded ? 'Hide' : 'View'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(opp.id)}
                        className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Delete opportunity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Applicants Sub-table */}
                  {isExpanded && (
                    <div className="bg-gray-50/80 border-t border-gray-100 px-6 pb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest py-4">
                        Applicants for "{opp.title}"
                      </p>
                      {oppApplicants.length === 0 ? (
                        <p className="text-sm text-gray-400 pb-4">
                          No applications received yet.
                        </p>
                      ) : (
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <th className="text-left px-5 py-3">Applicant</th>
                                <th className="text-left px-5 py-3">Applied On</th>
                                <th className="text-left px-5 py-3">Status</th>
                                <th className="text-left px-5 py-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {oppApplicants.map((app) => (
                                <tr
                                  key={app.id}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                        {app.applicant?.firstName?.[0]}{app.applicant?.lastName?.[0]}
                                      </div>
                                      <span className="font-semibold text-gray-900">
                                        {app.applicant?.firstName} {app.applicant?.lastName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-gray-500">
                                    {new Date(app.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-5 py-4">
                                    <Badge status={app.status} />
                                  </td>
                                  <td className="px-5 py-4">
                                    {app.status === 'PENDING' && (
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          className="text-xs py-1 px-3 border-red-200 text-red-600 hover:bg-red-50"
                                          onClick={() =>
                                            handleReview(opp.id, app.id, 'REJECTED')
                                          }
                                        >
                                          Reject
                                        </Button>
                                        <Button
                                          variant="primary"
                                          className="text-xs py-1 px-3"
                                          onClick={() =>
                                            handleReview(opp.id, app.id, 'APPROVED')
                                          }
                                        >
                                          Accept
                                        </Button>
                                      </div>
                                    )}
                                    {app.status !== 'PENDING' && (
                                      <span className="text-xs text-gray-400">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Opportunity Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setForm(EMPTY_FORM);
          setFormErrors({});
        }}
        title="Post New Opportunity"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Title"
              placeholder="e.g., Cloud Engineering Intern"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              error={formErrors.title}
              required
            />
            <Select
              label="Type"
              options={OPPORTUNITY_TYPES}
              value={form.type}
              onChange={(e) =>
                setForm((p) => ({ ...p, type: e.target.value as OpportunityType }))
              }
            />
          </div>
          <Textarea
            label="Description"
            placeholder="Describe the role and its impact..."
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            error={formErrors.description}
            required
            className="min-h-[110px]"
          />
          <Textarea
            label="Requirements"
            placeholder="e.g., 2+ years React, strong communication..."
            value={form.requirements}
            onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))}
            error={formErrors.requirements}
            required
          />
          <Input
            label="Application Deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
            error={formErrors.deadline}
            required
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setForm(EMPTY_FORM);
                setFormErrors({});
              }}
            >
              Discard
            </Button>
            <Button type="submit" variant="primary">
              Publish Live
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ── Admin View ────────────────────────────────────────────────────────────────

const AdminOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    api.get('/opportunities').then(res => setOpportunities(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          All Opportunities
        </h1>
        <p className="text-gray-500 mt-1">Platform-wide overview of all posted opportunities.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Opportunities"
          value={opportunities.length}
          icon={Briefcase}
          accent="primary"
        />
        <StatCard
          label="Total Applicants"
          value={opportunities.reduce((s, o) => s + (o.applicantsCount ?? 0), 0)}
          icon={Users}
          accent="secondary"
        />
        <StatCard
          label="Active Sponsors"
          value={new Set(opportunities.map((o) => o.sponsorId)).size}
          icon={CheckCircle}
          accent="amber"
        />
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">
            Opportunities
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="text-left px-6 py-3">Title</th>
                <th className="text-left px-6 py-3">Type</th>
                <th className="text-left px-6 py-3">Sponsor</th>
                <th className="text-left px-6 py-3">Applicants</th>
                <th className="text-left px-6 py-3">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{opp.title}</td>
                  <td className="px-6 py-4">
                    <Badge status={opp.type} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{opp.sponsorName || (opp.sponsor ? `${opp.sponsor.firstName} ${opp.sponsor.lastName}` : '—')}</td>
                  <td className="px-6 py-4 font-bold text-primary">
                    {opp.applicantsCount ?? 0}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(opp.deadline).toLocaleDateString()}</td>
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

export const OpportunitiesPage: React.FC = () => {
  const { role } = useAuth();
  if (role === 'sponsor') return <SponsorOpportunities />;
  if (role === 'admin') return <AdminOpportunities />;
  return <WomanOpportunities />;
};
