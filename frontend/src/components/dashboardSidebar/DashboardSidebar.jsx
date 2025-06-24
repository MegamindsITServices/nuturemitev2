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
import { LogoArea } from "./LogoArea";
import { BookOpen, Box, ChevronDown, ImagePlay, Layout, Newspaper, ShieldUser, Truck, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

// Simple Dynamic Icon component to handle different icon types
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
      link: "/admin/dashboard",
      icon: <Layout />,
      isGroup: false,
      groupTitle: "Dashboard",
      isActive: true,
    },
    {
      title: "Products",
      link: "#",
      isGroup: true,
      groupTitle: "Products",
      isActive: false,
      collapsibles: [
        {
          title: "Product Management",
          icon: <Box />,
          isActive: false,
          items: [            {
              title: "All Products",
              link: "/admin/products",
              isActive: false,
            },
            {
              title: "Add Product",
              link: "/admin/add-product",
              isActive: false,
            },
          ],
        },
      ],
    },
    {
      title: "Collections",
      link: "#",
      isGroup: true,
      groupTitle: "Collections",
      isActive: false,
      collapsibles: [
        {
          title: "Collection Management",
          icon: <BookOpen />,
          isActive: false,
          items: [            {
              title: "All Collections",
              link: "/admin/collections",
              isActive: false,
            },
           
          ],
        },
      ],
    },
    {
      title: "Banner",
      link: "#",
      isGroup: true,
      groupTitle: "Banner",
      isActive: false,
      collapsibles: [
        {
          title: "Banner Management",
          icon: <ImagePlay />,
          isActive: false,
          items: [            {
              title: "Add Banner",
              link: "/admin/add-banner",
              isActive: false,
            },
            {
              title: "All Banners",
              link: "/admin/banners",
              isActive: false,
            },
          ],
        },
      ],
    },
     {
      title: "Blog",
      link: "#",
      isGroup: true,
      groupTitle: "Blog",
      isActive: false,
      collapsibles: [
        {
          title: "Blog Management",
          icon: <Newspaper />,
          isActive: false,
          items: [
            {
              title: "Add Blog",
              link: "/admin/add-blog",
              isActive: false,
            },
            {
              title: "All Blogs",
              link: "/admin/blogs",
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
          items: [            {
              title: "All Orders",
              link: "/admin/orders",
              isActive: false,
            },
             {
              title: "Payment Details",
              link: "/admin/payments",
              isActive: false,
            },
          ],
        },
      ],
    },{
      title: "Enquiry",
      link: "#",
      isGroup: true,
      groupTitle: "Enquiry",
      isActive: false,
      collapsibles: [
        {
          title: "Enquiry Management",
          icon: <HelpCircle />,
          isActive: false,
          items: [            {
              title: "Enquery Messages",
              link: "/admin/allEnquiry",
              isActive: false,
            },
          
          ],
        },
      ],
    },
     {
      title: "Admin Console",
      link: "#",
      isGroup: true,
      groupTitle: "Admin Console",
      isActive: false,
      collapsibles: [
        {
          title: "Admin Management",
          icon: <ShieldUser />,
          isActive: false,
          items: [            {
              title: "All Admins",
              link: "/admin/admins",
              isActive: false,
            },
            {
              title: "Add Admin",
              link: "/admin/add-admin",
              isActive: false,
            },
          ],
        },
      ],
    },
  ],
};
const DashboardSidebar = ({ props }) => {
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

export default DashboardSidebar;
