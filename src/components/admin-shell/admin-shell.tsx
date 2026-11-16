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
  const contentId = React.useId()
  const skipToContent = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Focus directly: the href alone would rewrite the URL hash, which hash routers read as a route.
    e.preventDefault()
    document.getElementById(contentId)?.focus()
  }
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultSidebarOpen ?? true}>
        <a
          href={`#${contentId}`}
          onClick={skipToContent}
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:ring-2 focus:ring-ring focus:outline-none"
        >
          Skip to content
        </a>
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
          <div
            id={contentId}
            tabIndex={-1}
            className="flex min-w-0 flex-1 flex-col gap-4 p-4 outline-none"
          >
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
