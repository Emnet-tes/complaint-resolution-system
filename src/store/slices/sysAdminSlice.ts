import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { sysAdminApi, type AuditLogActivity, type AuditLogSummary, type OrgAdmin, type OrgHead, type Organization, type SysAdminAnalytics } from '../../api/sysadmin';
import type { RootState } from '../index';

interface SysAdminState {
  analytics: SysAdminAnalytics | null;
  organizations: Organization[];
  orgAdmins: OrgAdmin[];
  orgHeads: OrgHead[];
  auditActivities: AuditLogActivity[];
  auditSummary: AuditLogSummary | null;
  auditPage: number;
  auditLimit: number;
  auditPages: number;
  auditTotal: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: SysAdminState = {
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
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'response' in error) {
    const maybeResponse = error as { response?: { data?: { message?: string } } };
    return maybeResponse.response?.data?.message || fallback;
  }
  return fallback;
};

export const fetchSysAdminAnalytics = createAsyncThunk('sysAdmin/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const res = await sysAdminApi.getAnalytics();
    return res.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch system analytics'));
  }
});

export const fetchSysAdminDirectory = createAsyncThunk('sysAdmin/fetchDirectory', async (_, { rejectWithValue }) => {
  try {
    const [organizationsRes, adminsRes, headsRes] = await Promise.all([
      sysAdminApi.listOrganizations(),
      sysAdminApi.listOrgAdmins(),
      sysAdminApi.listOrgHeads(),
    ]);

    return {
      organizations: organizationsRes.data,
      orgAdmins: adminsRes.data,
      orgHeads: headsRes.data,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch organization directory'));
  }
});

export const createOrganizationThunk = createAsyncThunk(
  'sysAdmin/createOrganization',
  async (payload: { name: string; code: string }, { rejectWithValue }) => {
    try {
      const res = await sysAdminApi.createOrganization(payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create organization'));
    }
  },
);

export const updateOrganizationThunk = createAsyncThunk(
  'sysAdmin/updateOrganization',
  async (payload: { id: string; data: { name: string; code: string } }, { rejectWithValue }) => {
    try {
      const res = await sysAdminApi.updateOrganization(payload.id, payload.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update organization'));
    }
  },
);

export const deactivateOrganizationThunk = createAsyncThunk(
  'sysAdmin/deactivateOrganization',
  async (payload: { id: string; message?: string }, { rejectWithValue }) => {
    try {
      await sysAdminApi.deactivateOrganization(payload.id, payload.message ? { message: payload.message } : undefined);
      return payload.id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to deactivate organization'));
    }
  },
);

export const createOrgAdminThunk = createAsyncThunk(
  'sysAdmin/createOrgAdmin',
  async (payload: { fullName: string; email: string; password: string; organizationId: string }, { rejectWithValue }) => {
    try {
      const res = await sysAdminApi.createOrgAdmin(payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create org admin'));
    }
  },
);

export const updateOrgAdminThunk = createAsyncThunk(
  'sysAdmin/updateOrgAdmin',
  async (payload: { id: string; data: { fullName: string; email: string; organizationId?: string } }, { rejectWithValue }) => {
    try {
      const res = await sysAdminApi.updateOrgAdmin(payload.id, payload.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update org admin'));
    }
  },
);

export const deactivateOrgAdminThunk = createAsyncThunk(
  'sysAdmin/deactivateOrgAdmin',
  async (payload: { id: string; message?: string }, { rejectWithValue }) => {
    try {
      await sysAdminApi.deactivateOrgAdmin(payload.id, payload.message ? { message: payload.message } : undefined);
      return payload.id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to deactivate org admin'));
    }
  },
);

export const createOrgHeadThunk = createAsyncThunk(
  'sysAdmin/createOrgHead',
  async (payload: { fullName: string; email: string; password: string; organizationId: string }, { rejectWithValue }) => {
    try {
      const res = await sysAdminApi.createOrgHead(payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create org head'));
    }
  },
);

export const updateOrgHeadThunk = createAsyncThunk(
  'sysAdmin/updateOrgHead',
  async (payload: { id: string; data: { fullName: string; email: string; organizationId?: string } }, { rejectWithValue }) => {
    try {
      const res = await sysAdminApi.updateOrgHead(payload.id, payload.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update org head'));
    }
  },
);

export const deactivateOrgHeadThunk = createAsyncThunk(
  'sysAdmin/deactivateOrgHead',
  async (payload: { id: string; message?: string }, { rejectWithValue }) => {
    try {
      await sysAdminApi.deactivateOrgHead(payload.id, payload.message ? { message: payload.message } : undefined);
      return payload.id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to deactivate org head'));
    }
  },
);

export const fetchAuditLogsThunk = createAsyncThunk(
  'sysAdmin/fetchAuditLogs',
  async (payload: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const [activitiesRes, summaryRes] = await Promise.all([
        sysAdminApi.getAuditActivities(payload.page, payload.limit),
        sysAdminApi.getAuditSummary(),
      ]);

      return {
        activities: activitiesRes.data.data,
        pagination: activitiesRes.data.pagination,
        summary: summaryRes.data.summary,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch audit logs'));
    }
  },
);

const sysAdminSlice = createSlice({
  name: 'sysAdmin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSysAdminAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSysAdminAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchSysAdminAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch system analytics';
      })
      .addCase(fetchSysAdminDirectory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSysAdminDirectory.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload.organizations;
        state.orgAdmins = action.payload.orgAdmins;
        state.orgHeads = action.payload.orgHeads;
      })
      .addCase(fetchSysAdminDirectory.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch organization directory';
      })
      .addCase(createOrganizationThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createOrganizationThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.organizations = [action.payload, ...state.organizations];
      })
      .addCase(createOrganizationThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = (action.payload as string) || 'Failed to create organization';
      })
      .addCase(updateOrganizationThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateOrganizationThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.organizations = state.organizations.map((org) => (org._id === action.payload._id ? action.payload : org));
      })
      .addCase(updateOrganizationThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = (action.payload as string) || 'Failed to update organization';
      })
      .addCase(deactivateOrganizationThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.organizations = state.organizations.map((org) =>
          org._id === action.payload ? { ...org, isActive: false } : org,
        );
      })
      .addCase(createOrgAdminThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.orgAdmins = [action.payload, ...state.orgAdmins];
      })
      .addCase(updateOrgAdminThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.orgAdmins = state.orgAdmins.map((admin) => (admin._id === action.payload._id ? action.payload : admin));
      })
      .addCase(deactivateOrgAdminThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.orgAdmins = state.orgAdmins.map((admin) =>
          admin._id === action.payload ? { ...admin, isActive: false } : admin,
        );
      })
      .addCase(createOrgHeadThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.orgHeads = [action.payload, ...state.orgHeads];
      })
      .addCase(updateOrgHeadThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.orgHeads = state.orgHeads.map((head) => (head._id === action.payload._id ? action.payload : head));
      })
      .addCase(deactivateOrgHeadThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.orgHeads = state.orgHeads.map((head) =>
          head._id === action.payload ? { ...head, isActive: false } : head,
        );
      })
      .addCase(fetchAuditLogsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.auditActivities = action.payload.activities;
        state.auditSummary = action.payload.summary;
        state.auditPage = action.payload.pagination.page;
        state.auditLimit = action.payload.pagination.limit;
        state.auditPages = action.payload.pagination.pages;
        state.auditTotal = action.payload.pagination.total;
      })
      .addCase(fetchAuditLogsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch audit logs';
      });
  },
});

export const selectSysAdmin = (state: RootState) => state.sysAdmin;

export default sysAdminSlice.reducer;
