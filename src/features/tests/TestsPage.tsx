import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../hooks/useAuth';
import type { Test, AnswerOption } from '../../types';
import { api } from '../../services/api';

// ── Shared types ──────────────────────────────────────────────────────────────

interface NewQuestion {
  content: string;
  options: string[];
  correctIndex: number;
}

const EMPTY_Q: NewQuestion = { content: '', options: ['', '', ''], correctIndex: 0 };

// ── Woman View ────────────────────────────────────────────────────────────────

const WomanTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get('/tests').then(res => setTests(res.data)).catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent, testId: string) => {
    e.preventDefault();
    setSubmitted((prev) => new Set([...prev, testId]));
    setActiveTestId(null);
    setAnswers({});
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-secondary to-teal-500 p-8 rounded-2xl text-white">
        <h1 className="text-3xl font-extrabold tracking-tight">Skills Assessments</h1>
        <p className="mt-1 text-teal-100 font-medium">
          Prove your capabilities through standardized technical tests and earn badges.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Available Tests" value={tests.length} icon={BookOpen} accent="secondary" />
        <StatCard label="Completed" value={submitted.size} icon={CheckCircle} accent="primary" />
        <StatCard label="Passed" value={submitted.size} icon={CheckCircle} accent="amber" />
      </div>

      {/* Test Cards */}
      <div className="space-y-4">
        {tests.map((test) => {
          const isActive = activeTestId === test.id;
          const isDone = submitted.has(test.id);

          return (
            <section
              key={test.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden"
            >
              <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-gray-900">{test.title}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {test.description} — Min. Pass: {test.passingScore}%
                  </p>
                </div>
                {isDone ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                    <CheckCircle className="h-3.5 w-3.5" /> Submitted
                  </span>
                ) : (
                  <Button
                    onClick={() => setActiveTestId(isActive ? null : test.id)}
                    variant={isActive ? 'outline' : 'primary'}
                  >
                    {isActive ? 'Collapse' : 'Take Test'}
                  </Button>
                )}
              </div>

              {isActive && test.questions && (
                <form
                  onSubmit={(e) => handleSubmit(e, test.id)}
                  className="p-6 space-y-6"
                >
                  {test.questions.map((q, qi) => (
                    <div
                      key={q.id}
                      className="p-5 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <p className="font-bold text-gray-900 mb-4">
                        {qi + 1}. {q.content}
                      </p>
                      <div className="space-y-2.5">
                        {q.answerOptions.map((opt: AnswerOption) => (
                          <label
                            key={opt.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-primary transition-colors"
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt.id}
                              className="h-4 w-4 text-primary"
                              onChange={() =>
                                setAnswers({ ...answers, [q.id]: opt.id })
                              }
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {opt.content}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 text-base font-bold shadow-md"
                  >
                    Submit Answers
                  </Button>
                </form>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

// ── Admin View ────────────────────────────────────────────────────────────────

const AdminTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    api.get('/tests').then(res => setTests(res.data)).catch(console.error);
  }, []);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [questions, setQuestions] = useState<NewQuestion[]>([{ ...EMPTY_Q }]);
  const [titleError, setTitleError] = useState('');

  const addQuestion = () =>
    setQuestions((prev) => [...prev, { ...EMPTY_Q, options: ['', '', ''] }]);

  const removeQuestion = (qi: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== qi));

  const updateQuestion = (
    qi: number,
    field: keyof NewQuestion,
    value: string | number,
  ) => {
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Test title is required.');
      return;
    }
    const res = await api.post('/tests', {
      title,
      description: desc,
      passingScore: parseInt(passingScore, 10),
      questions: questions.map(q => ({
        content: q.content,
        answerOptions: q.options.map((opt, i) => ({
          content: opt,
          isCorrect: i === q.correctIndex
        }))
      }))
    });
    setTests((prev) => [...prev, res.data]);
    setTitle('');
    setDesc('');
    setPassingScore('70');
    setQuestions([{ ...EMPTY_Q }]);
    setTitleError('');
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Tests Management
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage technical assessments for the platform.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'outline' : 'primary'}
        >
          {showForm ? 'Cancel' : '+ Build New Test'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Tests" value={tests.length} icon={BookOpen} accent="primary" />
        <StatCard
          label="Total Questions"
          value={tests.reduce((s, t) => s + (t.questions?.length ?? 0), 0)}
          icon={CheckCircle}
          accent="secondary"
        />
        <StatCard label="Submissions" value="—" icon={CheckCircle} accent="amber" />
      </div>

      {/* Create Test Form */}
      {showForm && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Configure New Test</h2>
          </div>
          <form onSubmit={handleCreate} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Test Title"
                placeholder="e.g. React Architecture Protocol"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                error={titleError}
                required
              />
              <Input
                label="Passing Score (%)"
                type="number"
                placeholder="70"
                min="1"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                required
              />
            </div>
            <Textarea
              label="Description"
              placeholder="Summarize the test scope and objectives..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />

            {/* Questions Builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">
                  Questions
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addQuestion}
                  className="text-primary text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Question
                </Button>
              </div>
              {questions.map((q, qi) => (
                <div
                  key={qi}
                  className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {qi + 1}
                    </span>
                    <Input
                      label=""
                      placeholder="Enter your question..."
                      value={q.content}
                      onChange={(e) => updateQuestion(qi, 'content', e.target.value)}
                      required
                      className="flex-1"
                    />
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qi)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        aria-label="Remove question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5 pl-8">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      Options — select the correct answer
                    </p>
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
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Publish Test
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* Tests List */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 text-sm uppercase tracking-widest">
            Active Tests
          </h2>
        </div>
        {tests.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No tests yet"
            description="Create your first assessment using the button above."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {tests.map((test) => (
              <div
                key={test.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-bold text-gray-900">{test.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Passing score: {test.passingScore}% · {test.description}
                  </p>
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

// ── Root export ───────────────────────────────────────────────────────────────

export const TestsPage: React.FC = () => {
  const { role } = useAuth();
  if (role === 'admin') return <AdminTests />;
  return <WomanTests />;
};
