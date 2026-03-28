import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle, XCircle, RotateCcw, ArrowRight, BookOpen, LogOut } from 'lucide-react';

/* ── Assessment questions ──────────────────────────────────────────────── */
const QUESTIONS: {
  id: string;
  content: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}[] = [
  {
    id: 'q1',
    content: 'What is the primary purpose of a version control system like Git?',
    options: [
      { id: 'q1a', text: 'To create beautiful user interfaces', isCorrect: false },
      { id: 'q1b', text: 'To track changes in code and enable collaboration', isCorrect: true },
      { id: 'q1c', text: 'To test applications automatically', isCorrect: false },
      { id: 'q1d', text: 'To deploy applications to production servers', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    content: 'Which of the following is a front-end JavaScript framework?',
    options: [
      { id: 'q2a', text: 'Django', isCorrect: false },
      { id: 'q2b', text: 'Laravel', isCorrect: false },
      { id: 'q2c', text: 'React', isCorrect: true },
      { id: 'q2d', text: 'Flask', isCorrect: false },
    ],
  },
  {
    id: 'q3',
    content: 'What does API stand for in software development?',
    options: [
      { id: 'q3a', text: 'Application Programming Interface', isCorrect: true },
      { id: 'q3b', text: 'Automated Program Integration', isCorrect: false },
      { id: 'q3c', text: 'Application Protocol Interface', isCorrect: false },
      { id: 'q3d', text: 'Advanced Programming Instructions', isCorrect: false },
    ],
  },
  {
    id: 'q4',
    content: 'What is the purpose of the SQL SELECT statement?',
    options: [
      { id: 'q4a', text: 'To delete records from a database', isCorrect: false },
      { id: 'q4b', text: 'To update records in a database', isCorrect: false },
      { id: 'q4c', text: 'To retrieve data from a database', isCorrect: true },
      { id: 'q4d', text: 'To create new database tables', isCorrect: false },
    ],
  },
  {
    id: 'q5',
    content: 'Which HTML tag is used to create a hyperlink?',
    options: [
      { id: 'q5a', text: '<link>', isCorrect: false },
      { id: 'q5b', text: '<href>', isCorrect: false },
      { id: 'q5c', text: '<url>', isCorrect: false },
      { id: 'q5d', text: '<a>', isCorrect: true },
    ],
  },
];

const PASSING_SCORE = 60; // percent

export const MandatoryAssessment: React.FC = () => {
  const { logout, markAssessmentPassed, markAssessmentFailed } = useAuth();

  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [submitted, setSubmitted]   = useState(false);
  const [score, setScore]           = useState(0);
  const [passed, setPassed]         = useState(false);
  const [currentQ, setCurrentQ]     = useState(0); // question index

  const totalQ   = QUESTIONS.length;
  const answered = Object.keys(answers).length;

  /* ── Submit handler ────────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let correct = 0;
    QUESTIONS.forEach((q) => {
      const selectedId = answers[q.id];
      const correctOpt = q.options.find((o) => o.isCorrect);
      if (selectedId === correctOpt?.id) correct++;
    });
    const pct = Math.round((correct / totalQ) * 100);
    setScore(pct);
    setPassed(pct >= PASSING_SCORE);
    setSubmitted(true);
  };

  /* ── Result screen ─────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
          {/* Score ring */}
          <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center border-8 ${passed ? 'border-emerald-400 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
            <div>
              <p className={`text-3xl font-black ${passed ? 'text-emerald-600' : 'text-red-600'}`}>{score}%</p>
              <p className="text-xs text-gray-400 font-semibold">score</p>
            </div>
          </div>

          {passed ? (
            <>
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-gray-900 mb-2">Assessment Passed! 🎉</h2>
              <p className="text-gray-500 mb-2">
                You scored <strong className="text-emerald-600">{score}%</strong> — well above the required{' '}
                <strong>{PASSING_SCORE}%</strong>.
              </p>
              <p className="text-gray-500 mb-8 text-sm">
                Your account is now fully approved. Welcome to EmpowHerHub!
              </p>
              <button
                onClick={markAssessmentPassed}
                className="w-full py-4 bg-gradient-to-r from-primary to-violet-500 text-white font-black rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Enter Your Dashboard <ArrowRight className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-gray-900 mb-2">Assessment Not Passed</h2>
              <p className="text-gray-500 mb-2">
                You scored <strong className="text-red-600">{score}%</strong>. The minimum required score is{' '}
                <strong>{PASSING_SCORE}%</strong>.
              </p>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Don't give up! Review your skills and try again. You need to answer at least{' '}
                <strong>3 out of 5</strong> questions correctly.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setAnswers({});
                    setCurrentQ(0);
                  }}
                  className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retry Assessment
                </button>
                <button
                  onClick={markAssessmentFailed}
                  className="w-full py-3 text-red-500 hover:bg-red-50 rounded-xl font-semibold transition-colors text-sm"
                >
                  I'll come back later (signs out)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Quiz screen ───────────────────────────────────────────────────── */
  const question = QUESTIONS[currentQ];
  const isLast   = currentQ === totalQ - 1;
  const progress = ((currentQ) / totalQ) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-black text-gray-900">Skills Assessment</h1>
          </div>
          <span className="text-sm font-bold text-gray-500">
            Question {currentQ + 1} of {totalQ}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-400 font-medium">
            Passing score: {PASSING_SCORE}% ({Math.ceil(totalQ * PASSING_SCORE / 100)}/{totalQ} correct)
          </p>
          <p className="text-xs text-gray-400 font-medium">{answered} answered</p>
        </div>
      </div>

      {/* Question card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Question */}
        <div className="px-8 py-6 bg-gradient-to-r from-primary/5 to-violet-50 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <span className="h-8 w-8 rounded-full bg-primary text-white text-sm font-black flex items-center justify-center shrink-0">
              {currentQ + 1}
            </span>
            <p className="font-bold text-gray-900 text-lg leading-relaxed">{question.content}</p>
          </div>
        </div>

        {/* Options */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {question.options.map((opt) => {
            const isSelected = answers[question.id] === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <input
                  type="radio"
                  name={question.id}
                  value={opt.id}
                  className="sr-only"
                  onChange={() => setAnswers({ ...answers, [question.id]: opt.id })}
                />
                <span className={`text-sm font-medium leading-relaxed ${isSelected ? 'text-primary font-semibold' : 'text-gray-700'}`}>
                  {opt.text}
                </span>
              </label>
            );
          })}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((c) => c - 1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {QUESTIONS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentQ(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === currentQ ? 'w-6 bg-primary' : answers[QUESTIONS[i].id] ? 'w-2.5 bg-emerald-400' : 'w-2.5 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {isLast ? (
              <button
                type="submit"
                disabled={answered < totalQ}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
              >
                Submit <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!answers[question.id]}
                onClick={() => setCurrentQ((c) => c + 1)}
                className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      <button
        onClick={logout}
        className="mt-6 flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-semibold transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Save & continue later
      </button>
    </div>
  );
};
