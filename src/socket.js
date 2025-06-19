import { io } from "socket.io-client";
const socket = io("https://server-production-b23b.up.railway.app/"); // update for prod

export default socket;
