import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

let socket = null;
let connectionCount = 0;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  connectionCount++;
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  connectionCount--;
  if (connectionCount <= 0) {
    connectionCount = 0;
    if (socket?.connected) {
      socket.disconnect();
    }
  }
};
