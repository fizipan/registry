"use client"

import * as React from "react"

import type { Crumb, LinkComponent } from "@/components/admin-shell/nav"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export type AppHeaderProps = {
  breadcrumbs?: Crumb[]
  actions?: React.ReactNode
  linkComponent: LinkComponent
}

export function AppHeader({
  breadcrumbs,
  actions,
  linkComponent: Link,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 rounded-t-xl border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumb>
            <BreadcrumbList className="flex-nowrap">
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1
                return (
                  <React.Fragment key={`${index}-${crumb.title}`}>
                    {last ? (
                      <BreadcrumbItem className="min-w-0">
                        <BreadcrumbPage className="truncate">
                          {crumb.title}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    ) : (
                      <>
                        <BreadcrumbItem className="hidden md:inline-flex">
                          {crumb.href ? (
                            <BreadcrumbLink asChild>
                              <Link href={crumb.href}>{crumb.title}</Link>
                            </BreadcrumbLink>
                          ) : (
                            <span>{crumb.title}</span>
                          )}
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                      </>
                    )}
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1">{actions}</div>
      ) : null}
    </header>
  )
}
