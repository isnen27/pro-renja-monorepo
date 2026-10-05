import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * sidebarCollapsed:
   *  - Mobile (<lg): false = overlay terbuka, true = overlay tertutup
   *  - Desktop (>=lg): false = sidebar penuh (w-72), true = icon rail (w-16)
   */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar vertikal */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarCollapsed(true)}
      />

      {/* Area kanan: topbar + konten */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          onMenuToggle={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
