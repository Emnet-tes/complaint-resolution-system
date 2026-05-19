import { http, HttpResponse } from 'msw';

const BASE = import.meta.env.VITE_API_URL;

export const handlers = [
  // ── Auth ─────────────────────────────────────────────────────────────────
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({
      message: 'Login successful',
      _id: 'user-1',
      role: 'OrgHead',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 900,
    }),
  ),

  http.post(`${BASE}/auth/refresh`, () =>
    HttpResponse.json({
      accessToken: 'mock-access-token-refreshed',
      refreshToken: 'mock-refresh-token-refreshed',
      expiresIn: 900,
    }),
  ),

  http.get(`${BASE}/auth/profile`, () =>
    HttpResponse.json({
      _id: 'user-1',
      fullname: 'Test User',
      email: 'test@example.com',
      role: 'OrgHead',
    }),
  ),

  http.post(`${BASE}/auth/logout`, () => HttpResponse.json({ message: 'Logged out' })),

  http.post(`${BASE}/auth/change-password`, () =>
    HttpResponse.json({ message: 'Password changed successfully' }),
  ),

  http.post(`${BASE}/auth/forgot-password`, () =>
    HttpResponse.json({ message: 'Reset link sent' }),
  ),

  http.post(`${BASE}/auth/forgot-password-otp`, () =>
    HttpResponse.json({ message: 'OTP sent' }),
  ),

  http.post(`${BASE}/auth/reset-password`, () =>
    HttpResponse.json({ message: 'Password reset' }),
  ),

  http.post(`${BASE}/auth/reset-password-otp`, () =>
    HttpResponse.json({ message: 'Password reset' }),
  ),

  // ── Notifications ─────────────────────────────────────────────────────────
  http.get(`${BASE}/notifications`, () =>
    HttpResponse.json([
      { _id: 'n1', user: 'u1', type: 'STATUS_UPDATED', title: 'New complaint', message: 'New complaint submitted', read: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { _id: 'n2', user: 'u1', type: 'STATUS_UPDATED', title: 'Resolved', message: 'Complaint resolved', read: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]),
  ),

  http.put(`${BASE}/notifications/:id/read`, () =>
    HttpResponse.json({ message: 'Marked as read' }),
  ),

  http.put(`${BASE}/notifications/read-all`, () =>
    HttpResponse.json({ message: 'All marked as read' }),
  ),

  // ── OrgHead ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/analytics/org-head`, () =>
    HttpResponse.json({
      summary: {
        totalDepartments: 3,
        totalComplaints: 120,
        resolvedComplaints: 95,
        pendingComplaints: 25,
        overallResolutionRate: 79,
        staleComplaints: 5,
        avgResolutionTimeHours: 48,
      },
      departments: [],
      insights: { problemDepartments: [], topPerformers: [], monthlyTrends: [], needsAttention: false },
      recommendations: [],
    }),
  ),

  http.get(`${BASE}/complaints/organization`, () =>
    HttpResponse.json([
      {
        _id: 'c1',
        title: 'Test Complaint',
        description: 'A test complaint',
        category: null,
        location: null,
        submittedBy: { _id: 'u1', fullName: 'Alice', email: 'alice@example.com' },
        department: { _id: 'd1', name: 'IT', code: 'IT' },
        organization: 'org1',
        isSpam: false,
        aiConfidence: 0.9,
        duplicateOf: null,
        assignedTo: null,
        status: 'Submitted',
        priority: 'Medium',
        overriddenFields: {},
        history: [],
        syncStatus: 'synced',
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      },
    ]),
  ),

  http.put(`${BASE}/complaints/:id/override`, () =>
    HttpResponse.json({ message: 'Complaint overridden successfully' }),
  ),

  http.get(`${BASE}/departments`, () =>
    HttpResponse.json([{ _id: 'd1', name: 'IT', code: 'IT' }]),
  ),

  // ── SysAdmin ──────────────────────────────────────────────────────────────
  http.get(/\/audit-logs\/activities/, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    
    return HttpResponse.json({
      data: [
        {
          _id: `act1-page${page}`,
          action: 'LOGIN',
          description: `User login on page ${page}`,
          user: { fullName: 'Admin User', email: 'admin@example.com' },
          targetType: 'Auth',
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
        }
      ],
      pagination: {
        page: Number(page),
        limit: 20,
        pages: 2,
        total: 40
      }
    });
  }),

  http.get(/\/audit-logs\/summary/, () =>
    HttpResponse.json({
      summary: {
        totalActiveAdmins: 5,
        last30Days: {
          userManagementActions: 10,
          organizationChanges: 2,
          departmentChanges: 3,
        },
        recentActivities: []
      }
    }),
  ),

  http.get(`${BASE}/users/dept-heads`, () =>
    HttpResponse.json([{ _id: 'dh1', fullname: 'Head Person', email: 'head@example.com' }]),
  ),

  // ── DeptAdmin ─────────────────────────────────────────────────────────────
  http.get(`${BASE}/complaints/assigned`, () =>
    HttpResponse.json([
      {
        _id: 'c1',
        title: 'Network Issue',
        description: 'Cannot connect to Wi-Fi',
        status: 'Submitted',
        priority: 'High',
        department: { _id: 'd1', name: 'IT' },
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'c2',
        title: 'Printer broken',
        description: 'Paper jam in room 101',
        status: 'Resolved',
        priority: 'Low',
        department: { _id: 'd1', name: 'IT' },
        createdAt: new Date().toISOString(),
      }
    ]),
  ),
];
