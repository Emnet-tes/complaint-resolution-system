import { describe, it, expect } from 'vitest';
import orgHeadReducer, {
  fetchOrgHeadAnalytics,
  fetchOrgHeadDirectory,
  fetchOrgHeadComplaints,
  overrideOrgHeadComplaintThunk,
  fetchOrgHeadCommentsThunk,
  addOrgHeadCommentThunk,
  selectOrgHead,
} from '../../../src/store/slices/orgHeadSlice';
import { orgHeadApi } from '../../../src/api/orghead';
import { createTestStore } from '../../helpers/testUtils';

const initialState = {
  analytics: null,
  complaints: [],
  departments: [],
  deptHeads: [],
  commentsByComplaint: {},
  loading: false,
  submitting: false,
  error: null,
};

const mockComplaint = {
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
  status: 'Submitted' as const,
  priority: 'Medium' as const,
  overriddenFields: {},
  history: [],
  syncStatus: 'synced',
  attachments: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  __v: 0,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
describe('orgHeadSlice reducer', () => {
  it('returns the initial state', () => {
    expect(orgHeadReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('sets loading=true on fetchOrgHeadAnalytics.pending', () => {
    const state = orgHeadReducer(
      initialState,
      fetchOrgHeadAnalytics.pending('', undefined),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('sets analytics on fetchOrgHeadAnalytics.fulfilled', () => {
    const analytics = {
      summary: {
        totalDepartments: 3,
        totalComplaints: 50,
        resolvedComplaints: 40,
        pendingComplaints: 10,
        overallResolutionRate: 80,
        staleComplaints: 2,
        avgResolutionTimeHours: 24,
      },
      departments: [],
      insights: {
        problemDepartments: [],
        topPerformers: [],
        monthlyTrends: [],
        needsAttention: false,
      },
      recommendations: [],
    };
    const state = orgHeadReducer(
      { ...initialState, loading: true },
      fetchOrgHeadAnalytics.fulfilled(analytics, '', undefined),
    );
    expect(state.loading).toBe(false);
    expect(state.analytics).toEqual(analytics);
  });

  it('sets error on fetchOrgHeadAnalytics.rejected', () => {
    const state = orgHeadReducer(
      { ...initialState, loading: true },
      fetchOrgHeadAnalytics.rejected(null, '', undefined, 'Network error'),
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('sets submitting=true on overrideOrgHeadComplaintThunk.pending', () => {
    const state = orgHeadReducer(
      initialState,
      overrideOrgHeadComplaintThunk.pending('', { id: 'c1', data: {} }),
    );
    expect(state.submitting).toBe(true);
  });

  it('updates the targeted complaint on override fulfilled', () => {
    const state = orgHeadReducer(
      { ...initialState, complaints: [mockComplaint], departments: [{ _id: 'd1', name: 'IT', code: 'IT' }] } as any,
      overrideOrgHeadComplaintThunk.fulfilled(
        { id: 'c1', data: { status: 'resolved' as const } },
        '',
        { id: 'c1', data: { status: 'resolved' as const } },
      ),
    );
    expect(state.submitting).toBe(false);
    expect(state.complaints[0].status).toBe('resolved');
  });

  it('leaves other complaints unchanged on override fulfilled', () => {
    const c2 = { ...mockComplaint, _id: 'c2', status: 'pending' as const };
    const state = orgHeadReducer(
      { ...initialState, complaints: [mockComplaint, c2], departments: [] } as any,
      overrideOrgHeadComplaintThunk.fulfilled(
        { id: 'c1', data: { status: 'resolved' as const } },
        '',
        { id: 'c1', data: { status: 'resolved' as const } },
      ),
    );
    expect(state.complaints.find((c: any) => c._id === 'c2')?.status).toBe('pending');
  });

  it('stores comments keyed by complaintId on fetchOrgHeadCommentsThunk.fulfilled', () => {
    const comments = [{ _id: 'cm1', text: 'Note', author: 'user1' }];
    const state = orgHeadReducer(
      initialState,
      fetchOrgHeadCommentsThunk.fulfilled(
        { complaintId: 'c1', comments } as any,
        '',
        { complaintId: 'c1' },
      ),
    );
    expect(state.commentsByComplaint['c1']).toEqual(comments);
  });
});

// ─── Selector ─────────────────────────────────────────────────────────────────
describe('selectOrgHead selector', () => {
  it('returns the orgHead slice', () => {
    const store = createTestStore({
      orgHead: { ...initialState, complaints: [mockComplaint] } as any,
    });
    const slice = selectOrgHead(store.getState());
    expect(slice.complaints).toHaveLength(1);
  });
});

// ─── Async thunks (via MSW) ───────────────────────────────────────────────────
describe('orgHeadSlice async thunks', () => {
  describe('fetchOrgHeadAnalytics', () => {
    it('fulfils and stores analytics', async () => {
      const store = createTestStore();
      await store.dispatch(fetchOrgHeadAnalytics());
      expect(store.getState().orgHead.analytics).not.toBeNull();
      expect(store.getState().orgHead.loading).toBe(false);
    });
  });

  describe('fetchOrgHeadDirectory', () => {
    it('fulfils and populates complaints, departments, deptHeads', async () => {
      const store = createTestStore();
      await store.dispatch(fetchOrgHeadDirectory());
      const state = store.getState().orgHead;
      expect(state.complaints.length).toBeGreaterThan(0);
      expect(state.departments.length).toBeGreaterThan(0);
      expect(state.deptHeads.length).toBeGreaterThan(0);
    });

    it('still populates complaints when departments or dept heads fail', async () => {
      const complaint = { ...mockComplaint, _id: 'c-directory-fallback' };

      vi.spyOn(orgHeadApi, 'getOrganizationComplaints').mockResolvedValueOnce({ data: [complaint] } as any);
      vi.spyOn(orgHeadApi, 'listDepartments').mockRejectedValueOnce(new Error('Departments failed'));
      vi.spyOn(orgHeadApi, 'listDeptHeads').mockRejectedValueOnce(new Error('Dept heads failed'));

      const store = createTestStore();
      await store.dispatch(fetchOrgHeadDirectory());

      const state = store.getState().orgHead;
      expect(state.complaints).toEqual([complaint]);
      expect(state.departments).toEqual([]);
      expect(state.deptHeads).toEqual([]);
    });
  });

  describe('fetchOrgHeadComplaints', () => {
    it('populates the complaints array', async () => {
      const store = createTestStore();
      await store.dispatch(fetchOrgHeadComplaints());
      expect(store.getState().orgHead.complaints.length).toBeGreaterThan(0);
    });
  });
});
