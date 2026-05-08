"use client";

import { io, type Socket } from "socket.io-client";
import { tokenStore, API_URL } from "./api";

let chatSocket: Socket | null = null;
let notifSocket: Socket | null = null;

function buildSocket(namespace: string): Socket {
  const token = tokenStore.get();
  return io(`${API_URL}${namespace}`, {
    auth: { token: token ?? "" },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
  });
}

export function getAdminSocket(): Socket {
  if (chatSocket && chatSocket.connected) return chatSocket;
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
  chatSocket = buildSocket("/chat");
  return chatSocket;
}

export function getNotificationsSocket(): Socket {
  if (notifSocket && notifSocket.connected) return notifSocket;
  if (notifSocket) {
    notifSocket.disconnect();
    notifSocket = null;
  }
  notifSocket = buildSocket("/notifications");
  return notifSocket;
}

export function disconnectAllSockets() {
  chatSocket?.disconnect();
  notifSocket?.disconnect();
  chatSocket = null;
  notifSocket = null;
}
