import { createSlice } from "@reduxjs/toolkit";

// Token is loaded via initializeAuth after hydration to avoid SSR mismatch
const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    initializeAuth(state) {
      if (typeof window !== "undefined") {
        state.token = localStorage.getItem("token");
      }
    },
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  },
});

export const { initializeAuth, setLoading, setCredentials, setError, logout } = authSlice.actions;
export default authSlice.reducer;
