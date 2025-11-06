import TopNav from "@/components/TopNav";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar on every app page */}
      <TopNav />
      {/* The active child route renders here */}
      <Outlet />
    </div>
  );
}
