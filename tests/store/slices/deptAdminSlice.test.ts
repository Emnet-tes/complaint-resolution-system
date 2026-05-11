import { describe, it, expect, vi, beforeEach } from 'vitest';
import deptAdminReducer, {
  fetchDeptAdminComplaints,
  fetchDeptAdminAnalytics,
  updateDeptAdminComplaintStatusThunk,
  fetchDeptAdminCommentsThunk,
  addDeptAdminCommentThunk,
  selectDeptAdmin,
} from '../../../src/store/slices/deptAdminSlice';
import { deptAdminApi } from '../../../src/api/deptadmin';
import { createTestStore } from '../../helpers/testUtils';

vi.mock('../../../src/api/deptadmin', () => ({
  deptAdminApi: {
    getAssignedComplaints: vi.fn(),
    getAnalytics: vi.fn(),
    updateComplaintStatus: vi.fn(),
    getComments: vi.fn(),
    addComment: vi.fn(),
  },
}));

describe('deptAdminSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reducer initial state', () => {
    it('returns initial state', () => {
      const state = deptAdminReducer(undefined, { type: '@@INIT' });
      expect(state).toEqual({
        complaints: [],
        analytics: null,
        commentsByComplaint: {},
        loading: false,
        submitting: false,
        error: null,
      });
    });
  });

  describe('fetchDeptAdminComplaints', () => {
    it('handles pending state', () => {
      const state = deptAdminReducer(undefined, { type: fetchDeptAdminComplaints.pending.type });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('populates complaints on fulfilled', async () => {
      const mockComplaints = [{ _id: 'c1', title: 'Issue' }];
      vi.mocked(deptAdminApi.getAssignedComplaints).mockResolvedValueOnce({ data: mockComplaints } as any);
      
      const store = createTestStore();
      await store.dispatch(fetchDeptAdminComplaints());
      
      const state = selectDeptAdmin(store.getState());
      expect(state.loading).toBe(false);
      expect(state.complaints).toEqual(mockComplaints);
    });

    it('sets error on rejection', async () => {
      vi.mocked(deptAdminApi.getAssignedComplaints).mockRejectedValueOnce(new Error('Network Error'));
      
      const store = createTestStore();
      await store.dispatch(fetchDeptAdminComplaints());
      
      const state = selectDeptAdmin(store.getState());
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch assigned complaints');
    });
  });

  describe('fetchDeptAdminAnalytics', () => {
    it('populates analytics on fulfilled', async () => {
      const mockAnalytics = { total: 10, resolved: 5, pending: 5, resolvedPercentage: 50 };
      vi.mocked(deptAdminApi.getAnalytics).mockResolvedValueOnce({ data: mockAnalytics } as any);
      
      const store = createTestStore();
      await store.dispatch(fetchDeptAdminAnalytics());
      
      const state = selectDeptAdmin(store.getState());
      expect(state.analytics).toEqual(mockAnalytics);
    });
  });

  describe('updateDeptAdminComplaintStatusThunk', () => {
    const initialState = {
      complaints: [{ _id: 'c1', status: 'Submitted' as any, title: 'Test' } as any],
      analytics: null,
      commentsByComplaint: {},
      loading: false,
      submitting: false,
      error: null,
    };

    it('sets submitting to true while pending', () => {
      const state = deptAdminReducer(initialState, { type: updateDeptAdminComplaintStatusThunk.pending.type });
      expect(state.submitting).toBe(true);
    });

    it('updates status on fulfilled', async () => {
      vi.mocked(deptAdminApi.updateComplaintStatus).mockResolvedValueOnce({} as any);
      
      const store = createTestStore({ deptAdmin: initialState });
      await store.dispatch(updateDeptAdminComplaintStatusThunk({ id: 'c1', status: 'Resolved' }));
      
      const state = selectDeptAdmin(store.getState());
      expect(state.submitting).toBe(false);
      expect(state.complaints[0].status).toBe('Resolved');
    });

    it('sets error on rejection', async () => {
      vi.mocked(deptAdminApi.updateComplaintStatus).mockRejectedValueOnce({
        response: { data: { message: 'Cannot update status' } }
      });
      
      const store = createTestStore({ deptAdmin: initialState });
      await store.dispatch(updateDeptAdminComplaintStatusThunk({ id: 'c1', status: 'Resolved' }));
      
      const state = selectDeptAdmin(store.getState());
      expect(state.submitting).toBe(false);
      expect(state.error).toBe('Cannot update status');
    });
  });

  describe('comments thunks', () => {
    const mockComments = [{ _id: 'com1', commentText: 'Test comment' }];

    it('fetchDeptAdminCommentsThunk sets comments by id on fulfilled', async () => {
      vi.mocked(deptAdminApi.getComments).mockResolvedValueOnce({ data: mockComments } as any);
      
      const store = createTestStore();
      await store.dispatch(fetchDeptAdminCommentsThunk({ complaintId: 'c1' }));
      
      const state = selectDeptAdmin(store.getState());
      expect(state.commentsByComplaint['c1']).toEqual(mockComments);
    });

    it('addDeptAdminCommentThunk fetches and sets comments by id on fulfilled', async () => {
      vi.mocked(deptAdminApi.addComment).mockResolvedValueOnce({} as any);
      vi.mocked(deptAdminApi.getComments).mockResolvedValueOnce({ data: mockComments } as any);
      
      const store = createTestStore();
      await store.dispatch(addDeptAdminCommentThunk({ complaintId: 'c1', commentText: 'New comment' }));
      
      const state = selectDeptAdmin(store.getState());
      expect(state.commentsByComplaint['c1']).toEqual(mockComments);
      expect(deptAdminApi.addComment).toHaveBeenCalledWith('c1', { commentText: 'New comment' });
      expect(deptAdminApi.getComments).toHaveBeenCalledWith('c1');
    });
  });
});
