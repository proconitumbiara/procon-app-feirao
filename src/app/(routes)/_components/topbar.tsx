"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/actions/authentication/sign-out";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TopBarProps = {
  user: {
    name: string;
    cpf: string;
    phoneNumber: string;
  };
};

export function TopBar({ user }: TopBarProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-16 w-full items-center">
      <div className="flex-1">
        <h1 className="text-primary text-lg font-medium lg:text-2xl">
          Olá, {user.name}! Bem-vindo(a) de volta.
        </h1>
      </div>
      <div className="flex items-center justify-end px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Avatar className="border-primary hover:border-primary/80 h-8 w-8 cursor-pointer border-2 p-4 transition-all hover:scale-105">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64"
            side="bottom"
            sideOffset={8}
          >
            <DropdownMenuItem asChild>
              <Link
                href="/configuracoes"
                className="flex cursor-pointer items-center"
              >
                <User className="text-foreground mr-2 h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={signOut}>
              <DropdownMenuItem
                asChild
                variant="destructive"
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <button type="submit" className="flex w-full items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
