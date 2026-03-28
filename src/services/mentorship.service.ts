import { api } from './api';
import type { MentorProfile, MentorshipApplication, Mentorship } from '../types';

export const mentorshipService = {
  // Women: Browse mentors
  getMentors: () => api.get<MentorProfile[]>('/mentors'),

  // Women: Apply for mentorship
  applyForMentorship: (mentorId: string, message: string) =>
    api.post<MentorshipApplication>('/mentorship/apply', { mentorId, message }),

  // Women: Get own mentorship applications
  getMyApplications: () => api.get<MentorshipApplication[]>('/mentorship/my-applications'),

  // Mentor: Get incoming requests
  getRequests: () => api.get<MentorshipApplication[]>('/mentorship/requests'),

  // Mentor: Accept/Reject a request
  reviewRequest: (applicationId: string, status: 'APPROVED' | 'REJECTED') =>
    api.patch(`/mentorship/requests/${applicationId}`, { status }),

  // Mentor: Get active mentees
  getMentees: () => api.get<Mentorship[]>('/mentorship/mentees'),
};
