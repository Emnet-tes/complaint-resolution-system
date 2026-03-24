import api from "./api";

// SysAdmin-specific API endpoints
export const sysAdminApi = {
  // Create a new Organization Admin (SysAdmin only)
  createOrgAdmin: (data: {
    fullName: string;
    email: string;
    password: string;
    organization: string;
  }) => api.post("/users/org-admins", data),

  // List users (SysAdmin sees all, OrgAdmin sees their own DeptAdmins & Citizens)
  listUsers: () => api.get("/users"),
};

export default sysAdminApi;
