"use client";

import { useState } from "react";
import { sendMessageAction } from "@/app/tools/ask-shah/actions";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function AskShahBox({
  initialMode,
  initialConversationId,
}: {
  initialMode: "guest" | "user";
  initialConversationId: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // save if logged in
    if (initialMode === "user") {
      await sendMessageAction({
        conversationId: initialConversationId,
        message: userMessage.content,
      });
    }

    // AI reply call
    const res = await fetch("/api/ask-shah", {
      method: "POST",
      body: JSON.stringify({
        messages: [...messages, userMessage],
      }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);

    setLoading(false);
  }

  return (
    <div className="w-full border rounded-xl bg-white shadow p-4 flex flex-col h-[600px]">
      {initialMode === "guest" && (
        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded mb-2">
          You are chatting in guest mode. Your conversation will not be saved.
          <a href="/login" className="underline ml-1">Login</a>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-3 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.role === "user"
                ? "text-right"
                : "text-left"
            }
          >
            <div
              className={
                msg.role === "user"
                  ? "inline-block bg-blue-600 text-white px-3 py-2 rounded-lg max-w-xs"
                  : "inline-block bg-slate-100 text-slate-800 px-3 py-2 rounded-lg max-w-xs"
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-left">
            <div className="inline-block bg-slate-100 text-slate-500 px-3 py-2 rounded-lg">
              …
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          placeholder="Write your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" ? handleSend() : null
          }
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}