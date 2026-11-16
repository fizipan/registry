import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CopyButton } from "@/docs/components/copy-button"
import { OrderingBlock } from "@/docs/components/ordering-block"
import { SheetSection } from "@/docs/components/datasheet"
import {
  REPO_URL,
  installCommands,
  items,
  mcpSetup,
  namespaceConfig,
  typeLabel,
} from "@/docs/registry-data"
import { href } from "@/docs/use-route"

const copyLabel = (name: string) => `Copy GitHub install command for ${name}`

export function CatalogPage() {
  return (
    <>
      <header className="flex flex-col gap-3 border-b-2 border-foreground pb-4">
        <h1 className="font-display text-5xl leading-[0.9] font-bold tracking-wide uppercase sm:text-7xl">
          fizipan<span className="text-primary">/</span>registry
        </h1>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="max-w-[75ch] text-base text-pretty text-muted-foreground">
            Components, themes and fonts I kept rewriting for admin panels and
            CMS screens.
          </p>
          <p className="font-mono text-sm text-muted-foreground tabular-nums">
            {items.length} parts ·{" "}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              GitHub
            </a>
          </p>
        </div>
      </header>

      <OrderingBlock
        title="Set up an install route"
        routes={[
          {
            id: "namespace",
            label: "Namespace",
            code: namespaceConfig,
            kind: "config",
            note: (
              <>
                Add this to <code className="font-mono">components.json</code>{" "}
                once, then install parts by name, like{" "}
                <code className="font-mono">@fizipan/time-picker</code>.
              </>
            ),
          },
          {
            id: "github",
            label: "GitHub",
            code: installCommands("<part>").github,
            note: "No setup. Replace <part> with any name from the table below.",
          },
          {
            id: "mcp",
            label: "MCP",
            code: mcpSetup,
            note: "Lets Claude Code search and install parts from the namespace. Add the namespace first.",
          },
        ]}
      />

      <SheetSection
        title="Parts"
        description="Every part installs into a Radix-based shadcn project (radix-nova style, lucide icons). Copy buttons use the GitHub address, which needs no setup."
      >
        <div className="hidden sm:block">
          <Table aria-label="Parts">
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Part</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead>Function</TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Copy install command</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="align-top">
                    <a
                      href={href(item.name)}
                      className="font-mono text-[0.8125rem] font-medium underline-offset-4 hover:text-primary hover:underline"
                    >
                      {item.name}
                    </a>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant="secondary" className="font-mono">
                      {typeLabel(item.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top text-sm whitespace-normal text-muted-foreground">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right align-top">
                    <CopyButton
                      value={installCommands(item.name).github}
                      label={copyLabel(item.name)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ul
          aria-label="Parts"
          className="flex flex-col divide-y divide-border border-y border-border sm:hidden"
        >
          {items.map((item) => (
            <li key={item.name} className="flex items-start gap-3 py-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={href(item.name)}
                    className="font-mono text-[0.8125rem] font-medium underline-offset-4 hover:text-primary hover:underline"
                  >
                    {item.name}
                  </a>
                  <Badge variant="secondary" className="font-mono">
                    {typeLabel(item.type)}
                  </Badge>
                </div>
                <p className="text-sm text-pretty text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <CopyButton
                value={installCommands(item.name).github}
                label={copyLabel(item.name)}
              />
            </li>
          ))}
        </ul>
      </SheetSection>
    </>
  )
}
