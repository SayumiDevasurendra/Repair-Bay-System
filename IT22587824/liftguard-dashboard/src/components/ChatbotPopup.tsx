import { type FormEvent, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, User, X } from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const API_URL = import.meta.env.VITE_CHATBOT_API_URL || "http://127.0.0.1:8000/chat";

const ChatbotPopup = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi, I can help with vehicle-bay safety and maintenance questions. Ask me anything about your procedures or alerts.",
    },
  ]);
  const nextIdRef = useRef(2);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setLoading(true);

    const userId = nextIdRef.current++;
    setMessages((prev) => [...prev, { id: userId, role: "user", content: question }]);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as { answer?: string };
      const answer = data.answer?.trim() || "I could not find a response right now.";

      setMessages((prev) => [
        ...prev,
        {
          id: nextIdRef.current++,
          role: "assistant",
          content: answer,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextIdRef.current++,
          role: "assistant",
          content: "Connection issue. Please check if the chatbot API is running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6">
      {open && (
        <section className="mb-4 w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-2xl border border-slate-600/40 bg-slate-900/95 shadow-2xl shadow-cyan-900/25 backdrop-blur-lg">
          <div className="relative border-b border-slate-700/80 bg-gradient-to-r from-cyan-500/20 via-teal-400/15 to-blue-500/20 px-4 py-3">
            <div className="absolute -top-8 right-4 h-20 w-20 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-slate-950/40 p-2">
                  <Bot className="h-4 w-4 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Safety Assistant</p>
                  <p className="text-[11px] text-cyan-200/80">Vehicle Bay Chatbot</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label="Close chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[360px] space-y-2 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_42%),linear-gradient(to_bottom,rgba(2,6,23,0.8),rgba(2,6,23,0.98))] px-3 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <span className="mt-1 rounded-md bg-cyan-500/20 p-1">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  </span>
                )}

                <p
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-tr-sm bg-cyan-500 font-medium text-slate-950"
                      : "rounded-tl-sm border border-slate-700 bg-slate-800/85 text-slate-100"
                  }`}
                >
                  {message.content}
                </p>

                {message.role === "user" && (
                  <span className="mt-1 rounded-md bg-slate-700 p-1">
                    <User className="h-3.5 w-3.5 text-slate-200" />
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-400">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Assistant is typing...
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-700/70 bg-slate-900/95 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-2 py-1.5 transition-colors focus-within:border-cyan-400/60">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about repair-bay safety..."
                className="w-full bg-transparent px-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex items-center justify-center rounded-lg bg-cyan-400 px-2.5 py-2 text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="group relative grid h-14 w-14 place-items-center rounded-full border border-cyan-300/40 bg-gradient-to-br from-cyan-300 via-cyan-400 to-teal-400 text-slate-950 shadow-xl shadow-cyan-900/30 transition-transform duration-200 hover:scale-105"
        aria-label="Toggle chatbot"
      >
        <span className="absolute -inset-1 -z-10 rounded-full bg-cyan-300/30 blur-md transition-colors group-hover:bg-cyan-300/40" />
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ChatbotPopup;
