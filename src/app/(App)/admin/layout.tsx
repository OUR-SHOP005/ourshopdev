"use client";
import AdminNav from "./adminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="py-8">
      <AdminNav />

      {/* Main Content */}
      <main className='flex-1 container py-8'>{children}</main>
    </div>
  );
}
