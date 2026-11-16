import { ExternalLinkIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { TitleStrip } from "@/docs/components/datasheet"
import {
  OrderingBlock,
  type OrderingRoute,
} from "@/docs/components/ordering-block"
import {
  type RegistryItem,
  installCommands,
  mcpSetup,
  registryDependencyName,
  sourceUrl,
  typeLabel,
} from "@/docs/registry-data"
import { href } from "@/docs/use-route"

const installTarget: Record<string, string> = {
  "registry:ui": "components/ui",
  "registry:theme": "Your global CSS file",
  "registry:font": "Your layout or global CSS",
}

/** The routes for one part, used by every datasheet's ordering block. */
export function itemRoutes(name: string): OrderingRoute[] {
  const commands = installCommands(name)
  return [
    {
      id: "namespace",
      label: "Namespace",
      code: commands.namespace,
      note: (
        <>
          Needs <code className="font-mono">@fizipan</code> in your{" "}
          <code className="font-mono">components.json</code>.{" "}
          <a
            href={href("setup")}
            className="text-foreground underline underline-offset-4"
          >
            Set it up once
          </a>
          .
        </>
      ),
    },
    {
      id: "github",
      label: "GitHub",
      code: commands.github,
      note: "Works in any shadcn project, with no setup.",
    },
    {
      id: "mcp",
      label: "MCP",
      code: commands.mcp,
      kind: "prompt",
      note: (
        <>
          Ask Claude Code after running{" "}
          <code className="font-mono">{mcpSetup}</code> and adding the
          namespace.
        </>
      ),
    },
  ]
}

export function ItemHeader({ item }: { item: RegistryItem }) {
  const file = item.files?.[0]
  const registryDeps =
    item.registryDependencies?.map(registryDependencyName) ?? []

  const npm = item.dependencies ?? []
  const facts = [
    { label: "Type", value: item.type },
    {
      label: "Installs to",
      value:
        item.type === "registry:block"
          ? `components/${item.name}`
          : (installTarget[item.type] ?? "your project"),
      mono: item.type === "registry:ui" || item.type === "registry:block",
    },
    {
      label: "npm",
      value: npm.length ? npm.join(", ") : "None",
      mono: npm.length > 0,
    },
    {
      label: "Pulls in",
      value: registryDeps.length ? registryDeps.join(", ") : "Nothing",
      mono: registryDeps.length > 0,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <TitleStrip
        name={item.name}
        description={item.description}
        facts={facts}
        aside={
          <div className="flex items-center gap-3 pb-1">
            <Badge variant="outline" className="font-mono">
              {typeLabel(item.type)}
            </Badge>
            <a
              href={sourceUrl(file?.path ?? "registry.json")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Source
              <ExternalLinkIcon className="size-3.5" />
            </a>
          </div>
        }
      />
      <OrderingBlock routes={itemRoutes(item.name)} />
    </div>
  )
}
