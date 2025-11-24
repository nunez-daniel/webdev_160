import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, X } from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(() => {
    // Initialize position snapped to bottom-right edge
    return {
      x: window.innerWidth - 56,
      y: window.innerHeight - 56,
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = widgetRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    const maxX = window.innerWidth - (isOpen ? 320 : 56);
    const maxY = window.innerHeight - (isOpen ? 400 : 56);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (!isOpen) {
      // Snap to bottom-right corner when closed and drag is released
      snapToEdge();
    }
  };

  const snapToEdge = () => {
    // Always snap to bottom-right corner
    setPosition({
      x: window.innerWidth - 56,
      y: window.innerHeight - 56,
    });
  };

  const adjustPositionForChat = () => {
    // When opening chat, ensure it's fully visible and positioned optimally
    let newX = position.x;
    let newY = position.y;

    const chatWidth = 320;
    const chatHeight = 400;
    const buttonSize = 56;

    // If current position would make chat go off right edge, move left
    if (newX + chatWidth > window.innerWidth) {
      newX = window.innerWidth - chatWidth - 10; // 10px margin
    }

    // If current position would make chat go off bottom edge, move up
    if (newY + chatHeight > window.innerHeight) {
      newY = window.innerHeight - chatHeight - 10; // 10px margin
    }

    // If chat would still go off left edge, move right
    if (newX < 0) {
      newX = 10; // 10px margin from left
    }

    // If chat would still go off top edge, move down
    if (newY < 0) {
      newY = 10; // 10px margin from top
    }

    // Ensure the button position is also valid after adjustment
    // The button should be positioned relative to the chat
    // For now, keep the button at the same position but ensure it's visible

    setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
  };

  const toggleChat = () => {
    if (isOpen) {
      // Closing the chat - snap to edge
      snapToEdge();
    } else {
      // Opening the chat - adjust position to be visible
      adjustPositionForChat();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      // Reposition widget if window is resized
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - (isOpen ? 320 : 56)),
        y: Math.min(prev.y, window.innerHeight - (isOpen ? 400 : 56)),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling chat API:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      ref={widgetRef}
      className="fixed z-50 transition-all"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : isOpen ? "default" : "grab",
      }}
    >
      {!isOpen ? (
        <Button
          onMouseDown={handleMouseDown}
          onClick={toggleChat}
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 focus:bg-green-700 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
          title="Chat with us"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg w-80 h-96 flex flex-col">
          <div
            className="bg-green-600 text-white p-3 rounded-t-lg cursor-grab flex justify-between items-center"
            onMouseDown={handleMouseDown}
          >
            <span className="font-semibold">Customer Service</span>
            <Button
              onClick={toggleChat}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-green-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className="text-gray-500 text-center text-sm">
                Hi! How can I help you with your experience using our grocery
                app?
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-sm ${
                  msg.role === "user" ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 mr-8 p-2 rounded-lg text-sm">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your app experience..."
              className="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 rounded-l-none rounded-r px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
