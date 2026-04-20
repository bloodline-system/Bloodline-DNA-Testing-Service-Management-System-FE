import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  FileChartColumnIcon,
  CommandIcon,
  BeakerIcon,
  ShoppingCartIcon,
  StethoscopeIcon,
} from "lucide-react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
<<<<<<< HEAD
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Orders",
      url: "/order",
      icon: (
        <FileIcon
        />
      ),
    },
    {
      title: "Reports",
      url: "/report",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      title: "Test Kits",
      url: "/test-kits",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      title: "Profile",
      url: "/profile",
      icon: (
        <UsersIcon
        />
      ),
    },
  ],
  navClouds: [
    {
      title: "Manager",
      icon: (
        <Settings2Icon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Manage Orders",
          url: "/order",
        },
        {
          title: "Manage Reports",
          url: "/manager/reports",
        },
        {
          title: "Manage Posts",
          url: "/manager/posts",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      name: "Reports",
      url: "#",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: (
        <FileIcon
        />
      ),
    },
  ],
}
=======
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Test Kits",
      url: "/test-kits",
      icon: <BeakerIcon />,
    },
    {
      title: "Report",
      url: "/report",
      icon: <FileChartColumnIcon />,
    },
    {
      title: "Services",
      url: "/manager/medical-services",
      icon: <StethoscopeIcon />,
    },
    {
      title: "Posts",
      url: "/manager/posts",
      icon: <FileTextIcon />,
    },
    {
      title: "Order",
      url: "/order",
      icon: <ShoppingCartIcon />,
    },
  ],
};
>>>>>>> 4bd60cdd6da8104b97492694cc458ed0bd8f1dc9

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <CommandIcon className="size-5!" />
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
