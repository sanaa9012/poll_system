import { io } from "socket.io-client";
const socket = io("http://localhost:3001"); // update for prod
export default socket;
