import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orgAdminApi, type Department, type DeptAdmin, type OrgAdminAnalytics } from '../../api/orgadmin';
import type { RootState } from '../index';

interface OrgAdminState {
  analytics: OrgAdminAnalytics | null;
  departments: Department[];
  deptHeads: DeptAdmin[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: OrgAdminState = {
  analytics: null,
  departments: [],
  deptHeads: [],
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

export const fetchOrgAdminAnalytics = createAsyncThunk('orgAdmin/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const res = await orgAdminApi.getAnalytics();
    return res.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch organization analytics'));
  }
});

export const fetchOrgAdminDirectory = createAsyncThunk('orgAdmin/fetchDirectory', async (_, { rejectWithValue }) => {
  try {
    const [departmentsRes, deptHeadsRes] = await Promise.all([
      orgAdminApi.listDepartments(),
      orgAdminApi.listDeptHeads(),
    ]);

    return {
      departments: departmentsRes.data,
      deptHeads: deptHeadsRes.data,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch departments and heads'));
  }
});

export const createDepartmentThunk = createAsyncThunk(
  'orgAdmin/createDepartment',
  async (payload: { name: string; code: string; description: string; head: string }, { rejectWithValue }) => {
    try {
      const res = await orgAdminApi.createDepartment(payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create department'));
    }
  },
);

export const updateDepartmentThunk = createAsyncThunk(
  'orgAdmin/updateDepartment',
  async (payload: { id: string; data: { name: string; code: string; description: string } }, { rejectWithValue }) => {
    try {
      const res = await orgAdminApi.updateDepartment(payload.id, payload.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update department'));
    }
  },
);

export const deactivateDepartmentThunk = createAsyncThunk(
  'orgAdmin/deactivateDepartment',
  async (payload: { id: string }, { rejectWithValue }) => {
    try {
      await orgAdminApi.deactivateDepartment(payload.id);
      return payload.id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to deactivate department'));
    }
  },
);

export const createDeptHeadThunk = createAsyncThunk(
  'orgAdmin/createDeptHead',
  async (payload: { fullName: string; email: string; password: string; departmentId: string }, { rejectWithValue }) => {
    try {
      const res = await orgAdminApi.createDeptHead(payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create department head'));
    }
  },
);

export const updateDeptHeadThunk = createAsyncThunk(
  'orgAdmin/updateDeptHead',
  async (
    payload: { id: string; data: { fullName: string; email: string; departmentId: string; isActive?: boolean } },
    { rejectWithValue },
  ) => {
    try {
      const res = await orgAdminApi.updateDeptHead(payload.id, payload.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update department head'));
    }
  },
);

export const deactivateDeptHeadThunk = createAsyncThunk(
  'orgAdmin/deactivateDeptHead',
  async (payload: { id: string }, { rejectWithValue }) => {
    try {
      await orgAdminApi.deactivateDeptHead(payload.id);
      return payload.id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to deactivate department head'));
    }
  },
);

const orgAdminSlice = createSlice({
  name: 'orgAdmin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgAdminAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrgAdminAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchOrgAdminAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch organization analytics';
      })
      .addCase(fetchOrgAdminDirectory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrgAdminDirectory.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.departments;
        state.deptHeads = action.payload.deptHeads;
      })
      .addCase(fetchOrgAdminDirectory.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch organization directory';
      })
      .addCase(createDepartmentThunk.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createDepartmentThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.departments = [action.payload, ...state.departments];
      })
      .addCase(updateDepartmentThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.departments = state.departments.map((dept) => (dept._id === action.payload._id ? action.payload : dept));
      })
      .addCase(deactivateDepartmentThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.departments = state.departments.map((dept) =>
          dept._id === action.payload ? { ...dept, isActive: false } : dept,
        );
      })
      .addCase(createDeptHeadThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.deptHeads = [action.payload, ...state.deptHeads];
      })
      .addCase(updateDeptHeadThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.deptHeads = state.deptHeads.map((head) => (head._id === action.payload._id ? action.payload : head));
      })
      .addCase(deactivateDeptHeadThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.deptHeads = state.deptHeads.map((head) =>
          head._id === action.payload ? { ...head, isActive: false } : head,
        );
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('orgAdmin/') && action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.submitting = false;
          state.loading = false;
          state.error = (action.payload as string) || 'Organization admin request failed';
        },
      );
  },
});

export const selectOrgAdmin = (state: RootState) => state.orgAdmin;

export default orgAdminSlice.reducer;
