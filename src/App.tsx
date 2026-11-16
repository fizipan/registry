import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useTheme } from "@/components/theme-provider"
import { TimePicker } from "@/registry/time-picker/time-picker"

const show = (value: string) => value || "none"

export function App() {
  const [empty, setEmpty] = React.useState("")
  const [controlled, setControlled] = React.useState("09:30")
  const [ranged, setRanged] = React.useState("")
  const [stepped, setStepped] = React.useState("")
  const [labelled, setLabelled] = React.useState("")
  const { theme, setTheme } = useTheme()
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleDark = () => setTheme(dark ? "light" : "dark")

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-xl font-medium">Time picker</h1>
          <p className="text-sm text-muted-foreground">
            A 24-hour time picker built on the shadcn Popover and Button. Values
            use the HH:mm format.
          </p>
          <p className="text-sm text-muted-foreground">
            Install with{" "}
            <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-foreground">
              npx shadcn@latest add fizipan/registry/time-picker
            </code>
            . Setup for the <code className="font-mono">@fizipan</code>{" "}
            namespace is in the{" "}
            <a
              href="https://github.com/fizipan/registry#readme"
              className="text-foreground underline underline-offset-4"
            >
              README
            </a>
            .
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={toggleDark}>
          {dark ? <SunIcon /> : <MoonIcon />}
          <span className="sr-only">Toggle dark mode</span>
        </Button>
      </header>

      <FieldGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="tp-empty">Empty, uncontrolled</FieldLabel>
          <TimePicker id="tp-empty" onValueChange={setEmpty} />
          <FieldDescription>Value: {show(empty)}</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="tp-controlled">
            Controlled, starts at 09:30
          </FieldLabel>
          <TimePicker
            id="tp-controlled"
            value={controlled}
            onValueChange={setControlled}
          />
          <FieldDescription>Value: {show(controlled)}</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="tp-range">Range 08:00 to 17:00</FieldLabel>
          <TimePicker
            id="tp-range"
            min="08:00"
            max="17:00"
            onValueChange={setRanged}
          />
          <FieldDescription>
            Times outside the range are disabled. Value: {show(ranged)}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="tp-step">15-minute step</FieldLabel>
          <TimePicker id="tp-step" minuteStep={15} onValueChange={setStepped} />
          <FieldDescription>Value: {show(stepped)}</FieldDescription>
        </Field>

        <Field data-disabled>
          <FieldLabel htmlFor="tp-disabled">Disabled</FieldLabel>
          <TimePicker id="tp-disabled" defaultValue="12:00" disabled />
          <FieldDescription>Value: 12:00</FieldDescription>
        </Field>

        <Field data-invalid>
          <FieldLabel htmlFor="tp-invalid">Invalid</FieldLabel>
          <TimePicker id="tp-invalid" aria-invalid />
          <FieldDescription>Pick a time to continue.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="tp-labels">Custom column labels</FieldLabel>
          <TimePicker
            id="tp-labels"
            hourLabel="Jam"
            minuteLabel="Menit"
            onValueChange={setLabelled}
          />
          <FieldDescription>Value: {show(labelled)}</FieldDescription>
        </Field>
      </FieldGroup>
    </main>
  )
}

export default App
