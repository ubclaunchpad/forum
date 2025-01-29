"use client";
import { userContext } from "@/contexts/userContext";
import { useContext, useEffect, useState } from "react";

const WS_URL = "ws://localhost:8000/ws/chat/1"; // WebSocket URL

export default function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const user = useContext(userContext);

  useEffect(() => {
    const socket = new WebSocket(WS_URL + `?id=${user.user.id}`);

    console.log(socket);

    socket.onopen = () => console.log("Connected to WebSocket");

    socket.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    socket.onclose = () => console.log("WebSocket Disconnected");

    setWs(socket);

    return () => socket.close();
  }, []);

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
