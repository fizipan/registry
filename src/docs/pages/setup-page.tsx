import { CodeSample, SheetSection } from "@/docs/components/datasheet"
import {
  NAMESPACE,
  installCommands,
  mcpSetup,
  namespaceConfig,
} from "@/docs/registry-data"

export function SetupPage() {
  return (
    <>
      <header className="flex flex-col gap-3 border-b-2 border-foreground pb-4">
        <h1 className="font-display text-5xl leading-[0.9] font-bold tracking-wide uppercase sm:text-6xl">
          Install routes
        </h1>
        <p className="max-w-[62ch] text-base text-pretty text-muted-foreground">
          Three ways to get a part into your project. All of them copy the
          source into your repo, so you can edit it afterwards.
        </p>
      </header>

      <SheetSection
        title="Requirements"
        description="A project set up with shadcn/ui on the Radix base (the radix-nova style) and lucide icons. Themes and fonts expect Tailwind v4."
      >
        <CodeSample
          code="npx shadcn@latest init --base radix --preset nova"
          label="Copy init command"
        />
      </SheetSection>

      <SheetSection
        title="GitHub address"
        description="No setup. The CLI reads the public repo directly."
      >
        <CodeSample
          code={installCommands("time-picker").github}
          label="Copy command"
        />
      </SheetSection>

      <SheetSection
        title={`The ${NAMESPACE} namespace`}
        description="Add the registry to components.json once. Then you can install by name and browse what's there."
      >
        <CodeSample code={namespaceConfig} label="Copy config" />
        <CodeSample
          code={`${installCommands("time-picker").namespace}\nnpx shadcn@latest search ${NAMESPACE}`}
          label="Copy commands"
        />
      </SheetSection>

      <SheetSection
        title="Claude Code (MCP)"
        description="The shadcn MCP server lets Claude search the registries in your components.json and install from them. Set up the namespace first, then run this in your project and restart Claude Code."
      >
        <CodeSample code={mcpSetup} label="Copy command" />
        <p className="max-w-[65ch] text-sm text-pretty text-muted-foreground">
          Then ask for a part by name, for example: “Add the time picker from
          @fizipan to the booking form.”
        </p>
      </SheetSection>
    </>
  )
}
