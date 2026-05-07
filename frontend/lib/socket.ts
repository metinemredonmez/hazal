"use client";

import { io, type Socket } from "socket.io-client";
import { tokenStore, API_URL } from "./api";

let cached: Socket | null = null;

export function getAdminSocket(): Socket {
  if (cached && cached.connected) return cached;
  if (cached) {
    cached.disconnect();
    cached = null;
  }
  const token = tokenStore.get();
  cached = io(`${API_URL}/chat`, {
    auth: { token: token ?? "" },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
  });
  return cached;
}

export function disconnectAdminSocket() {
  cached?.disconnect();
  cached = null;
}
