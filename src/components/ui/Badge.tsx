import React from 'react';
import type { AccountStatus, ApplicationStatus, MentorshipStatus, OpportunityType } from '../../types';

type BadgeStatus = AccountStatus | ApplicationStatus | MentorshipStatus | OpportunityType | string;

interface BadgeProps {
  status: BadgeStatus;
  className?: string;
}

const statusStyles: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-200',
  IN_REVIEW: 'bg-blue-50 text-blue-700 border border-blue-200',
  APPROVED:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border border-red-200',
  Internship: 'bg-primary/10 text-primary border border-primary/20',
  Scholarship: 'bg-secondary/10 text-secondary border border-secondary/20',
  Training: 'bg-blue-50 text-blue-700 border border-blue-200',
  Job: 'bg-violet-50 text-violet-700 border border-violet-200',
  woman: 'bg-pink-50 text-pink-700 border border-pink-200',
  mentor: 'bg-primary/10 text-primary border border-primary/20',
  sponsor: 'bg-secondary/10 text-secondary border border-secondary/20',
  admin: 'bg-gray-100 text-gray-700 border border-gray-200',
};

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-600 border border-gray-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${style} ${className}`}
    >
      {status}
    </span>
  );
};
