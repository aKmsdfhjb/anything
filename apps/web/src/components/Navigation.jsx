"use client";

import { useState } from "react";
import {
  Globe,
  Flame,
  User,
  Plane,
  Map,
  Heart,
  Menu,
  X,
  MapPin,
} from "lucide-react";

export default function Navigation() {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Explore", icon: Globe },
    { href: "/feed", label: "Feed", icon: Flame },
    { href: "/trips", label: "Trips", icon: Plane },
    { href: "/map", label: "Map", icon: Map },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="/add-tip"
              className="flex items-center gap-2"
              title="Share a tip"
            >
              <MapPin
                className="w-8 h-8 text-white"
                fill="white"
                strokeWidth={0}
              />
            </a>

            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                      isActive
                        ? "bg-white text-[#008C8F] shadow-lg"
                        : "text-white hover:bg-white hover:bg-opacity-20"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between h-16 px-5">
          <a
            href="/add-tip"
            className="flex items-center gap-2"
            title="Share a tip"
          >
            <MapPin
              className="w-7 h-7 text-white"
              fill="white"
              strokeWidth={0}
            />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-white bg-opacity-25 p-2 rounded-xl"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="bg-white border-t-4 border-[#7DE2D1]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-4 border-b border-gray-100 ${
                    isActive
                      ? "bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-bold">{item.label}</span>
                </a>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Tab Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-2xl">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center"
              >
                <Icon
                  className={`w-6 h-6 mb-1 ${
                    isActive ? "text-[#008C8F]" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-xs font-bold ${
                    isActive ? "text-[#008C8F]" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}
