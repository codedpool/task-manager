"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { initializeAuth } from "./authSlice";

function AuthInitializer({ children }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);
  return children;
}

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
