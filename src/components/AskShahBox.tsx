"use client";

import { useState } from "react";
import { sendMessageAction } from "@/app/tools/ask-shah/actions";
import ReactMarkdown from "react-markdown";

export default function AskShahBox({
  initialMode,
  initialConversationId,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage = {
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
          আপনি guest mode-এ চ্যাট করছেন। আপনার কথোপকথন সংরক্ষিত হবে না।
          <a href="/login" className="underline ml-1">Login করুন</a>
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
              <ReactMarkdown
                className="prose prose-sm max-w-none leading-relaxed"
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  h3: ({ children }) => <h3 className="font-semibold text-lg mt-4 mb-2">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc ml-6 mb-3">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-6 mb-3">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
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
