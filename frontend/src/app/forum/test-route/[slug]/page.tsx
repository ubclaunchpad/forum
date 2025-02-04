"use client";
import { userContext } from "@/contexts/userContext";
import { useContext, useEffect, useState } from "react";
import { getApiUrl } from "@/utils/helpers";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const WS_URL = `ws://localhost:8000/ws/chat/`;

type Message = {
  content: string;
  channel_id: string;
  created_at: Date;
  created_by: string;
  id: string;
};

export default function Chat() {
  const params = useParams();
  const dynamic = params.slug;

  const [messages, setMessages] = useState<Message[]>();
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
        setMessages(data); // Set the fetched messages
      } catch (error) {
        console.error("Error fetching message history:", error);
      }
    };

    fetchMessageHistory();
  }, [dynamic, user]);

  // Subscribe to Supabase Realtime for new messages
  useEffect(() => {
    const channel = supabase
      .channel("messages") // Unique channel name
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Listen for new rows
          schema: "public",
          table: "messages", // Your messages table
          filter: `channel_id=eq.${dynamic}`, // Filter by channel ID
        },
        (payload) => {
          console.log("New message received:", payload.new);
          setMessages((prev) => [...prev, payload.new as Message]); // Append the new message
        },
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [dynamic]);

  useEffect(() => {
    const socket = new WebSocket(WS_URL + dynamic + `?id=${user.user.id}`);

    console.log(socket);

    socket.onopen = () => console.log("Connected to WebSocket");

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

  console.log(messages);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">WebSocket Chat</h1>
      <div className="border p-4 h-64 overflow-auto">
        {messages &&
          messages.map((msg, idx) => (
            <div key={idx} className="p-1 border-b">
              {msg.content}
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
