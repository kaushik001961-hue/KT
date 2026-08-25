"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function AdminThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setDark(false);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      document.documentElement.classList.toggle("dark", prefersDark);
      setDark(prefersDark);
    }

    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;

    document.documentElement.classList.toggle("dark", nextDark);

    localStorage.setItem(
      "theme",
      nextDark ? "dark" : "light"
    );

    setDark(nextDark);
  }

  if (!mounted) {
    return (
      <div className="h-11 w-11 rounded-full border border-[var(--border)] bg-[var(--surface)]" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        dark ? "Switch to light mode" : "Switch to dark mode"
      }
      title={dark ? "Light mode" : "Dark mode"}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600 hover:shadow-md"
    >
      {dark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
