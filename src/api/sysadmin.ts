import api from "./api";

// --- Types for Organizations ---

export interface Organization {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationPayload {
  name: string;
  code: string;
}

// --- Types for Organization Admins ---

export interface OrgAdmin {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  organization: {
    _id: string;
    name: string;
  };
  department?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface CreateOrgAdminPayload {
  fullName: string;
  email: string;
  password?: string;
  organizationId: string; // Swagger: "organizationId": "string"
}

export interface UpdateOrgAdminPayload {
  fullName?: string;
  email?: string;
  password?: string;
  organizationId?: string;
}

// --- Types for Analytics ---

export interface SysAdminAnalytics {
  overall: {
    total: number;
    resolved: number;
    pending: number;
    resolvedPercentage: number;
  };
  organizations: {
    organizationId: string;
    name: string;
    total: number;
    resolved: number;
    pending: number;
    resolvedPercentage: number;
  }[];
}

// --- API Implementation ---

export const sysAdminApi = {
  /**
   * ORGANIZATION ADMINS (/users/org-admins)
   */
  
  // Create a new Organization Admin
  createOrgAdmin: (data: CreateOrgAdminPayload) => 
    api.post<OrgAdmin>("/users/org-admins", data),

  // List all Organization Admins
  listOrgAdmins: () => 
    api.get<OrgAdmin[]>("/users/org-admins"),

  // Update an Organization Admin
  updateOrgAdmin: (id: string, data: UpdateOrgAdminPayload) =>
    api.put<OrgAdmin>(`/users/org-admins/${id}`, data),

  // Deactivate an Organization Admin
  deactivateOrgAdmin: (id: string, payload?: { message: string }) =>
    api.put<{ message: string }>(`/users/org-admins/${id}/deactivate`, payload),

  /**
   * ORGANIZATIONS (/organizations)
   */

  // Create a new organization
  createOrganization: (data: CreateOrganizationPayload) =>
    api.post<Organization>("/organizations", data),

  // List all active organizations
  listOrganizations: () => 
    api.get<Organization[]>("/organizations"),

  // Update organization
  updateOrganization: (id: string, data: Partial<CreateOrganizationPayload>) =>
    api.put<Organization>(`/organizations/${id}`, data),

  // Deactivate organization
  deactivateOrganization: (id: string, payload?: { message: string }) =>
    api.put<{ message: string }>(`/organizations/${id}/deactivate`, payload),

  /**
   * ANALYTICS (/analytics/sys-admin)
   */

  // Get dashboard statistics for SysAdmin
  getAnalytics: () => 
    api.get<SysAdminAnalytics>("/analytics/sys-admin"),
};

export default sysAdminApi;