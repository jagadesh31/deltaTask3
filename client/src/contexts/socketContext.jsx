import { io } from 'socket.io-client';
import { createContext, useRef, useCallback } from 'react';

const WEBSOCKET_ENABLED = import.meta.env.VITE_WEBSOCKET === 'true';
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  const getSocket = useCallback(() => {
    if (!WEBSOCKET_ENABLED) return null;

    if (!socketRef.current) {
      socketRef.current = io(WEBSOCKET_URL, {
        autoConnect: false,
      });
    }
    return socketRef.current;
  }, []);

  const connect = useCallback(() => {
    if (!WEBSOCKET_ENABLED) return;
    const socket = getSocket();
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [getSocket]);

  const disconnect = useCallback(() => {
    if (!WEBSOCKET_ENABLED) return;
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.disconnect();
    }
  }, [getSocket]);

  return (
    <SocketContext.Provider value={{ connect, disconnect, getSocket, isEnabled: WEBSOCKET_ENABLED }}>
      {children}
    </SocketContext.Provider>
  );
};