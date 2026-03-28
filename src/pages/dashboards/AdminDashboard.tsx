import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, BookOpen, Clock, Plus, Trash2 } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import type { User, Test } from '../../types';

type ApprovalTab = 'woman' | 'mentor' | 'sponsor';

interface NewQuestionState {
  content: string;
  options: string[];
  correctIndex: number;
}

const EMPTY_QUESTION: NewQuestionState = { content: '', options: ['', '', ''], correctIndex: 0 };

export const AdminDashboard: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<Record<ApprovalTab, User[]>>({ woman: [], mentor: [], sponsor: [] });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<ApprovalTab>('woman');
  const [tests, setTests] = useState<Test[]>([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [questions, setQuestions] = useState<NewQuestionState[]>([{ ...EMPTY_QUESTION }]);

  useEffect(() => {
    fetchUsers();
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await api.get('/tests');
      setTests(res.data);
    } catch (err) {
      console.error('Failed to fetch tests', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const pendingRes = await api.get('/admin/pending-accounts');
      const allRes = await api.get('/users');
      const grouped: Record<ApprovalTab, User[]> = { woman: [], mentor: [], sponsor: [] };
      pendingRes.data.forEach((u: any) => {
        const r = u.role.toLowerCase() as ApprovalTab;
        if (grouped[r]) grouped[r].push(u);
      });
      setPendingUsers(grouped);
      setAllUsers(allRes.data);
    } catch (err) {
      console.error('Failed to fetch admin users data', err);
    }
  };

  const totalPending = Object.values(pendingUsers).flat().length;

  const handleApprove = async (userId: string) => {
    try {
      await api.patch(`/admin/account/${userId}/status`, { status: 'APPROVED' });
    } catch {
      // Demo fallback — update state locally
    }
    // Move the user from pending to allUsers with APPROVED status
    setPendingUsers((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as ApprovalTab[]).forEach((tab) => {
        updated[tab] = updated[tab].filter((u) => u.id !== userId);
      });
      return updated;
    });
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'APPROVED' as const } : u)),
    );
  };

  const handleReject = async (userId: string) => {
    try {
      await api.patch(`/admin/account/${userId}/status`, { status: 'REJECTED' });
    } catch {
      // Demo fallback
    }
    setPendingUsers((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as ApprovalTab[]).forEach((tab) => {
        updated[tab] = updated[tab].filter((u) => u.id !== userId);
      });
      return updated;
    });
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'REJECTED' as const } : u)),
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, { ...EMPTY_QUESTION, options: ['', '', ''] }]);

  const updateQuestion = (qi: number, field: keyof NewQuestionState, value: string | number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, [field]: value } : q)),
    );
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) }
          : q,
      ),
    );
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedQuestions = questions.map((q) => ({
        content: q.content,
        answerOptions: q.options.map((opt, i) => ({
          content: opt,
          isCorrect: i === q.correctIndex,
        })),
      }));

      const payload = {
        title: testTitle,
        description: testDesc,
        passingScore: parseInt(passingScore),
        questions: formattedQuestions,
      };

      const res = await api.post('/tests', payload);
      setTests((prev) => [...prev, res.data]);

      setTestTitle('');
      setTestDesc('');
      setPassingScore('70');
      setQuestions([{ ...EMPTY_QUESTION }]);
      setShowTestForm(false);
    } catch (err) {
      console.error('Failed to create test', err);
    }
  };

  const TABS: { key: ApprovalTab; label: string }[] = [
    { key: 'woman', label: 'Women' },
    { key: 'mentor', label: 'Mentors' },
    { key: 'sponsor', label: 'Sponsors' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Command Center</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform approvals, users, and assessments.</p>
        </div>
        <Button onClick={() => setShowTestForm(!showTestForm)} variant={showTestForm ? 'outline' : 'primary'}>
          {showTestForm ? 'Cancel Test Creation' : '+ Build Integration Test'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={allUsers.length} icon={Users} accent="primary" />
        <StatCard label="Pending Approvals" value={totalPending} icon={Clock} accent="amber" />
        <StatCard label="Active Tests" value={tests.length} icon={BookOpen} accent="secondary" />
        <StatCard label="Approved Users" value={allUsers.filter(u => u.status === 'APPROVED').length} icon={CheckCircle} accent="rose" />
      </div>

      {/* Approval Queue */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">Pending Approvals</h2>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const count = pendingUsers[tab.key].length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-3 text-sm font-bold transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-2 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {pendingUsers[activeTab].length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title={`No pending ${activeTab} approvals`}
            description="All registrations have been reviewed."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingUsers[activeTab].map((user) => (
              <div key={user.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {user.firstName ? `${user.firstName[0]}${user.lastName?.[0] ?? ''}` : user.organizationName?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {user.firstName ? `${user.firstName} ${user.lastName}` : user.organizationName}
                    </p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Registered {user.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge status={user.status} />
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                    onClick={() => handleReject(user.id)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    className="text-xs"
                    onClick={() => handleApprove(user.id)}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Users Table */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="text-left px-6 py-3">User</th>
                <th className="text-left px-6 py-3">Email</th>
                <th className="text-left px-6 py-3">Role</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {user.firstName ? `${user.firstName} ${user.lastName}` : user.organizationName}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4"><Badge status={user.role} /></td>
                  <td className="px-6 py-4"><Badge status={user.status} /></td>
                  <td className="px-6 py-4 text-gray-400">{user.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Test Builder */}
      {showTestForm && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Configure New Skills Test</h2>
          </div>
          <form onSubmit={handleCreateTest} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Test Title"
                placeholder="e.g. React Architecture Protocol"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                required
              />
              <Input
                label="Passing Score (%)"
                type="number"
                placeholder="70"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                required
              />
            </div>
            <Textarea
              label="Test Description"
              placeholder="Summarize the test scope..."
              value={testDesc}
              onChange={(e) => setTestDesc(e.target.value)}
              required
            />

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">Questions</h3>
                <Button type="button" variant="ghost" onClick={addQuestion} className="text-primary text-sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Question
                </Button>
              </div>
              {questions.map((q, qi) => (
                <div key={qi} className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">{qi + 1}</span>
                    <Input
                      label=""
                      placeholder="Enter your question..."
                      value={q.content}
                      onChange={(e) => updateQuestion(qi, 'content', e.target.value)}
                      required
                      className="flex-1"
                    />
                  </div>
                  <div className="space-y-2.5 pl-8">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.correctIndex === oi}
                          onChange={() => updateQuestion(qi, 'correctIndex', oi)}
                          className="h-4 w-4 text-primary shrink-0"
                          title="Mark as correct answer"
                        />
                        <Input
                          label=""
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setShowTestForm(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Push Test to Database</Button>
            </div>
          </form>
        </section>
      )}

      {/* Tests List */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">Active Tests</h2>
        </div>
        {tests.length === 0 ? (
          <EmptyState icon={BookOpen} title="No tests yet" description="Create your first assessment using the button above." />
        ) : (
          <div className="divide-y divide-gray-100">
            {tests.map((test) => (
              <div key={test.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-bold text-gray-900">{test.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Passing score: {test.passingScore}% · {test.description}</p>
                </div>
                <button
                  onClick={() => setTests((prev) => prev.filter((t) => t.id !== test.id))}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Delete test"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
