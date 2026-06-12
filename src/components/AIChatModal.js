"use client";
import { useState } from "react";
import { XIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function AIChatModal() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/groq-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      const assistantMsg = { role: "assistant", content: data.answer };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      const errMsg = { role: "assistant", content: "⚠️ Error contacting Groq API" };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className="fixed bottom-5 right-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition"
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
      >
        🤖
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">AI Lab Assistant</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
                  <div className={`rounded-lg p-3 max-w-xs ${msg.role === "assistant" ? "bg-gray-100 dark:bg-gray-700" : "bg-indigo-600 text-white"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && <p className="text-sm text-gray-500">⚙️ Thinking...</p>}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ask about code, algorithms, or anything..."
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md p-2 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
