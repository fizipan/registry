import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { SheetSection } from "@/docs/components/datasheet"
import { type RegistryItem } from "@/docs/registry-data"
import { ItemHeader } from "@/docs/pages/item-header"

// The docs site loads both faces, so the specimen renders in the real font.
const fontClass: Record<string, string> = {
  "--font-sans": "font-sans",
  "--font-display": "font-display",
}

const weightName: Record<string, string> = {
  "400": "Regular",
  "500": "Medium",
  "600": "Semibold",
  "700": "Bold",
}

export function FontPage({ item }: { item: RegistryItem }) {
  const font = item.font
  if (!font) return null

  const family = fontClass[font.variable] ?? "font-sans"
  const display = font.variable === "--font-display"
  const weights = font.weight ?? ["400", "500", "600", "700"]
  const familyName = font.family.split(",")[0].replace(/'/g, "")

  return (
    <>
      <ItemHeader item={item} />

      <SheetSection
        title="Typical application"
        description={
          display
            ? "Set headings with the font-display utility."
            : "Set as the sans font for the whole interface."
        }
      >
        <div
          className={cn(
            "flex flex-col gap-4 rounded-lg border border-border bg-card p-6",
            family
          )}
        >
          {display ? (
            <>
              <p className="text-6xl leading-[0.9] font-bold tracking-wide uppercase">
                Leave requests
              </p>
              <p className="text-3xl font-semibold tracking-wide uppercase">
                Shift schedule · Week 12
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-semibold tracking-tight">
                Approve 3 leave requests
              </p>
              <p className="max-w-[60ch] text-base text-muted-foreground">
                Body text, labels and tables stay in one family. Tabular figures
                keep columns aligned:
                <span className="ml-1 tabular-nums">09:30 · 12:45 · 17:00</span>
                .
              </p>
            </>
          )}
        </div>
      </SheetSection>

      <SheetSection
        title="Weights"
        description={
          font.weight
            ? "The weights this part installs."
            : "A variable font: every weight from 100 to 900."
        }
      >
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {weights.map((weight) => (
            <li
              key={weight}
              className="flex items-baseline justify-between gap-4 px-4 py-3"
            >
              <span
                className={cn(
                  "text-2xl",
                  family,
                  display && "tracking-wide uppercase"
                )}
                style={{ fontWeight: Number(weight) }}
              >
                {familyName}
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {weight} {weightName[weight] ?? ""}
              </span>
            </li>
          ))}
        </ul>
      </SheetSection>

      <SheetSection
        title="Pin description"
        description="How the part wires the font into your project."
      >
        <Table aria-label="Font details">
          <TableBody>
            <TableRow>
              <TableCell className="w-48 text-sm text-muted-foreground">
                CSS variable
              </TableCell>
              <TableCell className="font-mono text-[0.8125rem]">
                {font.variable}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-sm text-muted-foreground">
                Family
              </TableCell>
              <TableCell className="font-mono text-[0.8125rem]">
                {font.family}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-sm text-muted-foreground">
                Next.js
              </TableCell>
              <TableCell className="font-mono text-[0.8125rem]">
                next/font/google → {font.import}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-sm text-muted-foreground">
                Other frameworks
              </TableCell>
              <TableCell className="font-mono text-[0.8125rem]">
                {font.dependency ?? "-"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </SheetSection>
    </>
  )
}
