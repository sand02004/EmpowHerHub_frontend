import React, { useState } from 'react';
import { Upload, Briefcase, GraduationCap, Target, User } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

/* ── Shared primitives ──────────────────────────────────────────────────── */
const Section = ({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const SelectInput = ({
  label, name, value, onChange, options, required,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const FileField = ({ label, accept, required, hint, file, onChange }: {
  label: string; accept: string; required?: boolean; hint?: string;
  file: File | null; onChange: (f: File | null) => void;
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-primary/5 hover:border-primary/40 transition-all">
      <Upload className="h-5 w-5 text-gray-400 mb-1" />
      <span className="text-xs font-semibold text-gray-500">
        {file ? file.name : `Upload ${label}`}
      </span>
      {hint && <span className="text-[11px] text-gray-400 mt-0.5">{hint}</span>}
      <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </label>
  </div>
);

/* ── Dropdown options ───────────────────────────────────────────────────── */
const EDUCATION_LEVELS = [
  { value: 'High School',   label: 'High School Diploma' },
  { value: "Associate's",  label: "Associate's Degree" },
  { value: "Bachelor's",   label: "Bachelor's Degree" },
  { value: "Master's",     label: "Master's Degree" },
  { value: 'PhD',          label: 'PhD / Doctorate' },
  { value: 'Bootcamp',     label: 'Coding Bootcamp / Certificate' },
  { value: 'Self-taught',  label: 'Self-taught' },
];

const AREAS_OF_INTEREST = [
  { value: 'Technology',      label: 'Technology & Engineering' },
  { value: 'Leadership',      label: 'Leadership & Management' },
  { value: 'Data Science',    label: 'Data Science & AI' },
  { value: 'Product',         label: 'Product Management' },
  { value: 'Design',          label: 'UX/UI Design' },
  { value: 'Cybersecurity',   label: 'Cybersecurity' },
  { value: 'Cloud',           label: 'Cloud Computing' },
  { value: 'Entrepreneurship',label: 'Entrepreneurship' },
];

const INDUSTRIES = [
  { value: 'FinTech',      label: 'FinTech' },
  { value: 'EdTech',       label: 'EdTech' },
  { value: 'HealthTech',   label: 'HealthTech' },
  { value: 'E-commerce',   label: 'E-commerce' },
  { value: 'AI/ML',        label: 'Artificial Intelligence' },
  { value: 'Cybersecurity',label: 'Cybersecurity' },
  { value: 'Cloud',        label: 'Cloud Services' },
  { value: 'Media',        label: 'Media & Entertainment' },
  { value: 'NGO',          label: 'Non-profit / NGO' },
  { value: 'Government',   label: 'Government & Public Sector' },
];

/* ── Notification ───────────────────────────────────────────────────────── */
const SaveBanner = ({ visible }: { visible: boolean }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
    }`}
  >
    <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
      ✓ Profile saved successfully
    </div>
  </div>
);

/* ── WOMAN PROFILE ──────────────────────────────────────────────────────── */
const WomanProfile: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ dob: '', phone: '', country: '', city: '', educationLevel: '', areaOfInterest: '', careerGoals: '', currentSkills: '', skillsToDevelop: '' });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [nationalId, setNationalId] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user?.sub) {
        await api.patch(`/users/${user.sub}/complete-profile`, {
          role: 'woman',
          payload: { ...form, skills: form.currentSkills.split(',').map(s=>s.trim()) }
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Personal Information" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="Date of Birth" type="date" name="dob" value={form.dob} onChange={handleChange} required />
          <Input label="Phone Number" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+250 780 000 000" />
          <Input label="Country" name="country" value={form.country} onChange={handleChange} placeholder="e.g. Rwanda" required />
          <Input label="City" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Kigali" required />
        </div>
      </Section>

      <Section title="Education & Career" icon={GraduationCap}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SelectInput label="Highest Education Level" name="educationLevel" value={form.educationLevel} onChange={handleChange} options={EDUCATION_LEVELS} required />
            <SelectInput label="Area of Interest" name="areaOfInterest" value={form.areaOfInterest} onChange={handleChange} options={AREAS_OF_INTEREST} required />
          </div>
          <Textarea label="Career Goals" name="careerGoals" value={form.careerGoals} onChange={(e) => setForm((p) => ({ ...p, careerGoals: e.target.value }))} placeholder="Where do you see your tech career in 5 years? What impact do you want to create?" required className="min-h-[120px]" />
          <Input label="Current Skills" name="currentSkills" value={form.currentSkills} onChange={handleChange} placeholder="React, Node.js, Python (comma-separated)" />
          <Input label="Skills You Wish to Develop" name="skillsToDevelop" value={form.skillsToDevelop} onChange={handleChange} placeholder="Machine Learning, System Design, Leadership (comma-separated)" />
        </div>
      </Section>

      <Section title="Documents" icon={Upload}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FileField label="Profile Photo" accept="image/*" hint="JPG, PNG up to 5 MB" file={profileImage} onChange={setProfileImage} />
          <FileField label="National ID / Passport" accept=".pdf,image/*" hint="PDF or image — required" required file={nationalId} onChange={setNationalId} />
        </div>
      </Section>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="primary" isLoading={loading} className="px-10 shadow-md">
          Save Profile
        </Button>
      </div>
      <SaveBanner visible={saved} />
    </form>
  );
};

/* ── MENTOR PROFILE ─────────────────────────────────────────────────────── */
const MentorProfile: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', jobTitle: '', company: '', industry: '', yearsExperience: '', professionalBackground: '', areasOfExpertise: '', availableHours: '' });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [nationalId, setNationalId] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user?.sub) {
        await api.patch(`/users/${user.sub}/complete-profile`, {
          role: 'mentor',
          payload: {
            ...form,
            background: form.professionalBackground,
            yearsOfExperience: parseInt(form.yearsExperience) || 0,
            expertise: form.areasOfExpertise.split(',').map(s=>s.trim())
          }
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save mentor profile', err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Personal Information" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} placeholder="e.g. Sarah" required />
          <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} placeholder="e.g. Chen" required />
          <Input label="Phone Number" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+250 780 000 000" />
        </div>
      </Section>

      <Section title="Professional Details" icon={Briefcase}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Senior Software Engineer" required />
            <Input label="Company / Organization" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google" required />
            <SelectInput label="Industry" name="industry" value={form.industry} onChange={handleChange} options={INDUSTRIES} required />
            <Input label="Years of Experience" type="number" name="yearsExperience" value={form.yearsExperience} onChange={handleChange} placeholder="e.g. 8" required />
          </div>
          <Textarea label="Professional Background" name="professionalBackground" value={form.professionalBackground} onChange={(e) => setForm((p) => ({ ...p, professionalBackground: e.target.value }))} placeholder="Summarize your professional journey, key roles, and achievements." required className="min-h-[120px]" />
          <Textarea label="Areas of Expertise" name="areasOfExpertise" value={form.areasOfExpertise} onChange={(e) => setForm((p) => ({ ...p, areasOfExpertise: e.target.value }))} placeholder="e.g. Backend Development, System Architecture, Technical Interviews, Career Transitions…" required />
          <Input label="Available Hours per Month (mentorship)" type="number" name="availableHours" value={form.availableHours} onChange={handleChange} placeholder="e.g. 8" required />
        </div>
      </Section>

      <Section title="Documents" icon={Upload}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FileField label="Profile Photo" accept="image/*" hint="JPG, PNG up to 5 MB" file={profileImage} onChange={setProfileImage} />
          <FileField label="National ID / Passport" accept=".pdf,image/*" hint="PDF or image — required" required file={nationalId} onChange={setNationalId} />
          <FileField label="Mentorship Certificate" accept=".pdf,image/*" hint="PDF or image — required" required file={certificate} onChange={setCertificate} />
        </div>
      </Section>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="primary" isLoading={loading} className="px-10 shadow-md">Save Profile</Button>
      </div>
      <SaveBanner visible={saved} />
    </form>
  );
};

/* ── SPONSOR PROFILE ────────────────────────────────────────────────────── */
const SponsorProfile: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ organizationName: '', industry: '', website: '', description: '' });
  const [logo, setLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user?.sub) {
        await api.patch(`/users/${user.sub}/complete-profile`, {
          role: 'sponsor',
          payload: form
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save sponsor profile', err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Organization Details" icon={Briefcase}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Organization Name" name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="e.g. TechCorp Inc." required />
            <SelectInput label="Industry" name="industry" value={form.industry} onChange={handleChange} options={INDUSTRIES} required />
          </div>
          <Input label="Website URL" type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://yourcompany.com" required />
        </div>
      </Section>

      <Section title="About Your Organization" icon={Target}>
        <Textarea label="Mission Statement / Description" name="description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe your organization's mission, what makes you credible, and your commitment to empowering women in tech." required className="min-h-[150px]" />
      </Section>

      <Section title="Branding" icon={Upload}>
        <div className="max-w-xs">
          <FileField label="Organization Logo" accept="image/*" hint="PNG or SVG recommended — up to 2 MB" file={logo} onChange={setLogo} />
        </div>
      </Section>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="primary" isLoading={loading} className="px-10 shadow-md">Save Profile</Button>
      </div>
      <SaveBanner visible={saved} />
    </form>
  );
};

/* ── ADMIN PROFILE ──────────────────────────────────────────────────────── */
const AdminProfileView: React.FC = () => (
  <div className="space-y-6">
    <Section title="Admin Account" icon={User}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
          <p className="font-semibold text-gray-900">admin@empowher.com</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Role</p>
          <p className="font-semibold text-gray-900">🛡️ Platform Administrator</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Department</p>
          <p className="font-semibold text-gray-900">Platform Management</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Access Level</p>
          <p className="font-semibold text-emerald-700">Full Access</p>
        </div>
      </div>
    </Section>
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
      ℹ️ Admin account details can only be changed by a super-administrator via the backend console.
    </div>
  </div>
);

/* ── Root export ────────────────────────────────────────────────────────── */
export const Profile = () => {
  const { role } = useAuth();

  const roleConfig = {
    woman:   { icon: '👩‍💻', label: 'Women in Tech', gradient: 'from-violet-600 to-purple-600', badge: 'bg-violet-100 text-violet-700' },
    mentor:  { icon: '🎓', label: 'Mentor',          gradient: 'from-teal-600 to-cyan-600',    badge: 'bg-teal-100 text-teal-700'   },
    sponsor: { icon: '🏢', label: 'Sponsor',          gradient: 'from-amber-500 to-orange-500', badge: 'bg-amber-100 text-amber-700' },
    admin:   { icon: '🛡️', label: 'Administrator',    gradient: 'from-gray-700 to-slate-700',   badge: 'bg-gray-200 text-gray-700'   },
  };

  const cfg = role ? roleConfig[role] : roleConfig.woman;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${cfg.gradient} p-6 rounded-2xl text-white`}>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-lg">
            {cfg.icon}
          </div>
          <div>
            <h1 className="text-2xl font-black">My Profile</h1>
            <p className="text-white/80 text-sm mt-0.5">{cfg.label} · Manage your personal information and documents</p>
          </div>
        </div>
      </div>

      {/* Role-specific form */}
      {role === 'mentor'  && <MentorProfile />}
      {role === 'sponsor' && <SponsorProfile />}
      {role === 'admin'   && <AdminProfileView />}
      {(role === 'woman' || !role) && <WomanProfile />}
    </div>
  );
};
