"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setCredentials, logout } from "@/store/authSlice";

export default function AuthGuard({ children, adminOnly = false }) {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const storedToken = token || localStorage.getItem("token");
      if (!storedToken) {
        router.replace("/auth/login");
        return;
      }

      if (!user) {
        try {
          const { data } = await api.get("/auth/me");
          dispatch(setCredentials({ user: data, token: storedToken }));
        } catch {
          dispatch(logout());
          router.replace("/auth/login");
          return;
        }
      }

      setChecking(false);
    };

    verify();
  }, [token, user, dispatch, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (adminOnly && user?.role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  return children;
}
