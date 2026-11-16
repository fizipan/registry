"use client"

import { ChevronsUpDown, LogOut } from "lucide-react"
import type * as React from "react"

import { initials, type ShellUser } from "@/components/admin-shell/nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export type NavUserProps = {
  user: ShellUser
  userMenu?: React.ReactNode
  onSignOut?: () => void
}

function UserAvatar({ user }: { user: ShellUser }) {
  return (
    <Avatar aria-hidden className="size-8 rounded-lg">
      {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
      <AvatarFallback className="rounded-lg">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}

function UserSummary({ user }: { user: ShellUser }) {
  return (
    <>
      <UserAvatar user={user} />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        {user.email ? (
          <span className="truncate text-xs">{user.email}</span>
        ) : null}
      </div>
    </>
  )
}

export function NavUser({ user, userMenu, onSignOut }: NavUserProps) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserSummary user={user} />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserSummary user={user} />
              </div>
            </DropdownMenuLabel>
            {userMenu ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>{userMenu}</DropdownMenuGroup>
              </>
            ) : null}
            {onSignOut ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => onSignOut()}>
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
