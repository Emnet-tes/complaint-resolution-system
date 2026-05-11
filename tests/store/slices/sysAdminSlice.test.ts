import { describe, it, expect, vi, beforeEach } from 'vitest';
import sysAdminReducer, {
  fetchSysAdminAnalytics,
  fetchSysAdminDirectory,
  createOrganizationThunk,
  updateOrganizationThunk,
  deactivateOrganizationThunk,
  createOrgAdminThunk,
  updateOrgAdminThunk,
  deactivateOrgAdminThunk,
  createOrgHeadThunk,
  updateOrgHeadThunk,
  deactivateOrgHeadThunk,
  fetchAuditLogsThunk,
  selectSysAdmin,
} from '../../../src/store/slices/sysAdminSlice';
import { sysAdminApi } from '../../../src/api/sysadmin';
import { createTestStore } from '../../helpers/testUtils';

vi.mock('../../../src/api/sysadmin', () => ({
  sysAdminApi: {
    getAnalytics: vi.fn(),
    listOrganizations: vi.fn(),
    listOrgAdmins: vi.fn(),
    listOrgHeads: vi.fn(),
    createOrganization: vi.fn(),
    updateOrganization: vi.fn(),
    deactivateOrganization: vi.fn(),
    createOrgAdmin: vi.fn(),
    updateOrgAdmin: vi.fn(),
    deactivateOrgAdmin: vi.fn(),
    createOrgHead: vi.fn(),
    updateOrgHead: vi.fn(),
    deactivateOrgHead: vi.fn(),
    getAuditActivities: vi.fn(),
    getAuditSummary: vi.fn(),
  },
}));

describe('sysAdminSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reducer initial state', () => {
    it('returns initial state', () => {
      const state = sysAdminReducer(undefined, { type: '@@INIT' });
      expect(state).toEqual({
        analytics: null,
        organizations: [],
        orgAdmins: [],
        orgHeads: [],
        auditActivities: [],
        auditSummary: null,
        auditPage: 1,
        auditLimit: 20,
        auditPages: 1,
        auditTotal: 0,
        loading: false,
        submitting: false,
        error: null,
      });
    });
  });

  describe('fetchSysAdminAnalytics', () => {
    it('handles pending state', () => {
      const state = sysAdminReducer(undefined, { type: fetchSysAdminAnalytics.pending.type });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('populates analytics on fulfilled', async () => {
      const mockAnalytics = { totalOrganizations: 10 } as any;
      vi.mocked(sysAdminApi.getAnalytics).mockResolvedValueOnce({ data: mockAnalytics } as any);
      
      const store = createTestStore();
      await store.dispatch(fetchSysAdminAnalytics());
      
      const state = selectSysAdmin(store.getState());
      expect(state.loading).toBe(false);
      expect(state.analytics).toEqual(mockAnalytics);
    });

    it('sets error on rejection', async () => {
      vi.mocked(sysAdminApi.getAnalytics).mockRejectedValueOnce(new Error('Network error'));
      
      const store = createTestStore();
      await store.dispatch(fetchSysAdminAnalytics());
      
      const state = selectSysAdmin(store.getState());
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch system analytics');
    });
  });

  describe('fetchSysAdminDirectory', () => {
    it('populates organizations, admins, and heads on fulfilled', async () => {
      const mockOrgs = [{ _id: 'o1', name: 'Org 1' }];
      const mockAdmins = [{ _id: 'a1', fullname: 'Admin 1' }];
      const mockHeads = [{ _id: 'h1', fullname: 'Head 1' }];
      vi.mocked(sysAdminApi.listOrganizations).mockResolvedValueOnce({ data: mockOrgs } as any);
      vi.mocked(sysAdminApi.listOrgAdmins).mockResolvedValueOnce({ data: mockAdmins } as any);
      vi.mocked(sysAdminApi.listOrgHeads).mockResolvedValueOnce({ data: mockHeads } as any);
      
      const store = createTestStore();
      await store.dispatch(fetchSysAdminDirectory());
      
      const state = selectSysAdmin(store.getState());
      expect(state.organizations).toEqual(mockOrgs);
      expect(state.orgAdmins).toEqual(mockAdmins);
      expect(state.orgHeads).toEqual(mockHeads);
    });

    it('sets error if any promise rejects', async () => {
      vi.mocked(sysAdminApi.listOrganizations).mockResolvedValueOnce({ data: [] } as any);
      vi.mocked(sysAdminApi.listOrgAdmins).mockResolvedValueOnce({ data: [] } as any);
      vi.mocked(sysAdminApi.listOrgHeads).mockRejectedValueOnce(new Error('Fail'));
      
      const store = createTestStore();
      await store.dispatch(fetchSysAdminDirectory());
      
      const state = selectSysAdmin(store.getState());
      expect(state.error).toBe('Failed to fetch organization directory');
    });
  });

  describe('organization thunks', () => {
    const initialState = {
      analytics: null,
      organizations: [{ _id: 'o1', name: 'Org 1', isActive: true } as any],
      orgAdmins: [],
      orgHeads: [],
      auditActivities: [],
      auditSummary: null,
      auditPage: 1,
      auditLimit: 20,
      auditPages: 1,
      auditTotal: 0,
      loading: false,
      submitting: false,
      error: null,
    };

    it('createOrganizationThunk adds new organization', async () => {
      const newOrg = { _id: 'o2', name: 'Org 2' };
      vi.mocked(sysAdminApi.createOrganization).mockResolvedValueOnce({ data: newOrg } as any);
      
      const store = createTestStore({ sysAdmin: initialState });
      await store.dispatch(createOrganizationThunk({ name: 'Org 2', code: 'O2' }));
      
      const state = selectSysAdmin(store.getState());
      expect(state.organizations[0]).toEqual(newOrg);
    });

    it('updateOrganizationThunk updates existing organization', async () => {
      const updatedOrg = { _id: 'o1', name: 'Org 1 Updated', isActive: true };
      vi.mocked(sysAdminApi.updateOrganization).mockResolvedValueOnce({ data: updatedOrg } as any);
      
      const store = createTestStore({ sysAdmin: initialState });
      await store.dispatch(updateOrganizationThunk({ id: 'o1', data: { name: 'Org 1 Updated', code: '' } }));
      
      const state = selectSysAdmin(store.getState());
      expect(state.organizations[0].name).toBe('Org 1 Updated');
    });

    it('deactivateOrganizationThunk sets isActive to false', async () => {
      vi.mocked(sysAdminApi.deactivateOrganization).mockResolvedValueOnce({} as any);
      
      const store = createTestStore({ sysAdmin: initialState });
      await store.dispatch(deactivateOrganizationThunk({ id: 'o1' }));
      
      const state = selectSysAdmin(store.getState());
      expect(state.organizations[0].isActive).toBe(false);
    });
  });

  describe('fetchAuditLogsThunk', () => {
    it('sets loading state correctly', () => {
      const state = sysAdminReducer(undefined, { type: fetchAuditLogsThunk.pending.type });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('populates activities and pagination on fulfilled', async () => {
      const mockActivities = [{ _id: 'act1', action: 'LOGIN' }];
      const mockPagination = { page: 2, limit: 10, pages: 5, total: 50 };
      const mockSummary = { totalLogins: 100 } as any;

      vi.mocked(sysAdminApi.getAuditActivities).mockResolvedValueOnce({
        data: { data: mockActivities, pagination: mockPagination }
      } as any);
      vi.mocked(sysAdminApi.getAuditSummary).mockResolvedValueOnce({
        data: { summary: mockSummary }
      } as any);

      const store = createTestStore();
      await store.dispatch(fetchAuditLogsThunk({ page: 2, limit: 10 }));

      const state = selectSysAdmin(store.getState());
      expect(state.loading).toBe(false);
      expect(state.auditActivities).toEqual(mockActivities);
      expect(state.auditSummary).toEqual(mockSummary);
      expect(state.auditPage).toBe(2);
      expect(state.auditLimit).toBe(10);
      expect(state.auditPages).toBe(5);
      expect(state.auditTotal).toBe(50);
    });

    it('sets error on rejection', async () => {
      vi.mocked(sysAdminApi.getAuditActivities).mockRejectedValueOnce(new Error('Network error'));
      vi.mocked(sysAdminApi.getAuditSummary).mockResolvedValueOnce({ data: { summary: {} } } as any);

      const store = createTestStore();
      await store.dispatch(fetchAuditLogsThunk({ page: 1, limit: 20 }));

      const state = selectSysAdmin(store.getState());
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch audit logs');
    });
  });
});
