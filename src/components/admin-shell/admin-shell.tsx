"use client"

import * as React from "react"

import { AppHeader } from "@/components/admin-shell/app-header"
import { AppSidebar, type Brand } from "@/components/admin-shell/app-sidebar"
import type {
  Crumb,
  LinkComponent,
  LinkComponentProps,
  NavSection,
  ShellUser,
} from "@/components/admin-shell/nav"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export type AdminShellProps = {
  nav: NavSection[]
  currentPath: string
  linkComponent?: LinkComponent
  brand: Brand
  user?: ShellUser
  userMenu?: React.ReactNode
  onSignOut?: () => void
  breadcrumbs?: Crumb[]
  headerActions?: React.ReactNode
  defaultSidebarOpen?: boolean
  children: React.ReactNode
}

function DefaultLink(props: LinkComponentProps) {
  return <a {...props} />
}

export function AdminShell({
  nav,
  currentPath,
  linkComponent = DefaultLink,
  brand,
  user,
  userMenu,
  onSignOut,
  breadcrumbs,
  headerActions,
  defaultSidebarOpen,
  children,
}: AdminShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultSidebarOpen ?? true}>
        <AppSidebar
          nav={nav}
          currentPath={currentPath}
          linkComponent={linkComponent}
          brand={brand}
          user={user}
          userMenu={userMenu}
          onSignOut={onSignOut}
        />
        <SidebarInset>
          <AppHeader
            breadcrumbs={breadcrumbs}
            actions={headerActions}
            linkComponent={linkComponent}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
