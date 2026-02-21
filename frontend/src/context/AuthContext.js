import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("hub_user");
    const token = localStorage.getItem("hub_token");
    if (storedUser && token) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setRole(parsed.role);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async ({ usn, password }) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usn, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("hub_token", data.token);
    localStorage.setItem("hub_user", JSON.stringify(data.user));
    setUser(data.user);
    setRole(data.user.role);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Registration failed");
    }
    const data = await res.json();
    localStorage.setItem("hub_token", data.token);
    localStorage.setItem("hub_user", JSON.stringify(data.user));
    setUser(data.user);
    setRole(data.user.role);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hub_token");
    localStorage.removeItem("hub_user");
    setUser(null);
    setRole(null);
  }, []);

  const getToken = () => localStorage.getItem("hub_token");
  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

  return (
    <AuthContext.Provider value={{
      user, role, loading,
      login, logout, register,
      getToken, authHeader,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};