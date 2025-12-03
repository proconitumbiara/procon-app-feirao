"use client";

import { Building2, LayoutDashboard, TicketsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();
  const isAtendimento = pathname === "/atendimento";
  const isSetores = pathname === "/setores";
  const isTickets = pathname === "/tickets";

  return (
    <nav className="bg-background fixed right-0 bottom-0 left-0 z-50 border-t lg:hidden">
      <div className="flex h-16 items-center justify-around">
        <Link
          href="/atendimento"
          className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
            isAtendimento
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard
            className={`h-5 w-5 transition ${
              isAtendimento ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span
            className={`text-xs font-medium transition ${
              isAtendimento ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Atendimento
          </span>
        </Link>

        <Link
          href="/setores"
          className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
            isTickets
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <TicketsIcon
            className={`h-5 w-5 transition ${
              isTickets ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span
            className={`text-xs font-medium transition ${
              isTickets ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Tickets
          </span>
        </Link>

        <Link
          href="/setores"
          className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
            isSetores
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2
            className={`h-5 w-5 transition ${
              isSetores ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <span
            className={`text-xs font-medium transition ${
              isSetores ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Setores
          </span>
        </Link>
      </div>
    </nav>
  );
}
