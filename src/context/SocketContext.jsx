import { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("getOnlineUsers");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);
