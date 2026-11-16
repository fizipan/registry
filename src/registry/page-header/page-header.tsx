import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type PageHeaderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  count?: number
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  count,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate font-heading text-xl font-semibold md:text-2xl">
            {title}
          </h1>
          {count !== undefined ? (
            <Badge variant="secondary" className="tabular-nums">
              {count}
            </Badge>
          ) : null}
        </div>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
