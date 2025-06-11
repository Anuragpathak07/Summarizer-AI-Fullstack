import React, { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!isOpen) return null;

  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const updatedMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        let errText = "Failed to fetch chatbot response";
        try {
          const errData = await res.json();
          errText = errData?.error ? `${errData.error}: ${errData.details || ''}` : errText;
        } catch (_) {
          // ignore parse error
        }
        throw new Error(errText);
      }

      const data = await res.json();

      setMessages([...updatedMessages, { role: "assistant", content: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: (err as Error).message || "An unexpected error occurred.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 md:w-[28rem] h-[32rem] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo to-purple text-white">
        <h3 className="font-semibold">AI Assistant</h3>
        <button
          onClick={onClose}
          className="text-white hover:opacity-80 focus:outline-none"
        >
          ✖️
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-900 custom-scrollbar pr-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg text-sm whitespace-pre-line ${msg.role === "user" ? "bg-indigo text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm animate-pulse">
              Typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="px-3 py-2 bg-indigo text-white rounded-lg hover:bg-indigo/90 disabled:opacity-50 text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
