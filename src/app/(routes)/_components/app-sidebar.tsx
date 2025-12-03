"use client";

import { Building2, LayoutDashboard, TicketsIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const isAtendimento = pathname === "/atendimento";
  const isSetores = pathname === "/setores";
  const isTickets = pathname === "/tickets";
  const buttonBaseClasses =
    "group/button flex h-20 w-20 flex-col items-center justify-center gap-2 rounded-md border text-center transition-all hover:bg-transparent bg-transparent";
  const buttonActiveClasses = "border-primary text-primary";
  const buttonInactiveClasses =
    "border-border hover:border-primary hover:bg-primary/10";

  return (
    <>
      <SidebarHeader className="bg-background flex items-center gap-2 p-2">
        <Image src="/LogoFeirao.png" alt="Logo" width={200} height={200} />
      </SidebarHeader>

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="flex flex-col gap-4">
                <SidebarMenuButton
                  asChild
                  isActive={isAtendimento}
                  className="bg-transparent hover:bg-transparent data-[active=true]:bg-transparent data-[state=open]:hover:bg-transparent"
                >
                  <Link
                    href="/atendimento"
                    className={`${buttonBaseClasses} ${
                      isAtendimento
                        ? buttonActiveClasses
                        : buttonInactiveClasses
                    }`}
                  >
                    <LayoutDashboard
                      className={`h-5 w-5 transition ${
                        isAtendimento
                          ? "text-primary"
                          : "text-foreground group-hover/button:text-primary"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold transition ${
                        isAtendimento
                          ? "text-primary"
                          : "text-foreground group-hover/button:text-primary"
                      }`}
                    >
                      Atendimento
                    </span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton
                  asChild
                  isActive={isSetores}
                  className="bg-transparent hover:bg-transparent data-[active=true]:bg-transparent data-[state=open]:hover:bg-transparent"
                >
                  <Link
                    href="/setores"
                    className={`${buttonBaseClasses} ${
                      isSetores ? buttonActiveClasses : buttonInactiveClasses
                    }`}
                  >
                    <Building2
                      className={`h-5 w-5 transition ${
                        isSetores
                          ? "text-primary"
                          : "text-foreground group-hover/button:text-primary"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold transition ${
                        isSetores
                          ? "text-primary"
                          : "text-foreground group-hover/button:text-primary"
                      }`}
                    >
                      Serviços
                    </span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuButton
                  asChild
                  isActive={isTickets}
                  className="bg-transparent hover:bg-transparent data-[active=true]:bg-transparent data-[state=open]:hover:bg-transparent"
                >
                  <Link
                    href="/tickets"
                    className={`${buttonBaseClasses} ${
                      isTickets ? buttonActiveClasses : buttonInactiveClasses
                    }`}
                  >
                    <TicketsIcon
                      className={`h-5 w-5 transition ${
                        isTickets
                          ? "text-primary"
                          : "text-foreground group-hover/button:text-primary"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold transition ${
                        isTickets
                          ? "text-primary"
                          : "text-foreground group-hover/button:text-primary"
                      }`}
                    >
                      Tickets
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
