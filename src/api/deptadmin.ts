import api from "./api";

export type ComplaintStatus = "Submitted" | "In Progress" | "Resolved" | "Rejected";

export interface AssignedComplaintsSummary {
  total: number;
  resolved: number;
  pending: number;
  resolvedPercentage: number;
}

export interface ComplaintLocation {
  type: string;
  coordinates: number[];
  locationName?: string;
}

export interface ComplaintHistoryItem {
  action: string;
  by?: {
    _id: string;
    fullName: string;
  };
  comment?: string;
  timestamp: string;
}

export interface AssignedComplaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  location?: ComplaintLocation;
  images?: { path: string; uploadedAt: string }[];
  submittedBy?: { _id: string; fullName: string; email: string };
  department?: { _id: string; name: string; code: string };
  assignedTo?: { _id: string; fullName: string; email: string };
  status: ComplaintStatus;
  priority?: "Low" | "Medium" | "High" | "Critical" | string;
  history?: ComplaintHistoryItem[];
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignedComplaintsResponse {
  summary: AssignedComplaintsSummary;
  data: AssignedComplaint[];
}

export interface DeptAdminAnalytics {
  total: number;
  resolved: number;
  pending: number;
  resolvedPercentage: number;
}

export const deptAdminApi = {
  getAssignedComplaints: () =>
    api.get<AssignedComplaint[]>("/complaints/assigned"),

  updateComplaintStatus: (
    id: string,
    data: { status: ComplaintStatus; comment?: string },
  ) => api.put<{ message: string }>(`/complaints/${id}/status`, data),

  getAnalytics: () => api.get<DeptAdminAnalytics>("/analytics/dept-admin"),
};

export default deptAdminApi;

