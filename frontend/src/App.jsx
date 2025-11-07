import AppRoutes from "@/routes/AppRoutes";
import { useEffect } from "react";
import { useCart } from "@/lib/cartStore";
import ChatWidget from "@/components/ChatWidget";
import "./App.css";

export default function App() {
  const { initializeCart } = useCart();

  useEffect(() => {
    // Initialize cart when app loads
    initializeCart().catch((err) => {
      console.warn("Failed to initialize cart:", err);
      // Don't show error to user on init failure, they might not be logged in
    });
  }, [initializeCart]);

  return (
    <div className="h-screen w-screen">
      <AppRoutes />
      <ChatWidget />
    </div>
  );
}
