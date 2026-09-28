"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PanicListener } from "@/components/shared/panic-listener";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("vigia:sidebar:collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("vigia:sidebar:collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <PanicListener />
      {/* Collapsible Desktop Sidebar */}
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
