/** Minimal JSON bodies matching app expectations (see src/api/*.ts). */

export const stubSysAdminAnalytics = {
  overview: {
    total: 120,
    resolved: 90,
    pending: 30,
    resolvedPercentage: 75,
    avgResolutionTimeHours: 12,
    staleComplaints: 2,
    inactiveDepartmentHeads: 1,
    monthlyGrowthRate: 4.2,
  },
  trends: { monthly: [{ month: 'Jan', year: 2026, count: 10 }] },
  organizations: {
    all: [
      {
        organizationId: 'o1',
        name: 'Acme Org',
        total: 50,
        resolved: 40,
        pending: 10,
        resolvedPercentage: 80,
        avgResolutionTimeHours: 8,
        staleComplaints: 0,
        inactiveDepartmentHeads: 0,
        performanceScore: 88,
      },
    ],
    topPerformers: [],
    needsImprovement: [],
  },
  alerts: [],
  recommendations: [],
};

export const stubOrgAdminAnalytics = {
  summary: {
    totalDepartments: 3,
    totalDepartmentHeads: 4,
    activeDepartmentHeads: 3,
    inactiveDepartmentHeads: 1,
    departmentsWithHeads: 2,
    departmentsWithoutHeads: 1,
    departmentsWithActiveHeads: 2,
    departmentsWithInactiveHeads: 1,
    systemHealthScore: 72,
  },
  departments: [
    {
      departmentId: 'd1',
      name: 'Finance',
      description: 'Finance unit',
      createdAt: new Date().toISOString(),
      headInfo: {
        id: 'h1',
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        lastLogin: new Date().toISOString(),
        isCurrentlyActive: true,
        inactiveDays: 0,
      },
      metrics: {
        hasHeadAssigned: true,
        headStatus: 'Active',
        totalComplaintsAssigned: 45,
        newComplaintsLast30Days: 6,
      },
    },
    {
      departmentId: 'd2',
      name: 'HR',
      description: 'HR unit',
      createdAt: new Date().toISOString(),
      headInfo: {
        id: 'h2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        isActive: true,
        lastLogin: new Date().toISOString(),
        isCurrentlyActive: true,
        inactiveDays: 0,
      },
      metrics: {
        hasHeadAssigned: true,
        headStatus: 'Active',
        totalComplaintsAssigned: 0,
        newComplaintsLast30Days: 0,
      },
    },
  ],
  insights: {
    unassignedDepartments: [],
    inactiveHeadsList: [],
    needsAttention: false,
  },
  recommendations: [],
};

export const stubOrgHeadAnalytics = {
  summary: {
    totalDepartments: 2,
    totalComplaints: 24,
    resolvedComplaints: 10,
    pendingComplaints: 14,
    overallResolutionRate: 42,
    staleComplaints: 1,
    avgResolutionTimeHours: 18,
  },
  departments: [
    {
      departmentId: 'd1',
      name: 'Finance',
      total: 12,
      resolved: 5,
      pending: 7,
      resolvedPercentage: 42,
      avgResolutionTimeHours: 10,
      newComplaintsLast30Days: 2,
      performanceScore: 70,
    },
  ],
  insights: {
    problemDepartments: [],
    topPerformers: [],
    monthlyTrends: [{ month: 'Jan', year: 2026, count: 4 }],
    needsAttention: false,
  },
  recommendations: [],
};

export const stubDeptHeadAnalytics = {
  total: 15,
  resolved: 9,
  pending: 6,
  resolvedPercentage: 60,
  monthlyTrends: [{ month: 'Jan', year: 2026, count: 3 }],
  categoryStats: [{ category: 'Service', count: 10 }],
};

export const stubDeptHeadComplaints = [
  {
    _id: 'c1',
    title: 'Billing Error',
    description: 'Overcharged by $50',
    category: 'Billing',
    status: 'Submitted',
    priority: 'High',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    department: { _id: 'd1', name: 'Finance', code: 'FIN' },
  },
  {
    _id: 'c2',
    title: 'Water Leak',
    description: 'Large leak on Main St',
    category: 'Maintenance',
    status: 'In Progress',
    priority: 'Critical',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    department: { _id: 'd1', name: 'Finance', code: 'FIN' },
  }
];

/** One org-head complaint row (list + detail + navigation state). */
export const stubOrgHeadComplaint = {
  _id: 'orgheadcomplaint1',
  title: 'Late response',
  description: 'Detailed description',
  category: 'Service',
  location: null,
  submittedBy: { _id: 'u1', fullName: 'Citizen', email: 'citizen@example.com' },
  department: { _id: 'd1', code: 'FIN', name: 'Finance' },
  organization: 'org1',
  isSpam: false,
  aiConfidence: 0.9,
  duplicateOf: null,
  assignedTo: null,
  priority: 'Medium',
  overriddenFields: {},
  history: [],
  syncStatus: 'ok',
  attachments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  __v: 0,
  status: 'In Progress' as const,
};

export const stubAssignedDeptComplaint = {
  _id: 'deptcomplaint1',
  title: 'Payment issue',
  description: 'Payment did not post.',
  category: 'Billing',
  status: 'In Progress',
  department: { _id: 'd1', name: 'Finance', code: 'FIN' },
  submittedBy: { _id: 'u1', fullName: 'User', email: 'u@example.com' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const stubDepartment = {
  _id: 'd1',
  name: 'Finance',
  code: 'FIN',
  description: 'Finance',
  head: 'h1',
  organization: { _id: 'org1', name: 'Org' },
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const stubDeptHeadUser = {
  _id: 'h1',
  fullName: 'John Doe',
  email: 'john@example.com',
  role: 'DeptHead',
  department: { _id: 'd1', name: 'Finance' },
  isActive: true,
};
