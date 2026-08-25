"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type SiteChromeProps = {
  children: React.ReactNode;
  isAdmin?: boolean;
};

export default function SiteChrome({
  children,
  isAdmin = false,
}: SiteChromeProps) {
  const pathname = usePathname();

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-x-hidden">
      <Navbar isAdmin={isAdmin} />

      <div className="relative overflow-x-hidden">
        {children}
      </div>

      <Footer />
    </div>
  );
}