/**
 * context/NotificationContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Provides: notifications[], unreadCount, markRead(), markAllRead(), addNotification()
 * Polls /api/notifications every 30s when user is logged in
 * Use: const { notifications, unreadCount, markAllRead } = useNotifications();
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, authHeader } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications", { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (_) {
      // Use mock data if API not set up yet
      setNotifications(prev => prev.length ? prev : MOCK_NOTIFICATIONS);
    }
  }, [user]); // eslint-disable-line

  useEffect(() => {
    if (user) {
      fetchNotifications();
      intervalRef.current = setInterval(fetchNotifications, 30_000);
    } else {
      setNotifications([]);
    }
    return () => clearInterval(intervalRef.current);
  }, [user, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback(async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: authHeader(),
      });
    } catch (_) {}
  }, []); // eslint-disable-line

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: authHeader(),
      });
    } catch (_) {}
  }, []); // eslint-disable-line

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [
      { _id: Date.now().toString(), read: false, createdAt: new Date().toISOString(), ...notif },
      ...prev,
    ]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount,
      markRead, markAllRead, addNotification,
      refresh: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
};

// ─── Mock data (remove once backend ready) ───
const MOCK_NOTIFICATIONS = [
  { _id: "1", type: "approval", message: "Your resource 'React Hooks Guide' was approved", read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { _id: "2", type: "notice",   message: "New notice: Mid-term exam schedule posted", read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { _id: "3", type: "rating",   message: "Someone rated your resource 5 stars ⭐", read: false, createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { _id: "4", type: "system",   message: "Welcome to EduVault — explore resources!", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];