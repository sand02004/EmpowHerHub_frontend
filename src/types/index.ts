export type Role = 'woman' | 'mentor' | 'sponsor' | 'admin' | null;
export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OpportunityType = 'Internship' | 'Scholarship' | 'Training' | 'Job';
export type MentorshipStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  role: NonNullable<Role>;
  status: AccountStatus;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  createdAt: string;
}

export interface WomenProfile {
  id: string;
  userId: string;
  user?: User;
  firstName: string;
  lastName: string;
  skills: string[];
  bio?: string;
  phone?: string;
}

export interface MentorProfile {
  id: string;
  userId: string;
  user?: User;
  firstName: string; // Keep for fallback or simplified use if needed
  lastName: string;
  professionalBackground: string;
  yearsExperience: number;
  expertiseAreas?: string[];
}

export interface SponsorProfile {
  id: string;
  userId: string;
  organizationName: string;
  description: string;
}

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  description: string;
  requirements: string;
  deadline: string;
  sponsorId: string;
  sponsorName?: string;
  applicantsCount?: number;
}

export interface OpportunityApplication {
  id: string;
  opportunityId: string;
  opportunityTitle?: string;
  userId: string;
  applicantName?: string;
  applicantInitials?: string;
  coverLetter: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface MentorshipApplication {
  id: string;
  programId?: string;
  programTitle?: string;
  mentorId: string;
  mentorName?: string;
  mentorInitials?: string;
  womanId: string;
  womanName?: string;
  womanInitials?: string;
  message: string;
  status: MentorshipStatus;
  createdAt: string;
}

export interface Mentorship {
  id: string;
  programId?: string;
  programTitle?: string;
  mentorId: string;
  mentorName?: string;
  womanId: string;
  womanName?: string;
  womanInitials?: string;
  startDate: string;
}

export interface MentorshipProgram {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  slots: number;
  duration?: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  _count?: {
    applications: number;
  };
}

export interface Test {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  questions?: Question[];
}

export interface Question {
  id: string;
  testId: string;
  content: string;
  answerOptions: AnswerOption[];
}

export interface AnswerOption {
  id: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
}

export interface UserTest {
  id: string;
  userId: string;
  testId: string;
  testTitle?: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface CreateOpportunityForm {
  title: string;
  type: OpportunityType;
  description: string;
  requirements: string;
  deadline: string;
}

export interface ApplyOpportunityForm {
  coverLetter: string;
  attachment?: File | null;
}
