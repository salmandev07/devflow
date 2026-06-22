import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { LayoutContext } from "../context/LayoutContext";

interface Props {
  children: ReactNode;
}

function DashboardLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ sidebarCollapsed: collapsed, mobileOpen, setMobileOpen }}>
      <div className="min-h-screen flex" style={{ background: "var(--bg-body)" }}>
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/15 dark:bg-black/45 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div
          className="flex flex-col flex-1 min-w-0 transition-all duration-250"
          style={{ marginLeft: 0 }}
        >
          <Navbar onMobileMenuToggle={() => setMobileOpen((v) => !v)} mobileOpen={mobileOpen} />

          <main className="flex-1 p-6 lg:p-8 page-enter">
            {children}
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}

export default DashboardLayout;