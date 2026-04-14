import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setTasks(state, action) {
      state.items = action.payload.tasks;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.loading = false;
    },
    setCurrentTask(state, action) {
      state.current = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setTasks, setCurrentTask, setError } = tasksSlice.actions;
export default tasksSlice.reducer;
