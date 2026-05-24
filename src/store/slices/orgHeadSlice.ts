import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  orgHeadApi,
  type ComplaintComment,
  type OrgHeadAnalytics,
  type OrgHeadComplaint,
  type OrgHeadComplaintPriority,
  type OrgHeadComplaintStatus,
  type OrgHeadDeptHead,
} from '../../api/orghead';
import type { Department } from '../../api/orgadmin';
import type { RootState } from '../index';

interface OrgHeadState {
  analytics: OrgHeadAnalytics | null;
  complaints: OrgHeadComplaint[];
  departments: Department[];
  deptHeads: OrgHeadDeptHead[];
  commentsByComplaint: Record<string, ComplaintComment[]>;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: OrgHeadState = {
  analytics: null,
  complaints: [],
  departments: [],
  deptHeads: [],
  commentsByComplaint: {},
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

export const fetchOrgHeadAnalytics = createAsyncThunk('orgHead/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const res = await orgHeadApi.getAnalytics();
    return 'data' in res.data ? (res.data as any).data : res.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch org head analytics'));
  }
});

export const fetchOrgHeadDirectory = createAsyncThunk('orgHead/fetchDirectory', async (_, { rejectWithValue }) => {
  try {
    const complaintsRes = await orgHeadApi.getOrganizationComplaints();
    const [departmentsRes, headsRes] = await Promise.allSettled([
      orgHeadApi.listDepartments(),
      orgHeadApi.listDeptHeads(),
    ]);

    return {
      complaints: complaintsRes.data,
      departments: departmentsRes.status === 'fulfilled' ? departmentsRes.value.data : [],
      deptHeads: headsRes.status === 'fulfilled' ? headsRes.value.data : [],
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch org head data'));
  }
});

export const fetchOrgHeadComplaints = createAsyncThunk('orgHead/fetchComplaints', async (_, { rejectWithValue }) => {
  try {
    const res = await orgHeadApi.getOrganizationComplaints();
    return res.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch complaints'));
  }
});

export const overrideOrgHeadComplaintThunk = createAsyncThunk(
  'orgHead/overrideComplaint',
  async (
    payload: {
      id: string;
      data: { department?: string; priority?: OrgHeadComplaintPriority; status?: OrgHeadComplaintStatus; isSpam?: boolean };
    },
    { rejectWithValue },
  ) => {
    try {
      await orgHeadApi.overrideComplaint(payload.id, payload.data);
      return payload;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to override complaint'));
    }
  },
);

export const fetchOrgHeadCommentsThunk = createAsyncThunk(
  'orgHead/fetchComments',
  async (payload: { complaintId: string }, { rejectWithValue }) => {
    try {
      const res = await orgHeadApi.getComments(payload.complaintId);
      return { complaintId: payload.complaintId, comments: res.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch comments'));
    }
  },
);

export const addOrgHeadCommentThunk = createAsyncThunk(
  'orgHead/addComment',
  async (payload: { complaintId: string; commentText: string }, { rejectWithValue }) => {
    try {
      await orgHeadApi.addComment(payload.complaintId, { commentText: payload.commentText });
      const res = await orgHeadApi.getComments(payload.complaintId);
      return { complaintId: payload.complaintId, comments: res.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to add comment'));
    }
  },
);

const orgHeadSlice = createSlice({
  name: 'orgHead',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgHeadAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrgHeadAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchOrgHeadAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch org head analytics';
      })
      .addCase(fetchOrgHeadDirectory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrgHeadDirectory.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload.complaints;
        state.departments = action.payload.departments;
        state.deptHeads = action.payload.deptHeads;
      })
      .addCase(fetchOrgHeadDirectory.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch org head directory';
      })
      .addCase(fetchOrgHeadComplaints.fulfilled, (state, action) => {
        state.complaints = action.payload;
      })
      .addCase(overrideOrgHeadComplaintThunk.pending, (state) => {
        state.submitting = true;
      })
      .addCase(overrideOrgHeadComplaintThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.complaints = state.complaints.map((complaint) => {
          if (complaint._id !== action.payload.id) return complaint;
          const selectedDepartment = action.payload.data.department
            ? state.departments.find((department) => department._id === action.payload.data.department)
            : null;

          return {
            ...complaint,
            priority: action.payload.data.priority || complaint.priority,
            status: action.payload.data.status || complaint.status,
            isSpam: action.payload.data.isSpam ?? complaint.isSpam,
            department: selectedDepartment
              ? { _id: selectedDepartment._id, name: selectedDepartment.name, code: selectedDepartment.code }
              : complaint.department,
          };
        });
      })
      .addCase(overrideOrgHeadComplaintThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = (action.payload as string) || 'Failed to override complaint';
      })
      .addCase(fetchOrgHeadCommentsThunk.fulfilled, (state, action) => {
        state.commentsByComplaint[action.payload.complaintId] = action.payload.comments;
      })
      .addCase(addOrgHeadCommentThunk.fulfilled, (state, action) => {
        state.commentsByComplaint[action.payload.complaintId] = action.payload.comments;
      });
  },
});

export const selectOrgHead = (state: RootState) => state.orgHead;

export default orgHeadSlice.reducer;
