import * as React from "react"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TimePicker } from "@/registry/time-picker/time-picker"
import { CodeSample, SheetSection } from "@/docs/components/datasheet"
import { type RegistryItem } from "@/docs/registry-data"
import { ItemHeader } from "@/docs/pages/item-header"

const props = [
  {
    name: "value",
    type: "string",
    fallback: "-",
    note: 'Controlled value, "HH:mm".',
  },
  {
    name: "defaultValue",
    type: "string",
    fallback: '""',
    note: "Initial value when uncontrolled.",
  },
  {
    name: "onValueChange",
    type: "(value: string) => void",
    fallback: "-",
    note: "Called when a time is picked.",
  },
  {
    name: "minuteStep",
    type: "number",
    fallback: "1",
    note: "Gap between minute options. Invalid steps fall back to 1.",
  },
  {
    name: "min",
    type: "string",
    fallback: "-",
    note: 'Earliest selectable time, "HH:mm". Earlier options are disabled.',
  },
  {
    name: "max",
    type: "string",
    fallback: "-",
    note: 'Latest selectable time, "HH:mm".',
  },
  {
    name: "placeholder",
    type: "string",
    fallback: '"Select time"',
    note: "Shown on the trigger when empty.",
  },
  {
    name: "hourLabel",
    type: "string",
    fallback: '"Hour"',
    note: "Accessible name and heading of the hour column.",
  },
  {
    name: "minuteLabel",
    type: "string",
    fallback: '"Minute"',
    note: "Accessible name and heading of the minute column.",
  },
  {
    name: "name",
    type: "string",
    fallback: "-",
    note: "Submits the value with a form through a hidden input.",
  },
]

const keys = [
  { key: "↑ ↓", action: "Move within a column, skipping disabled times" },
  { key: "← →", action: "Switch between the hour and minute columns" },
  { key: "Home / End", action: "Jump to the first or last available time" },
  {
    key: "Enter / Space",
    action: "Pick the focused time. Picking a minute closes the popover",
  },
  { key: "Esc", action: "Close without changing the value" },
]

const usage = `import { useState } from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import { TimePicker } from "@/components/ui/time-picker"

export function StartTime() {
  const [start, setStart] = useState("09:00")

  return (
    <Field>
      <FieldLabel htmlFor="start">Start time</FieldLabel>
      <TimePicker
        id="start"
        value={start}
        onValueChange={setStart}
        minuteStep={15}
        min="08:00"
        max="18:00"
      />
    </Field>
  )
}`

const show = (value: string) => value || "none"

function Characteristic({
  id,
  label,
  note,
  children,
}: {
  id: string
  label: string
  note: React.ReactNode
  children: (id: string) => React.ReactNode
}) {
  return (
    <Field className="bg-card p-4">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children(id)}
      <FieldDescription>{note}</FieldDescription>
    </Field>
  )
}

export function TimePickerPage({ item }: { item: RegistryItem }) {
  const [shift, setShift] = React.useState("09:30")
  const [empty, setEmpty] = React.useState("")
  const [ranged, setRanged] = React.useState("")
  const [stepped, setStepped] = React.useState("")

  return (
    <>
      <ItemHeader item={item} />

      <SheetSection
        title="Typical application"
        description="A controlled picker inside a Field. Open it with the mouse or with Enter, then use the arrow keys."
      >
        <FieldGroup className="max-w-sm">
          <Field>
            <FieldLabel htmlFor="tp-shift">Shift starts</FieldLabel>
            <TimePicker
              id="tp-shift"
              value={shift}
              onValueChange={setShift}
              minuteStep={15}
            />
            <FieldDescription>
              Value:{" "}
              <span className="font-mono tabular-nums">{show(shift)}</span>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </SheetSection>

      <SheetSection
        title="Characteristics"
        description="Every state the part can be in. Each cell is the live component."
      >
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          <Characteristic
            id="tp-empty"
            label="Empty"
            note={
              <>
                Value: <span className="font-mono">{show(empty)}</span>
              </>
            }
          >
            {(id) => <TimePicker id={id} onValueChange={setEmpty} />}
          </Characteristic>
          <Characteristic
            id="tp-range"
            label="Range 08:00 to 17:00"
            note={
              <>
                Outside times are disabled. Value:{" "}
                <span className="font-mono">{show(ranged)}</span>
              </>
            }
          >
            {(id) => (
              <TimePicker
                id={id}
                min="08:00"
                max="17:00"
                onValueChange={setRanged}
              />
            )}
          </Characteristic>
          <Characteristic
            id="tp-step"
            label="15-minute step"
            note={
              <>
                Value: <span className="font-mono">{show(stepped)}</span>
              </>
            }
          >
            {(id) => (
              <TimePicker id={id} minuteStep={15} onValueChange={setStepped} />
            )}
          </Characteristic>
          <Characteristic
            id="tp-disabled"
            label="Disabled"
            note="The trigger can't be opened."
          >
            {(id) => <TimePicker id={id} defaultValue="12:00" disabled />}
          </Characteristic>
          <Field data-invalid className="bg-card p-4">
            <FieldLabel htmlFor="tp-invalid">Invalid</FieldLabel>
            <TimePicker id="tp-invalid" aria-invalid />
            <FieldDescription>
              Set aria-invalid on the picker and data-invalid on the Field.
            </FieldDescription>
          </Field>
          <Characteristic
            id="tp-labels"
            label="Custom column labels"
            note='hourLabel="Jam", minuteLabel="Menit"'
          >
            {(id) => <TimePicker id={id} hourLabel="Jam" minuteLabel="Menit" />}
          </Characteristic>
        </div>
      </SheetSection>

      <SheetSection
        title="Pin description"
        description='The value is a 24-hour "HH:mm" string, and "" means empty. Other props go to the trigger button, so id, disabled and aria-invalid work as on a Button.'
      >
        <div className="hidden sm:block">
          <Table aria-label="Props">
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.map((prop) => (
                <TableRow key={prop.name}>
                  <TableCell className="font-mono text-[0.8125rem] font-medium">
                    {prop.name}
                  </TableCell>
                  <TableCell className="font-mono text-[0.8125rem] text-muted-foreground">
                    {prop.type}
                  </TableCell>
                  <TableCell className="font-mono text-[0.8125rem] text-muted-foreground">
                    {prop.fallback}
                  </TableCell>
                  <TableCell className="min-w-56 text-sm whitespace-normal text-muted-foreground">
                    {prop.note}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <dl
          aria-label="Props"
          className="flex flex-col divide-y divide-border border-y border-border sm:hidden"
        >
          {props.map((prop) => (
            <div key={prop.name} className="flex flex-col gap-1 py-3">
              <dt className="font-mono text-[0.8125rem] font-medium">
                {prop.name}
              </dt>
              <dd className="font-mono text-xs text-muted-foreground">
                {prop.type} · default {prop.fallback}
              </dd>
              <dd className="text-sm text-pretty text-muted-foreground">
                {prop.note}
              </dd>
            </div>
          ))}
        </dl>
      </SheetSection>

      <SheetSection
        title="Keyboard"
        description="Columns are listboxes with a roving tab stop; the trigger announces the selected time."
      >
        <Table aria-label="Keyboard">
          <TableBody>
            {keys.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="w-40 font-mono text-[0.8125rem] font-medium">
                  {row.key}
                </TableCell>
                <TableCell className="text-sm whitespace-normal text-muted-foreground">
                  {row.action}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SheetSection>

      <SheetSection
        title="Usage"
        description={
          <>
            The example uses Field, which installs with{" "}
            <code className="font-mono">npx shadcn@latest add field</code>.
          </>
        }
      >
        <CodeSample code={usage} />
      </SheetSection>
    </>
  )
}
