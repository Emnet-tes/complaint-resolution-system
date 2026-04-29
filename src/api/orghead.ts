import api from './api';
import type { Department } from './orgadmin';

export type OrgHeadComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type OrgHeadComplaintStatus =
  | 'Submitted'
  | 'Manual Review'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | string;

export interface OrgHeadComplaintLocation {
  type: string;
  coordinates: number[];
  locationName: string | null;
}

export interface OrgHeadComplaintHistoryItem {
  _id: string;
  action: string;
  by: string | null;
  comment?: string;
  timestamp: string;
}

export interface OrgHeadComplaintAttachment {
  _id?: string;
  filename: string;
  path?: string;
  url?: string;
  uploadedAt: string;
}

export interface OrgHeadComplaint {
  _id: string;
  title: string;
  description: string;
  category?: string | null;
  location: OrgHeadComplaintLocation | null;
  submittedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  department:
    | {
        _id: string;
        code: string;
        name: string;
      }
    | null;
  organization: string;
  isSpam: boolean;
  aiConfidence: number;
  duplicateOf: string | null;
  assignedTo: string | null;
  status: OrgHeadComplaintStatus;
  priority: OrgHeadComplaintPriority | string;
  overriddenFields: Record<string, unknown>;
  history: OrgHeadComplaintHistoryItem[];
  syncStatus: string;
  attachments: OrgHeadComplaintAttachment[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  resolvedAt?: string;
}

export interface OverrideComplaintPayload {
  department?: string;
  priority?: OrgHeadComplaintPriority;
  status?: OrgHeadComplaintStatus;
  isSpam?: boolean;
  comment?: string;
}

export interface OrgHeadAnalyticsSummary {
  totalDepartments: number;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  overallResolutionRate: number;
  staleComplaints: number;
  avgResolutionTimeHours: number;
}

export interface OrgHeadDepartmentAnalytics {
  departmentId: string;
  name: string;
  total: number;
  resolved: number;
  pending: number;
  resolvedPercentage: number;
  avgResolutionTimeHours: number;
  newComplaintsLast30Days: number;
  performanceScore: number;
}

export interface OrgHeadInsights {
  problemDepartments: {
    name: string;
    resolvedPercentage: number;
    avgTime: number;
    pending: number;
  }[];
  topPerformers: OrgHeadDepartmentAnalytics[];
  monthlyTrends: {
    month: string;
    year: number;
    count: number;
  }[];
  needsAttention: boolean;
}

export interface OrgHeadRecommendation {
  type: string;
  priority: string;
  message: string;
  departments?: string[];
  suggestedAction?: string;
}

export interface OrgHeadAnalytics {
  summary: OrgHeadAnalyticsSummary;
  departments: OrgHeadDepartmentAnalytics[];
  insights: OrgHeadInsights;
  recommendations: OrgHeadRecommendation[];
  complaints?: OrgHeadComplaint[];
  recentComplaints?: OrgHeadComplaint[];
}

export const orgHeadApi = {
  getOrganizationComplaints: () =>
    api.get<OrgHeadComplaint[]>('/complaints/organization'),

  getAnalytics: () => api.get<OrgHeadAnalytics>('/analytics/org-head'),

  overrideComplaint: (id: string, data: OverrideComplaintPayload) =>
    api.put<{ message: string }>(`/complaints/${id}/override`, data),

  listDepartments: () => api.get<Department[]>('/departments'),
};

export default orgHeadApi;