import { Layout, Truck, UserCog, ChevronDown } from "lucide-react";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "../ui/sidebar";
import { LogoArea } from "../dashboardSidebar/LogoArea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Link } from "react-router-dom";
const DynamicIcon = ({ name, className }) => {
  if (name === "chevron-down") {
    return <ChevronDown className={className} size={16} />;
  }
  // Return the icon directly if it's already a React element
  if (React.isValidElement(name)) {
    return React.cloneElement(name, { className, size: 16 });
  }
  // Default case
  return null;
};

const data = {
  menu: [
    {
      title: "Dashboard",
      link: "/customer/dashboard",
      icon: <Layout />,
      isGroup: false,
      groupTitle: "Dashboard",
      isActive: true,
    },
    {
      title: "Profile",
      link: "#",
      isGroup: true,
      groupTitle: "Profile",
      isActive: false,
      collapsibles: [
        {
          title: "Profile Management",
          icon: <UserCog />,
          isActive: false,
          items: [
            {
              title: "View Profile",
              link: "/customer/profile",
              isActive: false,
            },
            {
              title: "Update Profile",
              link: "/customer/update-profile",
              isActive: false,
            },
          ],
        },
      ],
    },
    {
      title: "Orders",
      link: "#",
      isGroup: true,
      groupTitle: "Orders",
      isActive: false,
      collapsibles: [
        {
          title: "Order Management",
          icon: <Truck />,
          isActive: false,
          items: [
            {
              title: "All Orders",
              link: "/customer/orders",
              isActive: false,
            },
            {
              title: "Cancel Orders",
              link: "/customer/cancel-orders",
              isActive: false,
            },
          ],
        },
      ],
    },
  ],
};
const ClientDashboardSidebar = ({ props }) => {
  return (
    <div>
      <Sidebar variant="sidebar" collapsible="icon" {...props}>
        <SidebarHeader>
          <LogoArea />
        </SidebarHeader>
        <SidebarContent>
          {data.menu &&
            data.menu.map((menuItem) =>
              menuItem.isGroup ? (
                <SidebarGroup key={menuItem.title}>
                  <SidebarGroupLabel>{menuItem.groupTitle}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    {/* Single Menu Item */}
                    {menuItem.collapsibles &&
                      menuItem.collapsibles.map((collapsible) => (
                        <Collapsible
                          key={collapsible.title}
                          defaultOpen={collapsible.isActive}
                          className="group/collapsible"
                        >
                          <SidebarMenu>
                            <SidebarMenuItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={collapsible.title}>
                                  {collapsible.icon && (
                                    <DynamicIcon name={collapsible.icon} />
                                  )}
                                  <span>{collapsible.title}</span>
                                  <DynamicIcon
                                    name="chevron-down"
                                    className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                                  />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                            </SidebarMenuItem>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {collapsible.items &&
                                  collapsible.items.map((eachLink) => (
                                    <SidebarMenuSubItem key={eachLink.title}>
                                      <SidebarMenuSubButton
                                        isActive={eachLink.isActive}
                                        asChild
                                      >
                                        <Link to={eachLink.link}>
                                          <span>{eachLink.title}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenu>
                        </Collapsible>
                      ))}
                    {/* Single Menu Item */}
                  </SidebarGroupContent>
                </SidebarGroup>
              ) : (
                <SidebarGroup key={menuItem.title}>
                  <SidebarMenu>
                    <SidebarMenuItem key={menuItem.title}>
                      <SidebarMenuButton
                        isActive={menuItem.isActive}
                        tooltip={menuItem.title}
                        asChild
                      >
                        <Link to={menuItem.link ? menuItem.link : "#"}>
                          {menuItem.icon}
                          <span>{menuItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              )
            )}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </div>
  );
};

export default ClientDashboardSidebar;
