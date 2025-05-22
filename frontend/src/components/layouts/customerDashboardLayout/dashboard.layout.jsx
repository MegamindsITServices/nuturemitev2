import React from "react";
import { Outlet } from "react-router-dom";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import ClientDashboardSidebar from "../../../components/clientDashboardSidebar/ClientDashboardSidebar";
import { Separator } from "../../../components/ui/separator";
import { Avatar } from "../../../components/ui/avatar";

const CustomerDashboardLayout = () => {
  

  // Get first name from full name
  // const firstName = auth?.user?.firstName || auth?.user?.name?.split(' ')[0] || 'Customer';
 

  return (
    <>
      <SidebarProvider>
 <ClientDashboardSidebar />
      <SidebarInset className="min-h-screen bg-gray-50">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between bg-white">
          <div className="flex flex-row items-center">
            <SidebarTrigger className="" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />

            <h1 className="text-base font-medium ml-1">Customer Dashboard</h1>
          </div>
          <Avatar />
        </header>
        <section className="flex flex-col p-6">
          <Outlet />
        </section>
      </SidebarInset>
      </SidebarProvider>
     
    </>
  );
};

export default CustomerDashboardLayout;
