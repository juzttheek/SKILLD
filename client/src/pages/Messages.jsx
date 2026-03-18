import { useEffect, useMemo, useRef, useState } from "react";
import { FaComments } from "react-icons/fa";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./Messages.css";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatConversationTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const socketBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

const Messages = () => {
  const { user } = useAuth();
  const { userId: routeUserId } = useParams();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUserId = user?.id || user?._id;

  const [filter, setFilter] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(routeUserId || null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadByUser, setUnreadByUser] = useState({});
  const [onlineSeenAt, setOnlineSeenAt] = useState({});

  useEffect(() => {
    if (!currentUserId) return;

    const socket = io(socketBaseUrl, {
      query: { userId: currentUserId },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("receiveMessage", (payload) => {
      const senderId = payload?.senderId;
      if (!senderId) return;

      setOnlineSeenAt((prev) => ({ ...prev, [senderId]: Date.now() }));

      const messageItem = {
        _id: payload._id || `rx-${Date.now()}-${Math.random()}`,
        sender: { _id: senderId, name: payload.senderName || "User", avatar: payload.senderAvatar || "" },
        receiver: { _id: currentUserId },
        content: payload.content || "",
        createdAt: payload.createdAt || new Date().toISOString(),
      };

      if (selectedUserId && selectedUserId === senderId) {
        setMessages((prev) => [...prev, messageItem]);
      } else {
        setUnreadByUser((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }

      setConversations((prev) => {
        const index = prev.findIndex((item) => item.otherUser?._id === senderId);
        if (index === -1) {
          return [
            {
              conversationId: [currentUserId, senderId].sort().join("_"),
              otherUser: {
                _id: senderId,
                name: payload.senderName || "User",
                avatar: payload.senderAvatar || "",
              },
              latestMessage: {
                content: payload.content || "",
                createdAt: payload.createdAt || new Date().toISOString(),
              },
            },
            ...prev,
          ];
        }

        const updated = [...prev];
        const [row] = updated.splice(index, 1);
        updated.unshift({
          ...row,
          latestMessage: {
            content: payload.content || "",
            createdAt: payload.createdAt || new Date().toISOString(),
          },
        });
        return updated;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, selectedUserId]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const response = await axiosInstance.get("/api/messages/conversations");
        setConversations(response.data || []);
      } catch (error) {
        setConversations([]);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (routeUserId) {
      setSelectedUserId(routeUserId);
      setUnreadByUser((prev) => ({ ...prev, [routeUserId]: 0 }));
    }
  }, [routeUserId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUserId) {
        setMessages([]);
        return;
      }

      try {
        setLoadingMessages(true);
        const response = await axiosInstance.get(`/api/messages/${selectedUserId}`);
        setMessages(response.data || []);
      } catch (error) {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((item) => item.otherUser?.name?.toLowerCase().includes(q));
  }, [conversations, filter]);

  const activeConversation = conversations.find((item) => item.otherUser?._id === selectedUserId) || null;
  const activeUser = activeConversation?.otherUser || {
    _id: selectedUserId,
    name: "Unknown User",
    avatar: "",
  };

  const isOnline = Boolean(selectedUserId && onlineSeenAt[selectedUserId] && Date.now() - onlineSeenAt[selectedUserId] < 120000);

  const sendMessage = async () => {
    if (!selectedUserId) return;
    const text = content.trim();
    if (!text) return;

    const optimistic = {
      _id: `temp-${Date.now()}`,
      sender: { _id: currentUserId, name: user?.name || "You", avatar: user?.avatar || "" },
      receiver: { _id: selectedUserId },
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setContent("");

    setConversations((prev) => {
      const index = prev.findIndex((row) => row.otherUser?._id === selectedUserId);
      if (index === -1) {
        return [
          {
            conversationId: [currentUserId, selectedUserId].sort().join("_"),
            otherUser: activeUser,
            latestMessage: { content: text, createdAt: optimistic.createdAt },
          },
          ...prev,
        ];
      }

      const updated = [...prev];
      const [row] = updated.splice(index, 1);
      updated.unshift({
        ...row,
        latestMessage: { content: text, createdAt: optimistic.createdAt },
      });
      return updated;
    });

    const payload = {
      receiverId: selectedUserId,
      content: text,
      senderId: currentUserId,
      senderName: user?.name || "You",
      senderAvatar: user?.avatar || "",
      createdAt: optimistic.createdAt,
    };

    socketRef.current?.emit("sendMessage", payload);

    try {
      await axiosInstance.post("/api/messages", {
        receiverId: selectedUserId,
        content: text,
      });
    } catch (error) {
      // Keep optimistic message on screen to avoid losing typed content.
    }
  };

  return (
    <div className="messages-page">
      <Navbar />

      <main className="messages-main">
        <div className="msg-shell">
          <aside className="msg-left">
            <div className="msg-left-head">
              <h1>Messages</h1>
              <input
                type="text"
                placeholder="Search by name"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
            </div>

            <div className="msg-conversation-list">
              {loadingConversations ? (
                Array.from({ length: 7 }).map((_, index) => (
                  <div key={`conv-skeleton-${index}`} className="msg-conv-skeleton" />
                ))
              ) : filteredConversations.length === 0 ? (
                <p className="msg-empty-text">No conversations found.</p>
              ) : (
                filteredConversations.map((conversation) => {
                  const other = conversation.otherUser;
                  const unread = unreadByUser[other?._id] || 0;
                  const isActive = selectedUserId === other?._id;

                  return (
                    <button
                      key={conversation.conversationId}
                      type="button"
                      className={`msg-conv-item ${isActive ? "active" : ""}`.trim()}
                      onClick={() => {
                        setSelectedUserId(other?._id);
                        setUnreadByUser((prev) => ({ ...prev, [other?._id]: 0 }));
                      }}
                    >
                      <div className="msg-avatar-initials">{getInitials(other?.name)}</div>

                      <div className="msg-conv-content">
                        <div className="msg-conv-top">
                          <p className={`msg-conv-name ${unread > 0 ? "unread" : ""}`.trim()}>
                            {other?.name || "Unknown User"}
                          </p>
                          <span className="msg-conv-time">
                            {formatConversationTime(conversation.latestMessage?.createdAt)}
                          </span>
                        </div>

                        <div className="msg-conv-bottom">
                          <p className="msg-conv-last">{conversation.latestMessage?.content || "No messages yet"}</p>
                          {unread > 0 ? <span className="msg-unread-dot" aria-label="Unread" /> : null}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="msg-right">
            {!selectedUserId ? (
              <div className="msg-placeholder">
                <FaComments size={56} color="#C0DD97" />
                <p>Select a conversation</p>
              </div>
            ) : (
              <>
                <header className="msg-chat-head">
                  <div className="msg-head-user">
                    <div className="msg-avatar-initials">{getInitials(activeUser?.name)}</div>
                    <div>
                      <p className="msg-head-name">{activeUser?.name || "Unknown User"}</p>
                      <p className="msg-head-status">
                        <span className={`msg-status-dot ${isOnline ? "online" : "offline"}`.trim()} />
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                </header>

                <div className="msg-thread">
                  {loadingMessages ? (
                    <p className="msg-empty-text">Loading messages...</p>
                  ) : (
                    messages.map((message) => {
                      const senderId = message.sender?._id || message.sender;
                      const own = senderId === currentUserId;

                      return (
                        <div key={message._id || `${message.createdAt}-${Math.random()}`} className={`msg-bubble-row ${own ? "own" : "other"}`}>
                          <div className={`msg-bubble ${own ? "own" : "other"}`}>
                            <p>{message.content}</p>
                            <span>{formatTime(message.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="msg-input-bar">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        sendMessage();
                      }
                    }}
                  />
                  <Button variant="primary" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
