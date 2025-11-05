import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-6">
          <Outlet />
        </div>
      </main>
      <footer className="text-center text-gray-600 py-4 text-xs sm:text-sm border-t border-gray-200">
        © 2025 — All rights reserved
      </footer>
    </div>
  );
};

export default AppLayout;
