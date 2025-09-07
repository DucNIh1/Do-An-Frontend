import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_URL;

const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
