"use client"

import { ChevronRight } from "lucide-react"
import * as React from "react"

import {
  activeHref,
  badgeTotal,
  formatBadge,
  isParent,
  parentOf,
  type LinkComponent,
  type NavIcon,
  type NavLink,
  type NavParent,
  type NavSection,
  type ShellUser,
} from "@/components/admin-shell/nav"
import { NavUser } from "@/components/admin-shell/nav-user"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export type Brand = { name: string; logo?: React.ReactNode; href?: string }

export type AppSidebarProps = {
  nav: NavSection[]
  currentPath: string
  linkComponent: LinkComponent
  brand: Brand
  user?: ShellUser
  userMenu?: React.ReactNode
  onSignOut?: () => void
}

function BadgeText({ count }: { count: number }) {
  return (
    <>
      <span aria-hidden={count > 99 || undefined}>{formatBadge(count)}</span>
      {count > 99 ? <span className="sr-only">{count}</span> : null}
    </>
  )
}

/** Icon, with a small dot in icon mode when `dot` is set. */
function Glyph({ icon: Icon, dot }: { icon?: NavIcon; dot: boolean }) {
  if (!Icon) return null
  return (
    <span className="relative flex shrink-0">
      <Icon className="size-4" />
      {dot ? (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 hidden size-2 rounded-full bg-sidebar-primary group-data-[collapsible=icon]:block"
        />
      ) : null}
    </span>
  )
}

type LinkProps = {
  link: NavLink
  active: boolean
  Link: LinkComponent
  onNavigate: () => void
}

function TopLink({ link, active, Link, onNavigate }: LinkProps) {
  const hasBadge = (link.badge ?? 0) > 0
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={link.title}>
        <Link
          href={link.href}
          aria-current={active ? "page" : undefined}
          onClick={onNavigate}
        >
          <Glyph icon={link.icon} dot={hasBadge} />
          <span>{link.title}</span>
        </Link>
      </SidebarMenuButton>
      {hasBadge ? (
        <SidebarMenuBadge>
          <BadgeText count={link.badge!} />
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  )
}

function SubLink({ link, active, Link, onNavigate }: LinkProps) {
  const hasBadge = (link.badge ?? 0) > 0
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={active}>
        <Link
          href={link.href}
          aria-current={active ? "page" : undefined}
          onClick={onNavigate}
        >
          <span>{link.title}</span>
        </Link>
      </SidebarMenuSubButton>
      {hasBadge ? (
        <SidebarMenuBadge className="top-1/2 -translate-y-1/2">
          <BadgeText count={link.badge!} />
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuSubItem>
  )
}

type ParentProps = {
  parent: NavParent
  active: string | null
  Link: LinkComponent
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: () => void
}

function ParentItem({
  parent,
  active,
  Link,
  open,
  onOpenChange,
  onNavigate,
}: ParentProps) {
  const { state, isMobile } = useSidebar()
  const total = badgeTotal(parent)
  const holdsActive = parent.items.some((l) => l.href === active)

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton isActive={holdsActive} tooltip={parent.title}>
              <Glyph icon={parent.icon} dot={total > 0} />
              <span>{parent.title}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            {parent.items.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <Link
                  href={link.href}
                  aria-current={link.href === active ? "page" : undefined}
                  className={cn(link.href === active && "bg-accent")}
                >
                  <span className="flex-1">{link.title}</span>
                  {(link.badge ?? 0) > 0 ? (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      <BadgeText count={link.badge!} />
                    </span>
                  ) : null}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={onOpenChange}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={holdsActive} tooltip={parent.title}>
            <Glyph icon={parent.icon} dot={total > 0} />
            <span className="truncate">{parent.title}</span>
            <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {!open && total > 0 ? (
          <SidebarMenuBadge className="right-7">
            <BadgeText count={total} />
          </SidebarMenuBadge>
        ) : null}
        <CollapsibleContent>
          <SidebarMenuSub>
            {parent.items.map((link) => (
              <SubLink
                key={link.href}
                link={link}
                active={link.href === active}
                Link={Link}
                onNavigate={onNavigate}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function BrandLink({
  brand,
  Link,
  onNavigate,
}: {
  brand: Brand
  Link: LinkComponent
  onNavigate: () => void
}) {
  const content = (
    <>
      {brand.logo ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          {brand.logo}
        </div>
      ) : null}
      <span className="truncate font-medium">{brand.name}</span>
    </>
  )
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          {brand.href ? (
            <Link href={brand.href} onClick={onNavigate}>
              {content}
            </Link>
          ) : (
            <div>{content}</div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({
  nav,
  currentPath,
  linkComponent: Link,
  brand,
  user,
  userMenu,
  onSignOut,
}: AppSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()
  const active = activeHref(nav, currentPath)
  const activeParent = active ? (parentOf(nav, active)?.title ?? null) : null

  // Accordion: follow the active parent when it changes; a top-level active link leaves it alone.
  const [tracked, setTracked] = React.useState(activeParent)
  const [openParent, setOpenParent] = React.useState(activeParent)
  if (activeParent !== tracked) {
    setTracked(activeParent)
    if (activeParent !== null) setOpenParent(activeParent)
  }

  const onNavigate = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <BrandLink brand={brand} Link={Link} onNavigate={onNavigate} />
      </SidebarHeader>
      <SidebarContent>
        {nav.map((section, index) => (
          <SidebarGroup key={section.label ?? index}>
            {section.label ? (
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            ) : null}
            <SidebarMenu>
              {section.items.map((item) =>
                isParent(item) ? (
                  <ParentItem
                    key={item.title}
                    parent={item}
                    active={active}
                    Link={Link}
                    open={openParent === item.title}
                    onOpenChange={(open) =>
                      setOpenParent(open ? item.title : null)
                    }
                    onNavigate={onNavigate}
                  />
                ) : (
                  <TopLink
                    key={item.href}
                    link={item}
                    active={item.href === active}
                    Link={Link}
                    onNavigate={onNavigate}
                  />
                )
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {user ? (
        <SidebarFooter>
          <NavUser user={user} userMenu={userMenu} onSignOut={onSignOut} />
        </SidebarFooter>
      ) : null}
      <SidebarRail />
    </Sidebar>
  )
}
