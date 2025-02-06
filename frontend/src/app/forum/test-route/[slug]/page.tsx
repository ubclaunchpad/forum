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
  }, [dynamic, user]);

  useEffect(() => {
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${dynamic}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dynamic]);

  useEffect(() => {
    const socket = new WebSocket(WS_URL + dynamic + `?token=${user.token}`);
    setWs(socket);

    return () => socket.close();
  }, [dynamic, user]);

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
        {messages &&
          messages.map((msg, idx) => (
            <div key={idx} className="p-1 border-b flex flex-row gap-4">
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
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2">
          Send
        </button>
      </div>
    </div>
  );
}
