
"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { sendMessageAction, saveLeadAction } from "@/app/tools/ask-shah/actions";

type Message = {
  role: "user" | "assistant";
  content: string;
  actions?: any[];
};

type AskShahBoxProps = {
  initialMode: "guest" | "user";
  initialConversationId: string | null;
};

export default function AskShahBox({
  initialMode,
  initialConversationId,
}: AskShahBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "স্বাগতম! আমি শাহ মুবারুক – আপনার AI-powered Startup Coach। 😊\n\nআপনি জানতে পারেন:\n• Startup idea, funding & pitch deck\n• Bangladesh/USA company formation\n• Tax, licensing & compliance\n• Business strategy, marketing বা growth\n\nকীভাবে আপনাকে সাহায্য করতে পারি আজ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Guest lead form state
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(initialMode === "guest");

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleLeadSubmit() {
    if (!leadName.trim() || !leadEmail.trim() || !leadPhone.trim()) {
      alert("Please enter name, email and phone.");
      return;
    }
    setLeadSaving(true);
    try {
      await saveLeadAction({
        name: leadName.trim(),
        email: leadEmail.trim(),
        phone: leadPhone.trim(),
        topic: "Ask Shah guest chat",
      });
      setLeadSaved(true);
      setShowLeadForm(false);
    } catch (e) {
      console.error("Failed to save lead", e);
      alert("Lead save করতে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।");
    } finally {
      setLeadSaving(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    const wasFirstMessage = messages.length === 1; // Now checking for 1 because of welcome message

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Save message only for logged-in users
    if (initialMode === "user" && initialConversationId) {
      // On first message, also create a lead entry for logged-in user
      if (wasFirstMessage) {
        await saveLeadAction({
          name: "",
          email: "",
          phone: "",
          topic: userMessage.content,
        });
      }

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
        actions: data.actions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Ask Shah error:", error);
      const assistantMessage: Message = {
        role: "assistant",
        content:
          "Server error হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
      };
      setMessages((prev) => [...prev, assistantMessage]);
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
      {/* Header */}
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
        {/* Lead form for guest */}
        {initialMode === "guest" && showLeadForm && !leadSaved && (
          <div className="px-4 pt-3 pb-2 border-b bg-slate-50">
            <p className="text-xs text-slate-700 mb-2">
              আপনার জন্য personalized guide তৈরি করতে আপনার কিছু তথ্য দরকার:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <input
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                placeholder="নাম"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
              />
              <input
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                placeholder="ইমেইল"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
              />
              <input
                className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                placeholder="মোবাইল নম্বর"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={handleLeadSubmit}
                disabled={leadSaving}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium disabled:opacity-60"
              >
                {leadSaving ? "Saving..." : "Submit info"}
              </button>
              <button
                type="button"
                onClick={() => setShowLeadForm(false)}
                className="text-[11px] text-slate-500 underline"
              >
                পরে দেবো (skip)
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3 chat-scroll"
        >
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

                <div className="flex flex-col max-w-[80%]">
                  <div
                    className={
                      "rounded-2xl px-3 py-2 text-sm leading-relaxed " +
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

                  {/* CTA cards under assistant messages */}
                  {!isUser && msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 space-y-3">
                      {msg.actions.map((act: any, idx2: number) => (
                        <div
                          key={idx2}
                          className="p-3 border rounded-lg bg-white shadow-sm"
                        >
                          {act.type?.startsWith("contact-") && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium mb-1">
                              Contact Option
                            </span>
                          )}
                          <h4 className="font-semibold text-slate-800">
                            {act.title}
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {act.description}
                          </p>
                          <a
                            href={act.buttonLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
                          >
                            {act.buttonText}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* user avatar */}
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
