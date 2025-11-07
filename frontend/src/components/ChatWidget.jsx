import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 focus:bg-green-700 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-lg hover:shadow-xl transition-all duration-200 border-0"
          title="Chat with us"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(false)}>to do</Button>
      )}
    </div>
  );
}
