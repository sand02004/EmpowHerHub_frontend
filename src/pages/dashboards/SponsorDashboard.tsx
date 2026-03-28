import React, { useState, useEffect } from 'react';
import { Briefcase, Users, PlusCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import type { Opportunity, OpportunityApplication, CreateOpportunityForm, OpportunityType } from '../../types';

const OPPORTUNITY_TYPES: { value: string; label: string }[] = [
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

export const SponsorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applicants, setApplicants] = useState<Record<string, OpportunityApplication[]>>({});

  useEffect(() => {
    if (!user?.sub) return;
    const fetchData = async () => {
      try {
        const [oppsRes, appsRes] = await Promise.all([
          api.get(`/opportunities/sponsor/${user.sub}`),
          api.get(`/opportunities/sponsor/${user.sub}/applications`)
        ]);
        
        setOpportunities(oppsRes.data);
        
        const grouped: Record<string, OpportunityApplication[]> = {};
        appsRes.data.forEach((app: any) => {
          const mappedApp: OpportunityApplication = {
            id: app.id,
            opportunityId: app.opportunityId,
            applicantId: app.applicantId,
            applicantName: `${app.applicant.firstName} ${app.applicant.lastName}`,
            applicantInitials: `${app.applicant.firstName[0]}${app.applicant.lastName?.[0] || ''}`,
            status: app.status,
            createdAt: new Date(app.createdAt).toLocaleDateString(),
            coverLetter: app.coverLetter
          };
          if (!grouped[app.opportunityId]) {
            grouped[app.opportunityId] = [];
          }
          grouped[app.opportunityId].push(mappedApp);
        });
        setApplicants(grouped);
      } catch (err) {
        console.error('Failed to load sponsor dashboard data', err);
      }
    };
    fetchData();
  }, [user?.sub]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateOpportunityForm>(EMPTY_FORM);
  const [expandedOppId, setExpandedOppId] = useState<string | null>(null);

  const totalApplicants = opportunities.reduce((acc, opp) => acc + (opp.applicantsCount ?? 0), 0);

  const handleFormChange = (field: keyof CreateOpportunityForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        sponsorId: user?.sub,
      };
      const res = await api.post('/opportunities', payload);
      setOpportunities((prev) => [res.data, ...prev]);
      setApplicants((prev) => ({ ...prev, [res.data.id]: [] }));
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create opportunity', err);
    }
  };

  const handleDelete = (id: string) => {
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    if (expandedOppId === id) setExpandedOppId(null);
  };

  const handleReviewApplicant = async (oppId: string, appId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post(`/opportunities/applications/${appId}/status`, { status });
    } catch (err) {
      console.error('Failed to review application', err);
    }
    setApplicants((prev) => ({
      ...prev,
      [oppId]: prev[oppId].map((a) => (a.id === appId ? { ...a, status } : a)),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Opportunity Management</h1>
          <p className="text-gray-500 mt-1">Create, manage, and review applicants for your opportunities.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'outline' : 'primary'} className="shrink-0">
          <PlusCircle className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Create Opportunity'}
        </Button>
      </div>

      {/* Create Opportunity Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Post New Opportunity</h2>
          </div>
          <form onSubmit={handleCreate} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Title"
                placeholder="e.g., Cloud Engineering Intern"
                value={form.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                required
              />
              <Select
                label="Type"
                options={OPPORTUNITY_TYPES}
                value={form.type}
                onChange={(e) => handleFormChange('type', e.target.value as OpportunityType)}
              />
            </div>
            <Textarea
              label="Description"
              placeholder="Describe the role and its impact..."
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              required
              className="min-h-[110px]"
            />
            <Textarea
              label="Requirements"
              placeholder="e.g., 2+ years React, strong communication..."
              value={form.requirements}
              onChange={(e) => handleFormChange('requirements', e.target.value)}
              required
            />
            <Input
              label="Application Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => handleFormChange('deadline', e.target.value)}
              required
            />
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Discard</Button>
              <Button type="submit" variant="primary">Publish Live</Button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Active Postings" value={opportunities.length} icon={Briefcase} accent="primary" />
        <StatCard label="Total Applicants" value={totalApplicants} icon={Users} accent="secondary" />
        <StatCard label="Approved" value={Object.values(applicants).flat().filter(a => a.status === 'APPROVED').length} icon={Users} accent="amber" />
      </div>

      {/* Opportunities List */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">My Opportunities</h2>
        </div>

        {opportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No opportunities yet"
            description="Create your first opportunity using the button above."
            actionLabel="Create Opportunity"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {opportunities.map((opp) => {
              const isExpanded = expandedOppId === opp.id;
              const oppApplicants = applicants[opp.id] ?? [];

              return (
                <div key={opp.id}>
                  {/* Opportunity Row */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg">{opp.title}</h3>
                        <Badge status={opp.type} />
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{opp.description}</p>
                      <p className="text-xs text-gray-400 font-medium">Deadline: {opp.deadline}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        className="text-center bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors cursor-pointer group"
                        onClick={() => setExpandedOppId(isExpanded ? null : opp.id)}
                      >
                        <span className="text-2xl font-black text-primary block leading-none">{opp.applicantsCount ?? oppApplicants.length}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mt-0.5">Applicants</span>
                        <span className="text-xs text-primary font-bold mt-1 flex items-center justify-center gap-0.5">
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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
                        <p className="text-sm text-gray-400 pb-4">No applications received yet.</p>
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
                                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                        {app.applicantInitials}
                                      </div>
                                      <span className="font-semibold text-gray-900">{app.applicantName}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-gray-500">{app.createdAt}</td>
                                  <td className="px-5 py-4"><Badge status={app.status} /></td>
                                  <td className="px-5 py-4">
                                    {app.status === 'PENDING' && (
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          className="text-xs py-1 px-3 border-red-200 text-red-600 hover:bg-red-50"
                                          onClick={() => handleReviewApplicant(opp.id, app.id, 'REJECTED')}
                                        >
                                          Reject
                                        </Button>
                                        <Button
                                          variant="primary"
                                          className="text-xs py-1 px-3"
                                          onClick={() => handleReviewApplicant(opp.id, app.id, 'APPROVED')}
                                        >
                                          Accept
                                        </Button>
                                      </div>
                                    )}
                                    {app.status !== 'PENDING' && <span className="text-xs text-gray-400">—</span>}
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
    </div>
  );
};
