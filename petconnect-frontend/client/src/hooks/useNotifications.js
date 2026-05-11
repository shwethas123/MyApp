import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import ApiService from "../services/Apiservices";

let globalSocket = null;

const useNotifications = (currentUser) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [hasMore, setHasMore]             = useState(false);
  const [page, setPage]                   = useState(1);
  const [isOpen, setIsOpen]               = useState(false);
  const socketRef = useRef(null);

  // ── Fetch notifications ───────────────────────────────────────────────
  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      const res = await ApiService.get(`/notifications?page=${pageNum}`);
      const newNotifs = res.data.data || [];

      if (pageNum === 1) {
        setNotifications(newNotifs);
      } else {
        setNotifications((prev) => [...prev, ...newNotifs]);
      }

      setUnreadCount(res.data.unreadCount || 0);
      setHasMore(res.data.hasMore || false);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch notifications:", err.message);
    }
  }, []);

  // ── Load next page ────────────────────────────────────────────────────
  const loadMore = () => fetchNotifications(page + 1);

  // ── Mark single as read ───────────────────────────────────────────────
const markAsRead = async (id) => {
  // removes from UI instantly ✅
  setNotifications((prev) => prev.filter((n) => n.id !== id));
  setUnreadCount((prev) => Math.max(0, prev - 1));
  
  try {
    if (!id || String(id).startsWith("temp_")) return; // ← BUG HERE
    await ApiService.patch(`/notifications/${id}/read`);
  } catch (err) {
    console.error("Failed to mark as read:", err.message);
  }
};

  // ── Mark all as read ──────────────────────────────────────────────────
  // const markAllAsRead = async () => {
  //   try {
  //     await ApiService.patch("/notifications/read-all");
  //     setNotifications([]);
  //     setUnreadCount(0);
  //     setHasMore(false);
  //     setPage(1);
  //   } catch (err) {
  //     console.error("Failed to mark all as read:", err.message);
  //   }
  // };

  // ── Toggle dropdown ───────────────────────────────────────────────────
  const toggleOpen = () => setIsOpen((prev) => !prev);

  // ── Socket setup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    fetchNotifications(); // ✅ called once

    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
    } else {
      const socket = io("http://localhost:5000", {
        withCredentials: true,
        transports: ["websocket"],
        reconnectionAttempts: 3,
      });
      socket.on("connect_error", (err) => {
        if (err.message === "Invalid token") {
          console.warn("Socket auth failed — token expired");
          socket.disconnect();
        }
      });
      globalSocket = socket;
      socketRef.current = socket;
    }

    const handler = (notification) => {
      setNotifications((prev) => [
        { ...notification, is_read: false, id: notification.id || `temp_${Date.now()}` },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    };

    socketRef.current.on("new_notification", handler);

    return () => {
      socketRef.current?.off("new_notification", handler);
    };
  }, [currentUser, fetchNotifications]); // ✅ fetchNotifications in deps

  return {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    markAsRead,
    // markAllAsRead,
    fetchNotifications,
    hasMore,
    loadMore,
  };
};

export default useNotifications;