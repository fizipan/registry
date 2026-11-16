import registry from "../../registry.json"

export const SITE_URL = "https://fizipan-registry.vercel.app"
export const REPO_URL = "https://github.com/fizipan/registry"
export const NAMESPACE = "@fizipan"

export type RegistryItem = {
  name: string
  type: string
  title: string
  description: string
  dependencies?: string[]
  registryDependencies?: string[]
  files?: { path: string; type: string }[]
  cssVars?: { light?: Record<string, string>; dark?: Record<string, string> }
  font?: {
    family: string
    import: string
    variable: string
    weight?: string[]
    dependency?: string
  }
}

export const items = registry.items as RegistryItem[]

export const groups = [
  { label: "Components", type: "registry:ui" },
  { label: "Themes", type: "registry:theme" },
  { label: "Fonts", type: "registry:font" },
] as const

export function getItem(name: string) {
  return items.find((item) => item.name === name) ?? null
}

export function itemsOfType(type: string) {
  return items.filter((item) => item.type === type)
}

/** The short label for an item type, as it appears in the catalog. */
export function typeLabel(type: string) {
  return type.replace("registry:", "")
}

export function installCommands(name: string) {
  return {
    namespace: `npx shadcn@latest add ${NAMESPACE}/${name}`,
    github: `npx shadcn@latest add fizipan/registry/${name}`,
    mcp: `Add ${NAMESPACE}/${name} to this project`,
  }
}

/** Registry dependencies are addresses; show them the way a reader would install them. */
export function registryDependencyName(address: string) {
  const own = address.match(
    /^https:\/\/fizipan-registry\.vercel\.app\/r\/(.+)\.json$/
  )
  return own ? `${NAMESPACE}/${own[1]}` : address
}

export function sourceUrl(path: string) {
  return `${REPO_URL}/blob/main/${path}`
}

export const namespaceConfig = `{
  "registries": {
    "${NAMESPACE}": "${SITE_URL}/r/{name}.json"
  }
}`

export const mcpSetup = "npx shadcn@latest mcp init --client claude"
