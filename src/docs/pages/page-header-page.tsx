import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CodeSample,
  PropTable,
  SheetSection,
  type PropRow,
} from "@/docs/components/datasheet"
import { type RegistryItem } from "@/docs/registry-data"
import { ItemHeader } from "@/docs/pages/item-header"
import { PageHeader } from "@/registry/page-header/page-header"

const props: PropRow[] = [
  {
    name: "title",
    type: "ReactNode",
    note: "The page title, rendered as an h1.",
  },
  {
    name: "description",
    type: "ReactNode",
    fallback: "-",
    note: "One line under the title.",
  },
  {
    name: "count",
    type: "number",
    fallback: "-",
    note: "Shown as a badge beside the title.",
  },
  {
    name: "actions",
    type: "ReactNode",
    fallback: "-",
    note: "Buttons on the right. They wrap below the title on narrow screens.",
  },
  {
    name: "className",
    type: "string",
    fallback: "-",
    note: "Merged onto the root element.",
  },
]

const usage = `import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"

export function Employees() {
  return (
    <PageHeader
      title="Employees"
      description="Everyone on the payroll."
      count={42}
      actions={<Button>Add employee</Button>}
    />
  )
}`

export function PageHeaderPage({ item }: { item: RegistryItem }) {
  return (
    <>
      <ItemHeader item={item} />

      <SheetSection
        title="Typical application"
        description="The title row at the top of a page, with a count and an action."
      >
        <div className="flex flex-col gap-8 rounded-lg border border-border bg-card p-4 sm:p-6">
          <PageHeader
            title="Employees"
            description="Everyone on the payroll."
            count={42}
            actions={
              <Button>
                <PlusIcon data-icon="inline-start" />
                Add employee
              </Button>
            }
          />
          <PageHeader title="Settings" />
        </div>
      </SheetSection>

      <SheetSection
        title="Pin description"
        description="Only title is required. There is no eyebrow label."
      >
        <PropTable label="Props" rows={props} />
      </SheetSection>

      <SheetSection title="Usage">
        <CodeSample code={usage} />
      </SheetSection>
    </>
  )
}
