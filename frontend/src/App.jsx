import AppRoutes from "@/routes/AppRoutes";
import { useEffect } from "react";
import { useCart, setToastFunction } from "@/lib/cartStore";
import { useToast } from "@/lib/use-toast";
import { Toaster } from "@/components/ui/toaster";
import ChatWidget from "@/components/ChatWidget";
import "./App.css";

export default function App() {
  const { initializeCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    setToastFunction(toast);

    initializeCart().catch(() => {});
  }, [initializeCart, toast]);

  return (
    <div className="h-screen w-screen">
      <AppRoutes />
      <ChatWidget />
      <Toaster />
    </div>
  );
}
