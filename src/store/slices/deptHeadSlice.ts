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

export const fetchDeptHeadAnalytics = createAsyncThunk('deptHead/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const res = await deptHeadApi.getAnalytics();
    return res.data;
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
