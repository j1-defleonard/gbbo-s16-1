

"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, Users, BookOpen, Shield, Trophy, Hammer } from "lucide-react";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { BakeoffLogo } from "./BakeoffLogo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/leagues/[leagueId]", label: "Standings", icon: Home },
  { href: "/leagues/[leagueId]/my-team", label: "My Team", icon: Users },
  { href: "/leagues/[leagueId]/draft", label: "Draft", icon: Hammer },
  { href: "/leagues/[leagueId]/weekly-log", label: "Weekly Log", icon: BookOpen },
  { href: "/leagues/[leagueId]/admin", label: "Admin", icon: Shield },
];

export function SidebarNav() {
  const pathname = usePathname();
  const params = useParams();
  const { user, logOut } = useAuth();
  const { activeLeagueId, getLeague } = useAppContext();
  
  const leagueId = params.leagueId as string || activeLeagueId;
  const activeLeague = leagueId ? getLeague(leagueId) : null;
  const isDraftComplete = activeLeague?.draftState.isDraftComplete ?? true;

  const getHref = (template: string) => {
    return leagueId ? template.replace("[leagueId]", leagueId) : "/leagues";
  };
  
  const isActive = (template: string) => {
    return pathname === getHref(template);
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader>
        <div className="flex items-center justify-center p-2 group-data-[collapsible=icon]:hidden">
            <BakeoffLogo />
        </div>
        <div className="hidden items-center justify-center p-2 group-data-[collapsible=icon]:flex">
            <WhiskIcon className="h-6 w-6 text-primary" />
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/leagues"} tooltip={{ children: "Leagues" }}>
                <Link href="/leagues"><Trophy /><span>Leagues</span></Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
        
        {menuItems.map((item) => {
          if (item.label === 'Draft' && isDraftComplete) {
            return null;
          }
          return (
            <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={{ children: item.label }}
                disabled={!activeLeague}
                aria-disabled={!activeLeague}
                className={cn({ 'cursor-not-allowed opacity-50': !activeLeague })}
                >
                <Link href={getHref(item.href)}>
                    <item.icon />
                    <span>{item.label}</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
      <SidebarFooter>
         <SidebarMenuItem>
            <div className="flex flex-col gap-2 w-full group-data-[collapsible=icon]:items-center">
              <SidebarMenuButton tooltip={{ children: user?.displayName || user?.email || "Profile" }} className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || undefined} />
                      <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold truncate">{user?.displayName || user?.email}</span>
              </SidebarMenuButton>
              <Button variant="outline" size="sm" onClick={logOut} className="w-full group-data-[collapsible=icon]:hidden">Sign Out</Button>
            </div>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}


function WhiskIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 18a2 2 0 0 0 4 0 2 2 0 0 0-4 0Z" />
        <path d="M12 18a2 2 0 0 0 4 0 2 2 0 0 0-4 0Z" />
        <path d="M14 22V8a2 2 0 0 0-2-2" />
        <path d="M10 22V8a2 2 0 1 0-4 0" />
        <path d="m14 14-2.5-2.5" />
        <path d="m10 14 2.5-2.5" />
      </svg>
    );
  }
