import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
	const { user } = useAuth();
	const [socket, setSocket] = useState(null);

	const currentUserId = user?.id || user?._id;

	useEffect(() => {
		if (!currentUserId) {
			if (socket) {
				socket.disconnect();
				setSocket(null);
			}
			return;
		}

		const socketBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

		const nextSocket = io(socketBaseUrl, {
			query: { userId: currentUserId },
			transports: ["websocket"],
		});

		setSocket(nextSocket);

		return () => {
			nextSocket.disconnect();
		};
	}, [currentUserId]);

	const value = useMemo(() => ({ socket }), [socket]);

	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocket must be used within SocketProvider");
	}
	return context;
};
