import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="lg:ml-[260px] p-4 md:p-8 pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
