"use client"

import { Check, ChevronRight } from "lucide-react"
import * as React from "react"

import {
  activeId,
  badgeTotal,
  formatBadge,
  isParent,
  isPlainClick,
  normalizePath,
  parentIdOf,
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

type Navigate = (e: React.MouseEvent) => void

type LinkProps = {
  link: NavLink
  active: boolean
  Link: LinkComponent
  onNavigate: Navigate
}

function TopLink({ link, active, Link, onNavigate }: LinkProps) {
  const badgeId = React.useId()
  const hasBadge = (link.badge ?? 0) > 0
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={link.title}
        className={cn(hasBadge && "pr-8")}
      >
        <Link
          href={link.href}
          aria-current={active ? "page" : undefined}
          aria-describedby={hasBadge ? badgeId : undefined}
          onClick={onNavigate}
        >
          <Glyph icon={link.icon} dot={hasBadge} />
          <span>{link.title}</span>
        </Link>
      </SidebarMenuButton>
      {hasBadge ? (
        <SidebarMenuBadge id={badgeId}>
          <BadgeText count={link.badge!} />
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  )
}

function SubLink({ link, active, Link, onNavigate }: LinkProps) {
  const badgeId = React.useId()
  const hasBadge = (link.badge ?? 0) > 0
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        asChild
        isActive={active}
        className={cn(hasBadge && "pr-8")}
      >
        <Link
          href={link.href}
          aria-current={active ? "page" : undefined}
          aria-describedby={hasBadge ? badgeId : undefined}
          onClick={onNavigate}
        >
          <span>{link.title}</span>
        </Link>
      </SidebarMenuSubButton>
      {hasBadge ? (
        <SidebarMenuBadge id={badgeId} className="top-1/2 -translate-y-1/2">
          <BadgeText count={link.badge!} />
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuSubItem>
  )
}

type ParentProps = {
  parent: NavParent
  id: string
  activeId: string | null
  Link: LinkComponent
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: Navigate
}

function ParentItem({
  parent,
  id,
  activeId: active,
  Link,
  open,
  onOpenChange,
  onNavigate,
}: ParentProps) {
  const { state, isMobile } = useSidebar()
  const badgeId = React.useId()
  const total = badgeTotal(parent)
  const holdsActive = parentIdOf(active) === id

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              isActive={holdsActive}
              tooltip={parent.title}
              aria-describedby={total > 0 ? badgeId : undefined}
            >
              <Glyph icon={parent.icon} dot={total > 0} />
              <span>{parent.title}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            {parent.items.map((link, index) => {
              const current = `${id}-${index}` === active
              return (
                <DropdownMenuItem key={index} asChild>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    className={cn(current && "font-medium")}
                  >
                    <span className="flex-1">{link.title}</span>
                    {(link.badge ?? 0) > 0 ? (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        <BadgeText count={link.badge!} />
                      </span>
                    ) : null}
                    {current ? <Check aria-hidden /> : null}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        {total > 0 ? (
          <span id={badgeId} className="sr-only">
            {total}
          </span>
        ) : null}
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
          <SidebarMenuButton
            isActive={holdsActive}
            tooltip={parent.title}
            aria-describedby={!open && total > 0 ? badgeId : undefined}
          >
            <Glyph icon={parent.icon} dot={total > 0} />
            <span className={cn("truncate", !open && total > 0 && "pr-8")}>
              {parent.title}
            </span>
            <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {!open && total > 0 ? (
          <SidebarMenuBadge id={badgeId} className="right-7">
            <BadgeText count={total} />
          </SidebarMenuBadge>
        ) : null}
        <CollapsibleContent>
          <SidebarMenuSub>
            {parent.items.map((link, index) => (
              <SubLink
                key={index}
                link={link}
                active={`${id}-${index}` === active}
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
  onNavigate: Navigate
}) {
  const content = (
    <>
      <div
        aria-hidden={brand.logo ? undefined : true}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
      >
        {brand.logo ?? Array.from(brand.name.trim())[0]?.toUpperCase()}
      </div>
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
  const active = activeId(nav, currentPath)
  const activeParent = parentIdOf(active)
  const path = normalizePath(currentPath)

  // Accordion: reopen the active parent whenever the path changes, including
  // after a manual close; a top-level active link leaves it alone.
  const [trackedPath, setTrackedPath] = React.useState(path)
  const [openParent, setOpenParent] = React.useState(activeParent)
  if (path !== trackedPath) {
    setTrackedPath(path)
    if (activeParent !== null) setOpenParent(activeParent)
  }

  const onNavigate: Navigate = (e) => {
    if (isMobile && isPlainClick(e)) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <BrandLink brand={brand} Link={Link} onNavigate={onNavigate} />
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="Main" className="flex min-h-0 flex-col gap-2">
          {nav.map((section, s) => (
            <SidebarGroup key={s}>
              {section.label ? (
                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              ) : null}
              <SidebarMenu>
                {section.items.map((item, i) => {
                  const id = `${s}-${i}`
                  return isParent(item) ? (
                    <ParentItem
                      key={id}
                      parent={item}
                      id={id}
                      activeId={active}
                      Link={Link}
                      open={openParent === id}
                      onOpenChange={(open) => setOpenParent(open ? id : null)}
                      onNavigate={onNavigate}
                    />
                  ) : (
                    <TopLink
                      key={id}
                      link={item}
                      active={id === active}
                      Link={Link}
                      onNavigate={onNavigate}
                    />
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </nav>
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
