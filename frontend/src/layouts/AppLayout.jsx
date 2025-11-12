import TopNav from "@/components/TopNav";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <TopNav />
      <div className="flex-1 overflow-auto">
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
