import { describe, it, expect, vi, beforeEach } from 'vitest';
import orgAdminReducer, {
  fetchOrgAdminAnalytics,
  fetchOrgAdminDirectory,
  createDepartmentThunk,
  updateDepartmentThunk,
  deactivateDepartmentThunk,
  createDeptHeadThunk,
  updateDeptHeadThunk,
  deactivateDeptHeadThunk,
  selectOrgAdmin,
} from '../../../src/store/slices/orgAdminSlice';
import { orgAdminApi } from '../../../src/api/orgadmin';
import { createTestStore } from '../../helpers/testUtils';

vi.mock('../../../src/api/orgadmin', () => ({
  orgAdminApi: {
    getAnalytics: vi.fn(),
    listDepartments: vi.fn(),
    listDeptHeads: vi.fn(),
    createDepartment: vi.fn(),
    updateDepartment: vi.fn(),
    deactivateDepartment: vi.fn(),
    createDeptHead: vi.fn(),
    updateDeptHead: vi.fn(),
    deactivateDeptHead: vi.fn(),
  },
}));

describe('orgAdminSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reducer initial state', () => {
    it('returns initial state', () => {
      const state = orgAdminReducer(undefined, { type: '@@INIT' });
      expect(state).toEqual({
        analytics: null,
        departments: [],
        deptHeads: [],
        loading: false,
        submitting: false,
        error: null,
      });
    });
  });

  describe('fetchOrgAdminAnalytics', () => {
    it('handles pending state', () => {
      const state = orgAdminReducer(undefined, { type: fetchOrgAdminAnalytics.pending.type });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('populates analytics on fulfilled', async () => {
      const mockAnalytics = { totalComplaints: 50 } as any;
      vi.mocked(orgAdminApi.getAnalytics).mockResolvedValueOnce({ data: mockAnalytics } as any);
      
      const store = createTestStore();
      await store.dispatch(fetchOrgAdminAnalytics());
      
      const state = selectOrgAdmin(store.getState());
      expect(state.loading).toBe(false);
      expect(state.analytics).toEqual(mockAnalytics);
    });

    it('sets error on rejection', async () => {
      vi.mocked(orgAdminApi.getAnalytics).mockRejectedValueOnce(new Error('Network error'));
      
      const store = createTestStore();
      await store.dispatch(fetchOrgAdminAnalytics());
      
      const state = selectOrgAdmin(store.getState());
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch organization analytics');
    });
  });

  describe('fetchOrgAdminDirectory', () => {
    it('populates departments and deptHeads on fulfilled', async () => {
      const mockDepts = [{ _id: 'd1', name: 'HR' }];
      const mockHeads = [{ _id: 'h1', fullname: 'John' }];
      vi.mocked(orgAdminApi.listDepartments).mockResolvedValueOnce({ data: mockDepts } as any);
      vi.mocked(orgAdminApi.listDeptHeads).mockResolvedValueOnce({ data: mockHeads } as any);
      
      const store = createTestStore();
      await store.dispatch(fetchOrgAdminDirectory());
      
      const state = selectOrgAdmin(store.getState());
      expect(state.departments).toEqual(mockDepts);
      expect(state.deptHeads).toEqual(mockHeads);
    });

    it('sets error if one of the promises rejects', async () => {
      vi.mocked(orgAdminApi.listDepartments).mockResolvedValueOnce({ data: [] } as any);
      vi.mocked(orgAdminApi.listDeptHeads).mockRejectedValueOnce(new Error('Fail'));
      
      const store = createTestStore();
      await store.dispatch(fetchOrgAdminDirectory());
      
      const state = selectOrgAdmin(store.getState());
      expect(state.error).toBe('Failed to fetch departments and heads');
    });
  });

  describe('department thunks', () => {
    const initialState = {
      analytics: null,
      departments: [{ _id: 'd1', name: 'HR', isActive: true } as any],
      deptHeads: [],
      loading: false,
      submitting: false,
      error: null,
    };

    it('createDepartmentThunk adds new department to the list', async () => {
      const newDept = { _id: 'd2', name: 'IT' };
      vi.mocked(orgAdminApi.createDepartment).mockResolvedValueOnce({ data: newDept } as any);
      
      const store = createTestStore({ orgAdmin: initialState });
      await store.dispatch(createDepartmentThunk({ name: 'IT', code: 'IT', description: '', head: '' }));
      
      const state = selectOrgAdmin(store.getState());
      // new items are added at the beginning
      expect(state.departments).toEqual([newDept, initialState.departments[0]]);
    });

    it('updateDepartmentThunk updates existing department', async () => {
      const updatedDept = { _id: 'd1', name: 'HR Updated', isActive: true };
      vi.mocked(orgAdminApi.updateDepartment).mockResolvedValueOnce({ data: updatedDept } as any);
      
      const store = createTestStore({ orgAdmin: initialState });
      await store.dispatch(updateDepartmentThunk({ id: 'd1', data: { name: 'HR Updated', code: '', description: '' } }));
      
      const state = selectOrgAdmin(store.getState());
      expect(state.departments[0].name).toBe('HR Updated');
    });

    it('deactivateDepartmentThunk sets isActive to false', async () => {
      vi.mocked(orgAdminApi.deactivateDepartment).mockResolvedValueOnce({} as any);
      
      const store = createTestStore({ orgAdmin: initialState });
      await store.dispatch(deactivateDepartmentThunk({ id: 'd1' }));
      
      const state = selectOrgAdmin(store.getState());
      expect(state.departments[0].isActive).toBe(false);
    });
  });

  describe('deptHead thunks', () => {
    const initialState = {
      analytics: null,
      departments: [],
      deptHeads: [{ _id: 'h1', fullname: 'Alice', isActive: true } as any],
      loading: false,
      submitting: false,
      error: null,
    };

    it('createDeptHeadThunk adds new dept head to the list', async () => {
      const newHead = { _id: 'h2', fullname: 'Bob' };
      vi.mocked(orgAdminApi.createDeptHead).mockResolvedValueOnce({ data: newHead } as any);
      
      const store = createTestStore({ orgAdmin: initialState });
      await store.dispatch(createDeptHeadThunk({ fullName: 'Bob', email: '', password: '', departmentId: '' }));
      
      const state = selectOrgAdmin(store.getState());
      expect(state.deptHeads[0]).toEqual(newHead);
    });

    it('updateDeptHeadThunk updates existing dept head', async () => {
      const updatedHead = { _id: 'h1', fullname: 'Alice Smith', isActive: true };
      vi.mocked(orgAdminApi.updateDeptHead).mockResolvedValueOnce({ data: updatedHead } as any);
      
      const store = createTestStore({ orgAdmin: initialState });
      await store.dispatch(updateDeptHeadThunk({ id: 'h1', data: { fullName: 'Alice Smith', email: '', departmentId: '' } }));
      
      const state = selectOrgAdmin(store.getState());
      expect(state.deptHeads[0].fullname).toBe('Alice Smith');
    });

    it('deactivateDeptHeadThunk sets isActive to false', async () => {
      vi.mocked(orgAdminApi.deactivateDeptHead).mockResolvedValueOnce({} as any);
      
      const store = createTestStore({ orgAdmin: initialState });
      await store.dispatch(deactivateDeptHeadThunk({ id: 'h1' }));
      
      const state = selectOrgAdmin(store.getState());
      expect(state.deptHeads[0].isActive).toBe(false);
    });
  });

  describe('matcher for rejections', () => {
    it('sets error and resets submitting on any rejected action in orgAdmin', () => {
      // Create a fake rejected action that matches the orgAdmin/* pattern
      const state = orgAdminReducer(undefined, { 
        type: 'orgAdmin/customThunk/rejected', 
        payload: 'Custom error message' 
      });
      
      expect(state.error).toBe('Custom error message');
      expect(state.submitting).toBe(false);
      expect(state.loading).toBe(false);
    });
  });
});
