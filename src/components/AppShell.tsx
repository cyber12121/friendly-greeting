import React from "react";
import { Outlet } from "@tanstack/react-router";
import { Header } from "./Header";
import { DesktopSidebar, MobileNavigation } from "./Navigation";
import { LessonModal } from "./LessonModal";

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 min-w-0 pb-28 lg:pb-16">
          <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNavigation />
      <LessonModal />
    </div>
  );
};
