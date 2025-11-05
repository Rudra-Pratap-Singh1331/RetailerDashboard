import { useState } from "react";
import { NavLink } from "react-router-dom";

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Add Product", path: "/add" },
    { name: "Restock", path: "/restock" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 w-full sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center justify-between h-16 flex-wrap gap-3">
          <div className="text-[#0071dc] font-bold text-lg sm:text-xl">
            RetailMate AI
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex flex-wrap gap-6 text-[#0071dc] text-base sm:text-lg font-medium">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block py-2 border-b-2 ${
                        isActive
                          ? "border-[#0071dc]"
                          : "border-transparent hover:border-[#0071dc]"
                      } transition-all duration-200`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Gemini text */}
          <div className="hidden md:block text-sm text-gray-600 font-medium">
            Say “Hello Gemini”
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#0071dc] text-2xl focus:outline-none"
          >
            ☰
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden mt-2 pb-4 border-t border-gray-200">
            <ul className="flex flex-col space-y-2 text-[#0071dc] text-base font-medium">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `block py-1 border-b-2 ${
                        isActive
                          ? "border-[#0071dc]"
                          : "border-transparent hover:border-[#0071dc]"
                      } transition-all duration-200`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
              <li className="text-sm mt-3 pl-1 text-gray-600">
                Say “Hello Gemini”
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
