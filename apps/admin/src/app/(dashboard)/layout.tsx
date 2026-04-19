import { Suspense } from "react";
import DashboardClientLayout from "./DashboardClientLayout";

export default function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Yuklanmoqda...</p>
        </div>
      </div>
    }>
      <DashboardClientLayout>{children}</DashboardClientLayout>
    </Suspense>
  );
}
