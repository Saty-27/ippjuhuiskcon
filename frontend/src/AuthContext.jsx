import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";
import { io } from "socket.io-client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("iskcon_lms_token"));
  const [loading, setLoading] = useState(Boolean(token));
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("iskcon_lms_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const backendUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5055`;
    const socketInstance = io(backendUrl.replace(/\/api$/, ""), {
      auth: { token },
      transports: ["websocket"]
    });

    socketInstance.emit("user_connected", { userId: user._id });
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, token]);

  const login = async (email, password) => {
    const data = await apiFetch("/auth/login", { method: "POST", body: { email, password } });
    localStorage.setItem("iskcon_lms_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await apiFetch("/auth/register", { method: "POST", body: payload });
    if (data.token) {
      localStorage.setItem("iskcon_lms_token", data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const verifyOtp = async (payload) => {
    const data = await apiFetch("/auth/verify-otp", { method: "POST", body: payload });
    localStorage.setItem("iskcon_lms_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const resendOtp = (payload) => apiFetch("/auth/resend-otp", { method: "POST", body: payload });

  const forgotPassword = (payload) => apiFetch("/auth/forgot-password", { method: "POST", body: payload });

  const verifyForgotOtp = (payload) => apiFetch("/auth/verify-forgot-otp", { method: "POST", body: payload });

  const resetPassword = (payload) => apiFetch("/auth/reset-password", { method: "POST", body: payload });

  const requestAdminPasswordReset = (payload) => apiFetch("/auth/password-reset-request", { method: "POST", body: payload });

  const changePassword = (payload) => apiFetch("/auth/change-password", { method: "PUT", body: payload });

  const updateProfile = async (payload) => {
    const data = await apiFetch("/auth/profile", { method: "PUT", body: payload });
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("iskcon_lms_token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      socket,
      login,
      register,
      verifyOtp,
      resendOtp,
      forgotPassword,
      verifyForgotOtp,
      resetPassword,
      requestAdminPasswordReset,
      changePassword,
      updateProfile,
      logout,
      isAuthenticated: Boolean(user)
    }),
    [user, token, loading, socket]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
