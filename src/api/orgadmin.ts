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

  // Get dashboard statistics for the logged-in OrgAdmin
  getAnalytics: () => api.get<OrgAdminAnalytics>("/analytics/org-admin"),
};

export default orgAdminApi;
