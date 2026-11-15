import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/pilih-role";

  /**
   * sidebarCollapsed:
   *  - Mobile (<lg): false = overlay terbuka, true = overlay tertutup
   *  - Desktop (>=lg): false = sidebar penuh (w-72), true = icon rail (w-16)
   */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  // Jika di halaman login atau pilih role, render konten full tanpa sidebar & topbar
  if (isAuthPage) {
    return <div className="w-full min-h-screen">{children}</div>;
  }

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
        <main className={`flex-1 overflow-y-auto ${sidebarCollapsed ? "p-2 sm:p-4 md:p-5" : "p-3 sm:p-4 md:p-6"}`}>
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
