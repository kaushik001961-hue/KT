"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type ClientLayoutWrapperProps = {
  children: React.ReactNode;
};

export default function ClientLayoutWrapper({
  children,
}: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div>
        <Navbar />
        {children}
      </div>
      <Footer />
    </div>
  );
}