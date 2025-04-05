"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Trash2, MessageSquare } from "lucide-react";
import MarkdownRenderer from "@/components/ui/markdown-renderer";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type ChatHistory = {
  id: string;
  messages: Message[];
  createdAt: number;
  title: string;
};

const Copilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [currentChat, setCurrentChat] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error("Failed to parse chat history:", err);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(
        "chatHistory",
        JSON.stringify(chatHistory.slice(-20))
      );
    }
  }, [chatHistory]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setCurrentChat((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          chatHistory: currentChat,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message || "Sorry, I couldn't process that request.",
        timestamp: Date.now(),
      };

      setCurrentChat((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, there was an error processing your request.",
        timestamp: Date.now(),
      };
      setCurrentChat((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentChat = () => {
    if (currentChat.length > 0) {
      const chatTitle =
        currentChat[0]?.content.slice(0, 30) + "..." || "New Chat";
      const newChatHistory: ChatHistory = {
        id: Date.now().toString(),
        messages: [...currentChat],
        createdAt: Date.now(),
        title: chatTitle,
      };

      setChatHistory((prev) => {
        const updated = [...prev, newChatHistory].slice(-20);
        localStorage.setItem("chatHistory", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const loadChat = (chat: ChatHistory) => {
    setCurrentChat(chat.messages);
    setShowHistory(false);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory((prev) => {
      const updated = prev.filter((chat) => chat.id !== id);
      localStorage.setItem("chatHistory", JSON.stringify(updated));
      return updated;
    });
  };

  const startNewChat = () => {
    saveCurrentChat();
    setCurrentChat([]);
    setShowHistory(false);
  };

  const closeChat = () => {
    saveCurrentChat();
    setIsOpen(false);
  };

  const toggleChatHistory = () => {
    setShowHistory(!showHistory);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className='fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50 flex items-center justify-center'
        aria-label='Open chat assistant'
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className='fixed bottom-20 right-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col z-50 border border-gray-200 dark:border-gray-700'
          >
            {/* Chat Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 text-white'>
              <h3 className='font-bold'>AI Assistant</h3>
              <div className='flex gap-2'>
                <button
                  onClick={toggleChatHistory}
                  className='p-1.5 rounded-full hover:bg-blue-700 transition-colors'
                  aria-label='View chat history'
                >
                  <MessageSquare size={18} />
                </button>
                <button
                  onClick={closeChat}
                  className='p-1.5 rounded-full hover:bg-blue-700 transition-colors'
                  aria-label='Close chat'
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <AnimatePresence mode='wait'>
              {showHistory ? (
                <motion.div
                  key='history'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800'
                >
                  <div className='flex justify-between items-center mb-4'>
                    <h4 className='font-semibold text-gray-800 dark:text-gray-200'>
                      Chat History
                    </h4>
                    <button
                      onClick={startNewChat}
                      className='text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                    >
                      New Chat
                    </button>
                  </div>

                  {chatHistory.length === 0 ? (
                    <div className='text-center py-10 text-gray-500'>
                      No previous chats found
                    </div>
                  ) : (
                    <ul className='space-y-2'>
                      {chatHistory
                        .slice()
                        .reverse()
                        .map((chat) => (
                          <li
                            key={chat.id}
                            onClick={() => loadChat(chat)}
                            className='p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center'
                          >
                            <div className='overflow-hidden'>
                              <p className='font-medium text-gray-800 dark:text-white truncate'>
                                {chat.title}
                              </p>
                              <p className='text-xs text-gray-500 dark:text-gray-400'>
                                {new Date(chat.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => deleteChat(chat.id, e)}
                              className='p-1 text-gray-500 hover:text-red-500 transition-colors'
                              aria-label='Delete chat'
                            >
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key='chat'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800'
                >
                  {currentChat.length === 0 ? (
                    <div className='h-full flex flex-col items-center justify-center text-center p-6'>
                      <div className='w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
                        <MessageSquare
                          size={24}
                          className='text-blue-600 dark:text-blue-300'
                        />
                      </div>
                      <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-2'>
                        How can I help you today?
                      </h3>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Ask me anything, and I&apos;ll do my best to assist you.
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {currentChat.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm rounded-bl-none"
                            }`}
                          >
                            <div className='whitespace-pre-wrap'>
                              <MarkdownRenderer content={message.content} />
                            </div>
                            <div
                              className={`text-xs mt-1 ${
                                message.role === "user"
                                  ? "text-blue-200"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {formatTimestamp(message.timestamp)}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {isLoading && (
                        <div className='flex justify-start'>
                          <div className='max-w-[80%] p-4 bg-white dark:bg-gray-700 rounded-lg rounded-bl-none shadow-sm'>
                            <div className='flex space-x-2'>
                              <div className='w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500 animate-pulse'></div>
                              <div
                                className='w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500 animate-pulse'
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                              <div
                                className='w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500 animate-pulse'
                                style={{ animationDelay: "0.4s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Input */}
            <form
              onSubmit={handleSubmit}
              className='p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
            >
              <div className='flex items-center gap-2'>
                <input
                  type='text'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Type your message...'
                  className='flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
                  disabled={isLoading}
                />
                <button
                  type='submit'
                  disabled={isLoading || !input.trim()}
                  className={`p-2 rounded-lg bg-blue-600 text-white ${
                    isLoading || !input.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  } transition-colors`}
                  aria-label='Send message'
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Copilot;
