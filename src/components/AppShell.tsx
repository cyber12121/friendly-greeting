import React from "react";
import { Outlet } from "@tanstack/react-router";
import { Header } from "./Header";
import { DesktopSidebar, MobileNavigation } from "./Navigation";
import { LessonModal } from "./LessonModal";

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
      <LessonModal />
    </div>
  );
};
