import { Outlet } from "react-router-dom";

import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark bg-mesh-light dark:bg-mesh-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
