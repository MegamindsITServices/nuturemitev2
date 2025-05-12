import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Avatar from '../../avatar/Avatar'
import DashboardSidebar from '../../dashboardSidebar/DashboardSidebar'
import { Separator } from '../../../components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../../components/ui/sidebar'
import { useHeaderTitle } from '../../../hooks/use-header'

const DashboardLayout = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments[pathSegments.length - 1];
  
  // Format the title (capitalize first letter, convert dashes to spaces)
  const formatTitle = (text) => {
    if (!text) return 'Dashboard';
    return text
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const title = useHeaderTitle() || formatTitle(currentPage);
  
  return (
    <SidebarProvider>
        <DashboardSidebar/>
        <SidebarInset className="min-h-screen bg-gray-50">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between bg-white">
          <div className="flex flex-row items-center">
            <SidebarTrigger className="" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />

            <h1 className="text-base font-medium ml-1">{title}</h1>
          </div>
          <Avatar />
        </header>
        <section className='flex flex-col p-6'>
            <Outlet/>
        </section>
        </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardLayout