"use client";
import { userContext } from "@/contexts/userContext";
import { useContext, useEffect, useState } from "react";
import { getApiUrl } from "@/utils/helpers";
import { useParams } from "next/navigation";

const WS_URL = `ws://localhost:8000/ws/chat/`;

export default function Chat() {
  const params = useParams();
  const dynamic = params.slug;

  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const user = useContext(userContext);

  useEffect(() => {
    const fetchMessageHistory = async () => {
      try {
        const response = await fetch(
          `${getApiUrl()}/chat/${dynamic}/history/`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`, // Add authentication if needed
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch message history");
        }
        const data = await response.json();
        console.log(data);
        setMessages(data.messages); // Set the fetched messages
      } catch (error) {
        console.error("Error fetching message history:", error);
      }
    };

    fetchMessageHistory();
  }, [dynamic, user]);

  useEffect(() => {
    const socket = new WebSocket(WS_URL + dynamic + `?id=${user.user.id}`);

    console.log(socket);

    socket.onopen = () => console.log("Connected to WebSocket");

    socket.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    socket.onclose = () => console.log("WebSocket Disconnected");

    setWs(socket);

    return () => socket.close();
  }, [dynamic, user]);

  const sendMessage = () => {
    if (ws && message.trim()) {
      ws.send(message);
      setMessage(""); // Clear input
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">WebSocket Chat</h1>
      <div className="border p-4 h-64 overflow-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="p-1 border-b">
            {msg}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 flex-grow"
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2">
          Send
        </button>
      </div>
    </div>
  );
}
