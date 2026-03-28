import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import { Upload, MapPin, Briefcase, GraduationCap, Target, Globe } from 'lucide-react';

/* ── Field primitives ──────────────────────────────────────────────────── */
const Field = ({
  label, icon: Icon, type = 'text', name, value, onChange, placeholder, required = false,
}: {
  label: string; icon?: React.ElementType; type?: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
    />
  </div>
);

const TextArea = ({
  label, icon: Icon, name, value, onChange, placeholder, required = false, rows = 3,
}: {
  label: string; icon?: React.ElementType; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; required?: boolean; rows?: number;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all resize-none"
    />
  </div>
);

const SelectField = ({
  label, icon: Icon, name, value, onChange, options, required = false,
}: {
  label: string; icon?: React.ElementType; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all"
    >
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const EDUCATION_LEVELS = [
  { value: 'High School', label: 'High School Diploma' },
  { value: "Associate's", label: "Associate's Degree" },
  { value: "Bachelor's", label: "Bachelor's Degree" },
  { value: "Master's", label: "Master's Degree" },
  { value: 'PhD', label: 'PhD / Doctorate' },
  { value: 'Bootcamp', label: 'Coding Bootcamp / Certificate' },
  { value: 'Self-taught', label: 'Self-taught' },
];

const AREAS_OF_INTEREST = [
  { value: 'Technology', label: 'Technology & Engineering' },
  { value: 'Leadership', label: 'Leadership & Management' },
  { value: 'Data Science', label: 'Data Science & AI' },
  { value: 'Product', label: 'Product Management' },
  { value: 'Design', label: 'UX/UI Design' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Cloud', label: 'Cloud Computing' },
  { value: 'Entrepreneurship', label: 'Entrepreneurship' },
];

const INDUSTRIES = [
  { value: 'FinTech', label: 'FinTech' },
  { value: 'EdTech', label: 'EdTech' },
  { value: 'HealthTech', label: 'HealthTech' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'AI/ML', label: 'Artificial Intelligence' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Cloud', label: 'Cloud Services' },
  { value: 'Media', label: 'Media & Entertainment' },
  { value: 'NGO', label: 'Non-profit / NGO' },
  { value: 'Government', label: 'Government & Public Sector' },
];

export const CompleteProfile: React.FC = () => {
  const { role, logout, token, submitProfileForReview } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [nationalId, setNationalId]     = useState<File | null>(null);

  const userId = (token && token !== 'DEMO') ? (jwtDecode(token) as any).sub : null;

  const [form, setForm] = useState({
    // Woman fields
    dob: '', country: '', city: '', educationLevel: '', areaOfInterest: '',
    careerGoals: '', skillsToDevelop: '',
    // Mentor fields
    jobTitle: '', company: '', industry: '', areasOfExpertise: '', availableHours: '',
    // Sponsor fields
    sponsorIndustry: '', websiteUrl: '', additionalInfo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (userId) {
        await api.patch(`/users/${userId}/complete-profile`, {
          role: role?.toUpperCase(),
          payload: form,
        });
      }
    } catch {
      // Demo mode — continue without backend
    } finally {
      setLoading(false);
      // Move to IN_REVIEW state regardless (demo or real)
      submitProfileForReview();
    }
  };

  /* ── Role configs ──────────────────────────────────────────────────── */
  const roleConfig: Record<string, { icon: string; gradient: string; title: string; subtitle: string }> = {
    woman:   { icon: '👩‍💻', gradient: 'from-violet-600 to-purple-600', title: 'Complete Your Profile', subtitle: 'Help us understand your goals and background.' },
    mentor:  { icon: '🎓', gradient: 'from-teal-600 to-cyan-600',    title: 'Complete Mentor Profile', subtitle: 'Add your expertise details to start mentoring.' },
    sponsor: { icon: '🏢', gradient: 'from-amber-500 to-orange-500',  title: 'Complete Sponsor Profile', subtitle: 'Tell us more about your organization.' },
  };

  const cfg = roleConfig[role ?? 'woman'] ?? roleConfig.woman;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50 flex flex-col items-center py-10 px-4">
      {/* Hero badge */}
      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-bold bg-gradient-to-r ${cfg.gradient} shadow-lg mb-6`}>
        <span className="text-lg">{cfg.icon}</span>
        Step 2 of 2 — Profile Completion
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${cfg.gradient} px-8 py-6`}>
          <h1 className="text-2xl font-black text-white">{cfg.title}</h1>
          <p className="text-white/80 mt-1 text-sm">{cfg.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* ── WOMAN FIELDS ─────────────────────────────────────────── */}
          {role === 'woman' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Date of Birth" icon={GraduationCap} type="date" name="dob" value={form.dob} onChange={handleChange} required />
                <Field label="Country" icon={Globe} name="country" value={form.country} onChange={handleChange} placeholder="e.g. Rwanda" required />
              </div>
              <Field label="City" icon={MapPin} name="city" value={form.city} onChange={handleChange} placeholder="e.g. Kigali" required />
              <SelectField
                label="Highest Education Level"
                icon={GraduationCap}
                name="educationLevel"
                value={form.educationLevel}
                onChange={handleChange}
                options={EDUCATION_LEVELS}
                required
              />
              <SelectField
                label="Area of Interest"
                icon={Target}
                name="areaOfInterest"
                value={form.areaOfInterest}
                onChange={handleChange}
                options={AREAS_OF_INTEREST}
                required
              />
              <TextArea
                label="Career Goals"
                icon={Target}
                name="careerGoals"
                value={form.careerGoals}
                onChange={handleChange}
                placeholder="Where do you see your tech career in 5 years? What impact do you want to create?"
                required
                rows={4}
              />
              <Field
                label="Skills You Wish to Develop"
                icon={Briefcase}
                name="skillsToDevelop"
                value={form.skillsToDevelop}
                onChange={handleChange}
                placeholder="e.g. Machine Learning, System Design, Leadership"
              />
            </>
          )}

          {/* ── MENTOR FIELDS ────────────────────────────────────────── */}
          {role === 'mentor' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Job Title" icon={Briefcase} name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Senior Backend Engineer" required />
                <Field label="Company" icon={Briefcase} name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google" required />
              </div>
              <SelectField
                label="Industry"
                icon={Briefcase}
                name="industry"
                value={form.industry}
                onChange={handleChange}
                options={INDUSTRIES}
                required
              />
              <TextArea
                label="Areas of Expertise"
                icon={Target}
                name="areasOfExpertise"
                value={form.areasOfExpertise}
                onChange={handleChange}
                placeholder="e.g. Backend Development, System Architecture, Technical Interviews, Career Transitions…"
                required
              />
              <Field
                label="Available Hours per Month (for mentorship)"
                type="number"
                icon={Briefcase}
                name="availableHours"
                value={form.availableHours}
                onChange={handleChange}
                placeholder="e.g. 8"
                required
              />
            </>
          )}

          {/* ── SPONSOR FIELDS ───────────────────────────────────────── */}
          {role === 'sponsor' && (
            <>
              <SelectField
                label="Industry Focus"
                icon={Briefcase}
                name="sponsorIndustry"
                value={form.sponsorIndustry}
                onChange={handleChange}
                options={INDUSTRIES}
                required
              />
              <Field
                label="Corporate Website"
                type="url"
                icon={Globe}
                name="websiteUrl"
                value={form.websiteUrl}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
                required
              />
              <TextArea
                label="Additional Information / Mission Statement"
                icon={Target}
                name="additionalInfo"
                value={form.additionalInfo}
                onChange={handleChange}
                placeholder="Describe what makes your organization credible and your commitment to women in tech."
                rows={4}
              />
            </>
          )}

          {/* ── Document uploads (all roles) ─────────────────────────── */}
          <div className="pt-2 border-t border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Upload className="h-4 w-4 text-gray-400" />
              Document Uploads
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profile image */}
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-violet-50 hover:border-primary transition-all">
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500">
                    {profileImage ? profileImage.name : 'Profile Photo (optional)'}
                  </span>
                  <span className="text-xs text-gray-400">JPG, PNG up to 5MB</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)} />
              </label>

              {/* National ID */}
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-primary/40 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all">
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {nationalId ? nationalId.name : 'National ID / Passport *'}
                  </span>
                  <span className="text-xs text-primary/60">PDF or image, required</span>
                </div>
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setNationalId(e.target.files?.[0] ?? null)} required />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={logout}
              className="px-6 py-3 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
            >
              Sign Out
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-gradient-to-r ${cfg.gradient} text-white font-black rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </>
              ) : 'Submit Profile for Review →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
