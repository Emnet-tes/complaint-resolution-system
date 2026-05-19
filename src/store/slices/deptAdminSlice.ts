import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deptAdminApi, type AssignedComplaint, type ComplaintComment, type ComplaintStatus, type DeptAdminAnalytics } from '../../api/deptadmin';
import type { RootState } from '../index';

interface DeptAdminState {
  complaints: AssignedComplaint[];
  analytics: DeptAdminAnalytics | null;
  commentsByComplaint: Record<string, ComplaintComment[]>;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: DeptAdminState = {
  complaints: [],
  analytics: null,
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

export const fetchDeptAdminComplaints = createAsyncThunk('deptAdmin/fetchComplaints', async (_, { rejectWithValue }) => {
  try {
    const res = await deptAdminApi.getAssignedComplaints();
    return res.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch assigned complaints'));
  }
});

export const fetchDeptAdminAnalytics = createAsyncThunk('deptAdmin/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const res = await deptAdminApi.getAnalytics();
    return 'data' in res.data ? (res.data as any).data : res.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch dept admin analytics'));
  }
});

export const updateDeptAdminComplaintStatusThunk = createAsyncThunk(
  'deptAdmin/updateStatus',
  async (payload: { id: string; status: ComplaintStatus }, { rejectWithValue }) => {
    try {
      await deptAdminApi.updateComplaintStatus(payload.id, { status: payload.status });
      return payload;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update complaint status'));
    }
  },
);

export const fetchDeptAdminCommentsThunk = createAsyncThunk(
  'deptAdmin/fetchComments',
  async (payload: { complaintId: string }, { rejectWithValue }) => {
    try {
      const res = await deptAdminApi.getComments(payload.complaintId);
      return { complaintId: payload.complaintId, comments: res.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch comments'));
    }
  },
);

export const addDeptAdminCommentThunk = createAsyncThunk(
  'deptAdmin/addComment',
  async (payload: { complaintId: string; commentText: string }, { rejectWithValue }) => {
    try {
      await deptAdminApi.addComment(payload.complaintId, { commentText: payload.commentText });
      const res = await deptAdminApi.getComments(payload.complaintId);
      return { complaintId: payload.complaintId, comments: res.data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to add comment'));
    }
  },
);

const deptAdminSlice = createSlice({
  name: 'deptAdmin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeptAdminComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeptAdminComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload;
      })
      .addCase(fetchDeptAdminComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch assigned complaints';
      })
      .addCase(fetchDeptAdminAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      .addCase(updateDeptAdminComplaintStatusThunk.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateDeptAdminComplaintStatusThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.complaints = state.complaints.map((complaint) => {
          const compId = complaint._id || (complaint as any).id;
          return compId === action.payload.id ? { ...complaint, status: action.payload.status } : complaint;
        });
      })
      .addCase(updateDeptAdminComplaintStatusThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = (action.payload as string) || 'Failed to update complaint status';
      })
      .addCase(fetchDeptAdminCommentsThunk.fulfilled, (state, action) => {
        state.commentsByComplaint[action.payload.complaintId] = action.payload.comments;
      })
      .addCase(addDeptAdminCommentThunk.fulfilled, (state, action) => {
        state.commentsByComplaint[action.payload.complaintId] = action.payload.comments;
      });
  },
});

export const selectDeptAdmin = (state: RootState) => state.deptAdmin;

export default deptAdminSlice.reducer;
