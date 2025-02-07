"use client";
import { userContext } from "@/contexts/userContext";
import { useContext, useEffect, useState } from "react";
import { getApiUrl } from "@/utils/helpers";
import { useParams } from "next/navigation";
import { Message } from "@/lib/types/chat";

const WS_URL = `ws://localhost:8000/channels/chat/`;

export default function Chat() {
  const params = useParams();
  // Renamed for clarity – assuming slug represents the channel id
  const channelId = params.slug;

  // Initialize messages as an empty array to simplify rendering.
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const user = useContext(userContext);

  // Guard: if user token or channelId is not available, you might want to render a loading state.
  if (!user?.token || !channelId) {
    return <div>Loading...</div>;
  }

  // Fetch message history
  useEffect(() => {
    const fetchMessageHistory = async () => {
      try {
        const response = await fetch(
          `${getApiUrl()}/channels/${channelId}/history/`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch message history");
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching message history:", error);
      }
    };

    fetchMessageHistory();
  }, [channelId, user.token]);

  // Set up WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}${channelId}?token=${user.token}`);

    socket.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data) as Message;
        setMessages((prev) => [...prev, parsedData]);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [channelId, user.token]);

  const sendMessage = () => {
    if (ws && message.trim()) {
      ws.send(message);
      setMessage("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">WebSocket Chat</h1>
      <div className="border p-4 h-64 overflow-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="p-1 border-b flex flex-row gap-4">
            <div>{msg.created_by}</div>
            <div>{msg.content}</div>
            <div>{new Date(msg.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 flex-grow"
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2">
          Send
        </button>
      </div>
    </div>
  );
}
