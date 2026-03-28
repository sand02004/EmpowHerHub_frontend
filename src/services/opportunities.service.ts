import { api } from './api';
import type { Opportunity, OpportunityApplication, CreateOpportunityForm } from '../types';

export const opportunitiesService = {
  
  getAll: () => api.get<Opportunity[]>('/opportunities'),


  
  getMine: () => api.get<Opportunity[]>('/opportunities/mine'),

  // Sponsor: Create opportunity
  create: (data: CreateOpportunityForm) => api.post<Opportunity>('/opportunities', data),

  // Sponsor: Update opportunity
  update: (id: string, data: Partial<CreateOpportunityForm>) =>
    api.patch<Opportunity>(`/opportunities/${id}`, data),

  // Sponsor: Delete opportunity
  delete: (id: string) => api.delete(`/opportunities/${id}`),

  // Sponsor: Get applicants for an opportunity
  getApplicants: (opportunityId: string) =>
    api.get<OpportunityApplication[]>(`/opportunities/${opportunityId}/applications`),

  // Sponsor: Accept or reject applicant
  reviewApplication: (applicationId: string, status: 'APPROVED' | 'REJECTED') =>
    api.patch(`/applications/${applicationId}/review`, { status }),

  // Women: Apply to opportunity
  apply: (opportunityId: string, formData: FormData) =>
    api.post<OpportunityApplication>(`/opportunities/${opportunityId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Women: Get own applications
  getMyApplications: () => api.get<OpportunityApplication[]>('/opportunities/my-applications'),
};
