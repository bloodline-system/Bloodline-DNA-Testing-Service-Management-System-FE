import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import { LayoutDashboardIcon, FileTextIcon, FileChartColumnIcon, CommandIcon, BeakerIcon, ShoppingCartIcon, StethoscopeIcon } from 'lucide-react';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },

  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Test Kits',
      url: '/test-kits',
      icon: <BeakerIcon />,
    },
    {
      title: 'Report',
      url: '/report',
      icon: <FileChartColumnIcon />,
    },
    {
      title: 'Services',
      url: '/manager/medical-services',
      icon: <StethoscopeIcon />,
    },
    {
      title: 'Posts',
      url: '/manager/posts',
      icon: <FileTextIcon />,
    },
    {
      title: 'Order',
      url: '/order',
      icon: <ShoppingCartIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-1.5">
              <a href="#">
                <CommandIcon className="size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
