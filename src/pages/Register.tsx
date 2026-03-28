import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Upload, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type RoleOption = 'woman' | 'mentor' | 'sponsor';

const ROLE_CARDS: {
  role: RoleOption;
  label: string;
  tagline: string;
  perks: string[];
  gradient: string;
  ring: string;
  badge: string;
}[] = [
  {
    role: 'woman',
        label: 'Women in Tech',
    tagline: 'Grow your career with mentors and opportunities',
    perks: [
      'Find & apply to expert mentors',
      'Access scholarships & internships',
      'Take skills assessments',
      'Track all applications in one place',
    ],
    gradient: 'from-violet-600 to-purple-600',
    ring: 'ring-violet-400',
    badge: 'bg-violet-100 text-violet-700',
  },
  {
    role: 'mentor',
    label: 'Mentor',
    tagline: 'Guide the next generation of women in tech',
    perks: [
      'Create mentorship listings',
      'Review & accept mentee requests',
      'Track active mentorship sessions',
      'Build your professional network',
    ],
    gradient: 'from-teal-600 to-cyan-600',
    ring: 'ring-teal-400',
    badge: 'bg-teal-100 text-teal-700',
  },
  {
    role: 'sponsor',
    label: 'Sponsor',
    tagline: 'Invest in women\'s tech talent pipeline',
    perks: [
      'Post internships & scholarships',
      'Review incoming applications',
      'Access a vetted talent pool',
      'Message applicants directly',
    ],
    gradient: 'from-amber-500 to-orange-500',
    ring: 'ring-amber-400',
    badge: 'bg-amber-100 text-amber-700',
  },
];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  skills: string;
  professionalBackground: string;
  yearsExperience: string;
  organizationName: string;
  description: string;
  website: string;
  certificate: File | null;
}

const EMPTY: FormState = {
  firstName: '', lastName: '', email: '', password: '',
  phoneNumber: '', skills: '', professionalBackground: '',
  yearsExperience: '', organizationName: '', description: '',
  website: '', certificate: null,
};

const Field = ({
  label, type = 'text', name, value, onChange, placeholder, required = false, hint,
}: {
  label: string; type?: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; hint?: string;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition-all"
    />
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const TextArea = ({
  label, name, value, onChange, placeholder, required = false,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={3}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary focus:bg-white transition-all resize-none"
    />
  </div>
);

export const Register = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<RoleOption>('woman');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { } = useAuth();

  const selectedCard = ROLE_CARDS.find((c) => c.role === role)!;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let payload: any = { email: form.email, passwordHash: form.password };

      if (role === 'woman') {
        payload = {
          ...payload,
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber,
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        };
      } else if (role === 'mentor') {
        payload = {
          ...payload,
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber,
          professionalBackground: form.professionalBackground,
          yearsExperience: parseInt(form.yearsExperience) || 0,
        };
      } else {
        payload = {
          ...payload,
          organizationName: form.organizationName,
          description: form.description,
          website: form.website,
        };
      }

      await api.post(`/auth/register/${role}`, payload);
      navigate('/login', { state: { message: 'Registration successful! Please sign in to continue.' } });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50 flex flex-col py-10 px-4">
      {}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full mb-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-black">E</div>
          <span className="font-black text-xl text-primary">EmpowHerHub</span>
        </Link>
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link>
        </p>
      </div>

      {}
      <div className="max-w-5xl mx-auto w-full mb-8">
        <div className="flex items-center gap-3">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${s <= step ? 'text-primary' : 'text-gray-300'}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-colors ${
                  s < step ? 'bg-primary border-primary text-white' : s === step ? 'border-primary text-primary' : 'border-gray-200 text-gray-400'
                }`}>
                  {s < step ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                <span className={`text-sm font-bold hidden sm:block ${s <= step ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s === 1 ? 'Choose Your Role' : 'Your Details'}
                </span>
              </div>
              {s < 2 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-primary' : 'bg-gray-200'} transition-colors`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {}
      {step === 1 && (
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">How will you use EmpowHerHub?</h1>
            <p className="text-gray-500 mt-2 text-lg">Choose the role that best describes you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLE_CARDS.map((card) => (
              <button
                key={card.role}
                onClick={() => setRole(card.role)}
                className={`text-left p-6 rounded-3xl border-2 transition-all hover:-translate-y-1 hover:shadow-xl focus:outline-none ${
                  role === card.role
                    ? `border-transparent ring-4 ${card.ring} shadow-xl -translate-y-1`
                    : 'border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                {}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-black text-gray-900">{card.label}</h3>
                  {role === card.role && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.badge}`}>Selected</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{card.tagline}</p>
                <ul className="space-y-2">
                  {card.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary-dark hover:-translate-y-0.5 transition-all text-lg"
            >
              Continue as {selectedCard.label}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {}
      {step === 2 && (
        <div className="max-w-xl mx-auto w-full">
          {}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors font-semibold"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${selectedCard.badge}`}>
              Registering as {selectedCard.label}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Create your account</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in your details to get started.</p>

            {errorMsg && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {}
              {(role === 'woman' || role === 'mentor') && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ada" required />
                  <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Lovelace" required />
                </div>
              )}

              {}
              {role === 'sponsor' && (
                <>
                  <Field label="Organization Name" name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="Tech Corp Inc." required />
                  <Field label="Website URL" type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://example.com" required />
                  <TextArea label="Organization Description" name="description" value={form.description} onChange={handleChange} placeholder="Brief description of your organization and mission." required />
                </>
              )}

              {}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                <Field label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
              </div>

              {}
              {(role === 'woman' || role === 'mentor') && (
                <Field label="Phone Number" type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+250 780 000 000" />
              )}

              {}
              {role === 'woman' && (
                <Field
                  label="Skills"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, Python, UI/UX Design"
                  required
                  hint="Separate skills with commas"
                />
              )}

              {}
              {role === 'mentor' && (
                <>
                  <TextArea
                    label="Professional Background"
                    name="professionalBackground"
                    value={form.professionalBackground}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer at Google with 10+ years in backend systems."
                    required
                  />
                  <Field
                    label="Years of Experience"
                    type="number"
                    name="yearsExperience"
                    value={form.yearsExperience}
                    onChange={handleChange}
                    placeholder="5"
                    required
                  />
                  {}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Mentorship Certificate <span className="text-red-500">*</span>
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-violet-50 hover:border-primary transition-all">
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">
                          {form.certificate ? form.certificate.name : 'Upload certificate (PDF / image)'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={(e) => setForm({ ...form, certificate: e.target.files?.[0] ?? null })}
                      />
                    </label>
                  </div>
                </>
              )}

              {}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 text-white font-black rounded-xl shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-base bg-gradient-to-r ${selectedCard.gradient}`}
              >
                {loading ? 'Creating account…' : `Create ${selectedCard.label} Account →`}
              </button>

              <p className="text-xs text-center text-gray-400">
                By registering, your account will be set to <strong className="text-gray-600">pending</strong> until
                reviewed and approved by an Admin.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
