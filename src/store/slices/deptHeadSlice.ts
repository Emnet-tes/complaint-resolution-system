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

const unwrapComplaints = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  if (payload.complaints && Array.isArray(payload.complaints)) return payload.complaints;
  if (payload.assignedComplaints && Array.isArray(payload.assignedComplaints)) return payload.assignedComplaints;
  return [];
};

export const fetchDeptHeadAnalytics = createAsyncThunk('deptHead/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    let stats: DeptHeadAnalytics | null = null;

    try {
      const res = await deptHeadApi.getAnalytics();
      stats = unwrapAnalytics(res.data);
    } catch (_analyticsErr) {
      // If getAnalytics API fails, we fall back to calculating from the complaints list
    }

    // Always fetch assigned complaints to enrich statistics and avoid 0-data issues
    try {
      const complaintsRes = await deptHeadApi.getAssignedComplaints();
      const complaints = unwrapComplaints(complaintsRes.data);

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

      const statusMap: Record<string, number> = {};
      complaints.forEach((c: any) => {
        const s = c.status || 'Submitted';
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      const statusStats = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

      const priorityMap: Record<string, number> = {};
      complaints.forEach((c: any) => {
        const p = c.priority || 'Medium';
        priorityMap[p] = (priorityMap[p] || 0) + 1;
      });
      const priorityStats = Object.entries(priorityMap).map(([priority, count]) => ({ priority, count }));

      const assigneeMap: Record<string, number> = {};
      complaints.forEach((c: any) => {
        let name = 'Unassigned';
        if (c.assignedTo) {
          name = typeof c.assignedTo === 'string' ? c.assignedTo : c.assignedTo.fullName || c.assignedTo.fullname || 'Unknown Agent';
        }
        assigneeMap[name] = (assigneeMap[name] || 0) + 1;
      });
      const assigneeStats = Object.entries(assigneeMap).map(([assignee, count]) => ({ assignee, count }));

      // Merge local calculations with API response, prioritizing computed data if API is empty or zero
      stats = {
        total: stats?.total && stats.total > 0 ? stats.total : total,
        resolved: stats?.resolved && stats.resolved > 0 ? stats.resolved : resolved,
        pending: stats?.pending && stats.pending > 0 ? stats.pending : pending,
        resolvedPercentage: stats?.resolvedPercentage && stats.resolvedPercentage > 0 ? stats.resolvedPercentage : resolvedPercentage,
        monthlyTrends: stats?.monthlyTrends && stats.monthlyTrends.length > 0 ? stats.monthlyTrends : monthlyTrends,
        categoryStats: stats?.categoryStats && stats.categoryStats.length > 0 ? stats.categoryStats : categoryStats,
        statusStats,
        priorityStats,
        assigneeStats,
      };
    } catch (compErr) {
      if (!stats) {
        throw compErr;
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
