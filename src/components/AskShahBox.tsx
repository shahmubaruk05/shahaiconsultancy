"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { sendMessageAction } from "@/app/tools/ask-shah/actions";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AskShahBoxProps = {
  initialMode: "guest" | "user";
  initialConversationId: string | null;
};

export default function AskShahBox({
  initialMode,
  initialConversationId,
}: AskShahBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // always scroll to bottom when new messages come
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Save message only for logged-in users
    if (initialMode === "user" && initialConversationId) {
      await sendMessageAction({
        conversationId: initialConversationId,
        message: userMessage.content,
      });
    }

    try {
      const res = await fetch("/api/ask-shah", {
        method: "POST",
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content:
          data.reply ||
          "আমি এখনই উত্তর দিতে পারলাম না। একটু পরে আবার চেষ্টা করুন।",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: Message = {
        role: "assistant",
        content:
          "Server error হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      console.error("Ask Shah error:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Ask Shah</h1>
        <p className="text-sm text-slate-500 mt-1">
          Startup, funding, Bangladesh/USA company formation, tax, licensing,
          business strategy — সব প্রশ্নের জন্য আপনার AI startup coach।
        </p>
        {initialMode === "guest" && (
          <div className="mt-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg">
            আপনি guest mode-এ চ্যাট করছেন। আপনার কথোপকথন সংরক্ষিত হবে না।{" "}
            <a href="/login" className="underline font-medium">
              Login করুন
            </a>{" "}
            যাতে ভবিষ্যতে history save থাকে।
          </div>
        )}
      </div>

      <div className="border rounded-xl bg-white shadow-sm flex flex-col h-[520px]">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3 chat-scroll"
        >
          {messages.length === 0 && (
            <div className="text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg px-3 py-3">
              উদাহরণ স্বরূপ আপনি জিজ্ঞেস করতে পারেন:
              <ul className="list-disc ml-5 mt-1 space-y-0.5">
                <li>“বাংলাদেশে ১০ লাখ টাকার company register করতে কত খরচ হবে?”</li>
                <li>“USA LLC খুলতে কি কি ডকুমেন্ট লাগবে?”</li>
                <li>“আমার food delivery startup-এর জন্য ৩০ দিনের marketing plan দিন।”</li>
              </ul>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={idx}
                className={
                  "flex w-full " + (isUser ? "justify-end" : "justify-start")
                }
              >
                {/* assistant avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold mr-2 mt-1 flex-shrink-0">
                    SM
                  </div>
                )}

                <div
                  className={
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed " +
                    (isUser
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-900 rounded-bl-sm")
                  }
                >
                  <ReactMarkdown
                    className={
                      "prose prose-sm max-w-none " +
                      (isUser ? "prose-invert" : "")
                    }
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-[15px] font-semibold mt-2 mb-1">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc ml-4 mb-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal ml-4 mb-2">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-0.5">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* user avatar on right (optional, small circle) */}
                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center text-[10px] font-medium ml-2 mt-1 flex-shrink-0">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {/* typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold mr-2 mt-1 flex-shrink-0">
                SM
              </div>
              <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-sm px-3 py-2 text-xs flex items-center gap-1">
                <span className="typing-dot animate-pulse">●</span>
                <span className="typing-dot animate-pulse delay-150">●</span>
                <span className="typing-dot animate-pulse delay-300">●</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t px-4 py-3 flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="আপনার প্রশ্ন লিখুন…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
