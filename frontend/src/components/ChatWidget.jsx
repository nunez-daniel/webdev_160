import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, X } from "lucide-react";


const FIXED_OFFSET_NUM = 16; 
const FIXED_OFFSET_STR = `${FIXED_OFFSET_NUM}px`; 
const CHAT_WIDTH = 320;
const CHAT_HEIGHT = 400;

const API_BASE_URL = "http://localhost:8080";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const widgetRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);


  const snapToEdge = () => {
    // Snap the button position to the bottom-right corner (56 button size)
    setPosition({
      x: window.innerWidth - 56 - FIXED_OFFSET_NUM,
      y: window.innerHeight - 56 - FIXED_OFFSET_NUM,
    });
  };

  const adjustPositionForChat = () => {
    let newX = window.innerWidth - CHAT_WIDTH - FIXED_OFFSET_NUM;
    let newY = window.innerHeight - CHAT_HEIGHT - FIXED_OFFSET_NUM;
    
    setPosition({ x: Math.max(FIXED_OFFSET_NUM, newX), y: Math.max(FIXED_OFFSET_NUM, newY) });
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    snapToEdge(); 
  }, []); 



  const handleMouseDown = (e) => {
    if (!isOpen) return; 

    setIsDragging(true);
    const rect = widgetRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Drag logic moved into useEffect for cleaner separation

  const toggleChat = () => {
    if (!isOpen) {
      adjustPositionForChat();
    } else {
      snapToEdge(); // Snap back to fixed button position when closing
    }
    setIsOpen(!isOpen);
  };
  

  useEffect(() => {
    const handleMouseUp = () => {
        setIsDragging(false);

        document.body.style.userSelect = 'auto'; 
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault(); 

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        const maxX = window.innerWidth - CHAT_WIDTH;
        const maxY = window.innerHeight - CHAT_HEIGHT;

        setPosition({
            x: Math.max(FIXED_OFFSET_NUM, Math.min(newX, maxX - FIXED_OFFSET_NUM)),
            y: Math.max(FIXED_OFFSET_NUM, Math.min(newY, maxY - FIXED_OFFSET_NUM)),
        });
    };

    if (isDragging) {
        document.body.style.userSelect = 'none';
        
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            // Ensure style is always reset on cleanup
            document.body.style.userSelect = 'auto'; 
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
        cursor: isDragging ? "grabbing" : isOpen ? "grab" : "pointer",
        bottom: isOpen ? 'auto' : FIXED_OFFSET_STR,
        right: isOpen ? 'auto' : FIXED_OFFSET_STR,
      }}
    >
      {!isOpen ? (
        // The fixed button state
        <Button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 focus:bg-green-700 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
          title="Chat with us"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      ) : (
        // The chat box state
        <div
          className="bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col"
          style={{
            width: `${CHAT_WIDTH}px`,
            height: `${CHAT_HEIGHT}px`,
          }}
        >
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