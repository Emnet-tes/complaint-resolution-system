import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { deptHeadApi, type DeptHeadAnalytics } from '../../api/depthead';
import type { RootState } from '../index';

interface DeptHeadState {
  analytics: DeptHeadAnalytics | null;
  loading: boolean;
  error: string | null;
}

const initialState: DeptHeadState = {
  analytics: null,
  loading: false,
  error: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'response' in error) {
    const maybeResponse = error as { response?: { data?: { message?: string } } };
    return maybeResponse.response?.data?.message || fallback;
  }
  return fallback;
};

const unwrapAnalytics = (payload: any) => {
  if (!payload) return null;
  if (typeof payload.total === 'number') return payload;

  const candidates = [
    payload.data?.analytics,
    payload.data?.statistics,
    payload.data?.summary,
    payload.data?.deptHeadStats,
    payload.data?.stats,
    payload.data?.data,
    payload.data,
    payload.analytics,
    payload.statistics,
    payload.summary,
    payload.deptHeadStats,
    payload.stats,
    payload.department,
    payload.overview,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object' && typeof candidate.total === 'number') {
      return candidate;
    }
  }

  for (const candidate of [payload.data?.summary, payload.summary, payload.data, payload]) {
    if (candidate && typeof candidate === 'object' && typeof candidate.totalComplaints === 'number') {
      return {
        total: candidate.totalComplaints,
        resolved: candidate.resolvedComplaints || 0,
        pending: candidate.pendingComplaints || 0,
        resolvedPercentage: candidate.overallResolutionRate || candidate.resolvedPercentage || 0,
        monthlyTrends: payload.data?.insights?.monthlyTrends || payload.insights?.monthlyTrends || payload.data?.monthlyTrends || payload.monthlyTrends || [],
        categoryStats: payload.data?.categoryStats || payload.categoryStats || [],
      };
    }
  }

  return payload.data || payload;
};

export const fetchDeptHeadAnalytics = createAsyncThunk('deptHead/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const res = await deptHeadApi.getAnalytics();
    let stats = unwrapAnalytics(res.data);

    if (!stats || stats.total === 0) {
      try {
        const complaintsRes = await deptHeadApi.getAssignedComplaints();
        const complaints = complaintsRes.data || [];
        if (complaints.length > 0) {
          const total = complaints.length;
          const resolved = complaints.filter((c: any) => c.status === 'Resolved').length;
          const pending = complaints.filter((c: any) => c.status !== 'Resolved' && c.status !== 'Rejected').length;
          const resolvedPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

          const monthsMap: Record<string, number> = {};
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          complaints.forEach((c: any) => {
            const date = new Date(c.createdAt || Date.now());
            const m = monthNames[date.getMonth()];
            const y = date.getFullYear();
            const key = `${m}-${y}`;
            monthsMap[key] = (monthsMap[key] || 0) + 1;
          });
          const monthlyTrends = Object.entries(monthsMap).map(([key, count]) => {
            const [month, yearStr] = key.split('-');
            return { month, year: parseInt(yearStr, 10), count };
          });

          const catMap: Record<string, number> = {};
          complaints.forEach((c: any) => {
            const cat = c.category || 'Other';
            catMap[cat] = (catMap[cat] || 0) + 1;
          });
          const categoryStats = Object.entries(catMap).map(([category, count]) => ({ category, count }));

          stats = {
            total,
            resolved,
            pending,
            resolvedPercentage,
            monthlyTrends,
            categoryStats,
          };
        }
      } catch (_compErr) {
        // ignore complaint fetch error and use original stats
      }
    }

    return stats;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch department head analytics'));
  }
});

const deptHeadSlice = createSlice({
  name: 'deptHead',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeptHeadAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeptHeadAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchDeptHeadAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch department head analytics';
      });
  },
});

export const selectDeptHead = (state: RootState) => state.deptHead;

export default deptHeadSlice.reducer;
