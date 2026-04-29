import api from "./api";

// --- Types for Department Admins ---

export interface DeptAdmin {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  department:
    | string
    | {
        _id: string;
        name: string;
      };
  isActive?: boolean;
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
  isActive?: boolean;
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
}

// --- Types for Analytics ---

export interface OrgAdminAnalytics {
  summary: {
    totalDepartments: number;
    totalDepartmentHeads: number;
    activeDepartmentHeads: number;
    inactiveDepartmentHeads: number;
    departmentsWithHeads: number;
    departmentsWithoutHeads: number;
    departmentsWithActiveHeads: number;
    departmentsWithInactiveHeads: number;
    systemHealthScore: number;
  };
  departments: {
    departmentId: string;
    name: string;
    description: string;
    createdAt: string;
    headInfo: {
      id: string;
      name: string;
      email: string;
      isActive: boolean;
      lastLogin: string;
      isCurrentlyActive: boolean;
      inactiveDays: number;
    } | null;
    metrics: {
      hasHeadAssigned: boolean;
      headStatus: 'Active' | 'Inactive' | 'Unassigned' | string;
      totalComplaintsAssigned: number;
      newComplaintsLast30Days: number;
    };
  }[];
  insights: {
    unassignedDepartments: {
      name: string;
      createdAt: string;
    }[];
    inactiveHeadsList: {
      name: string;
      departmentName?: string;
      inactiveDays: number;
    }[];
    needsAttention: boolean;
  };
  recommendations: {
    type: string;
    priority: string;
    message: string;
    departments?: string[];
    suggestedAction?: string;
  }[];
}

export interface OrganizationComplaintLocation {
  type: string;
  coordinates: number[];
  locationName: string | null;
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


export interface OrganizationComplaintHistoryItem {
  _id: string;
  action: string;
  by: string | null;
  comment?: string;
  timestamp: string;
}


// --- API Implementation ---

export const orgAdminApi = {
  /**
   * DEPARTMENT ADMINS (/users/dept-headss)
   */

  // Create a new Department Head
  createDeptHead: (data: CreateDeptAdminPayload) =>
    api.post<DeptAdmin>("/users/dept-heads", data),

  // List all Department Heads in the OrgAdmin's organization
  listDeptHeads: () => api.get<DeptAdmin[]>("/users/dept-heads"),

  // Update a Department Head
  updateDeptHead: (id: string, data: UpdateDeptAdminPayload) =>
    api.put<DeptAdmin>(`/users/dept-heads/${id}`, data),

  // Deactivate a Department Head
  deactivateDeptHead: (id: string) =>
    api.put<{ message: string }>(`/users/dept-heads/${id}/deactivate`),

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

  // Get dashboard statistics for the logged-in OrgAdmin
  getAnalytics: () => api.get<OrgAdminAnalytics>("/analytics/org-admin"),
};

export default orgAdminApi;
