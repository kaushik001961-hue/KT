"use client";

import { usePathname } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  /*
   * Admin login is a standalone page.
   * Do not show the admin sidebar/navigation there.
   */
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <AdminSidebar />

      <div className="lg:pl-72">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}