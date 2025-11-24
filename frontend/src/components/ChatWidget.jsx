import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, X } from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight - 80,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

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

    const maxX = window.innerWidth - 56;
    const maxY = window.innerHeight - 56;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
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
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 focus:bg-green-700 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
          title="Chat with us"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <Button onMouseDown={handleMouseDown} onClick={() => setIsOpen(false)}>
          to do
        </Button>
      )}
    </div>
  );
}
