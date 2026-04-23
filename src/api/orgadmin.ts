import api from "./api";

// --- Types for Department Admins ---

export interface DeptAdmin {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  department: string; // ID or name depending on population
}

export interface CreateDeptAdminPayload {
  fullName: string;
  email: string;
  password?: string;
  departmentId: string;
}

export interface UpdateDeptAdminPayload {
  fullName?: string;
  email?: string;
  password?: string;
  departmentId?: string;
}

// --- Types for Departments ---

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  head: string; // Based on Swagger Example: "head": "string"
  organization: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description: string;
  head: string; // Send the ID of the Dept Admin
}

export interface UpdateDepartmentPayload {
  name?: string;
  code?: string;
  description?: string;
  head?: string;
}

// --- Types for Analytics ---

export interface OrgAdminAnalytics {
  summary: {
    totalDepartments: number;
    totalAdmins: number;
    totalResolved: number;
    totalPending: number;
  };
  departments: {
    departmentId: string;
    name: string;
    total: number;
    resolved: number;
    pending: number;
    resolvedPercentage: number;
  }[];
}

// --- Types for Organization Complaints ---

export interface OrganizationComplaintLocation {
  type: string;
  coordinates: number[];
  locationName: string | null;
}

export interface OrganizationComplaintHistoryItem {
  _id: string;
  action: string;
  by: string | null;
  comment?: string;
  timestamp: string;
}

export interface OrganizationComplaint {
  _id: string;
  title: string;
  description: string;
  location: OrganizationComplaintLocation | null;
  category: string | null;
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
  status: string;
  priority: string;
  overriddenFields: Record<string, unknown>;
  history: OrganizationComplaintHistoryItem[];
  syncStatus: string;
  attachments: {
    _id: string;
    filename: string;
    path: string;
    uploadedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  resolvedAt?: string;
}

// --- API Implementation ---

export const orgAdminApi = {
  /**
   * DEPARTMENT ADMINS (/users/dept-admins)
   */

  // Create a new Department Admin
  createDeptAdmin: (data: CreateDeptAdminPayload) =>
    api.post<DeptAdmin>("/users/dept-admins", data),

  // List all Department Admins in the OrgAdmin's organization
  listDeptAdmins: () => api.get<DeptAdmin[]>("/users/dept-admins"),

  // Update a Department Admin
  updateDeptAdmin: (id: string, data: UpdateDeptAdminPayload) =>
    api.put<DeptAdmin>(`/users/dept-admins/${id}`, data),

  // Deactivate a Department Admin
  deactivateDeptAdmin: (id: string) =>
    api.put<{ message: string }>(`/users/dept-admins/${id}/deactivate`),

  /**
   * DEPARTMENTS (/departments)
   */

  // Create new department
  createDepartment: (data: CreateDepartmentPayload) =>
    api.post<Department>("/departments", data),

  // List all active departments
  listDepartments: () => api.get<Department[]>("/departments"),

  // Update department
  updateDepartment: (id: string, data: UpdateDepartmentPayload) =>
    api.put<Department>(`/departments/${id}`, data),

  // Deactivate department
  deactivateDepartment: (id: string) =>
    api.put<{ message: string }>(`/departments/${id}/deactivate`),

  /**
   * ANALYTICS
   */

  /**
   * COMPLAINTS
   */

  // Get all complaints in the logged-in OrgAdmin's organization
  getOrganizationComplaints: () =>
    api.get<OrganizationComplaint[]>('/complaints/organization'),

  // Get dashboard statistics for the logged-in OrgAdmin
  getAnalytics: () => api.get<OrgAdminAnalytics>("/analytics/org-admin"),
};

export default orgAdminApi;
