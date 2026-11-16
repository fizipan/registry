# fizipan/registry

A small shadcn registry of components I reuse. Items install with the shadcn CLI, so the source lands in your repo and you can edit it.

Items are written for Radix-based shadcn projects (the `radix-nova` style, `lucide-react` icons).

Demo: https://fizipan-registry.vercel.app

## Install

Any item installs straight from GitHub, with no setup:

```bash
npx shadcn@latest add fizipan/registry/time-picker
```

### The `@fizipan` namespace

Add the registry to `components.json` once:

```json
{
  "registries": {
    "@fizipan": "https://fizipan-registry.vercel.app/r/{name}.json"
  }
}
```

Then install by name, or browse what's there:

```bash
npx shadcn@latest add @fizipan/time-picker
npx shadcn@latest search @fizipan
```

### Use it from Claude Code (MCP)

The shadcn MCP server lets an AI assistant search and install items from the registries in your `components.json`. Set it up in your project with:

```bash
npx shadcn@latest mcp init --client claude
```

Restart Claude Code, then ask for something like "add the time picker from @fizipan".

## Items

### time-picker

Hour and minute columns in a popover, with min/max limits, minute steps and keyboard navigation.

```bash
npx shadcn@latest add fizipan/registry/time-picker
```

This copies `time-picker.tsx` into `components/ui`. It also installs `button` and `popover`, which it depends on, if you don't have them.

The value is a 24-hour `"HH:mm"` string, and `""` means empty.

| Prop            | Type                      | Default         | Description                           |
| --------------- | ------------------------- | --------------- | ------------------------------------- |
| `value`         | `string`                  | -               | Controlled value, `"HH:mm"`.          |
| `defaultValue`  | `string`                  | `""`            | Initial value when uncontrolled.      |
| `onValueChange` | `(value: string) => void` | -               | Called when a time is picked.         |
| `minuteStep`    | `number`                  | `1`             | Gap between minute options.           |
| `min`           | `string`                  | -               | Earliest selectable time, `"HH:mm"`.  |
| `max`           | `string`                  | -               | Latest selectable time, `"HH:mm"`.    |
| `placeholder`   | `string`                  | `"Select time"` | Text shown when empty.                |
| `hourLabel`     | `string`                  | `"Hour"`        | Accessible name of the hour column.   |
| `minuteLabel`   | `string`                  | `"Minute"`      | Accessible name of the minute column. |

`name` submits the value with a form, through a hidden input. Other props go to the trigger button, so `id`, `disabled` and `aria-invalid` all work.

The example below uses `Field`, which you can install with `npx shadcn@latest add field`.

```tsx
import { useState } from "react"

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
}
```

### theme-brick

A warm red-orange theme: brick-red primary, warm "ink" neutrals, a dark sidebar frame in both modes, Inter for text and Barlow Condensed for display headings.

```bash
npx shadcn@latest add @fizipan/theme-brick
# or, without the namespace
npx shadcn@latest add fizipan/registry/theme-brick
```

It sets every shadcn color token for light and dark, the radius (`0.625rem`), the sidebar and the chart colors. It also installs the two font items below. Installing it replaces your current theme variables.

On top of the standard tokens it adds Tailwind colors you can use directly:

| Token                                                             | Use                                                 |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| `brand-50` … `brand-950`, `ink-50` … `ink-950`                    | The full brand and neutral scales.                  |
| `success`, `warning`, `info` and their `-soft` versions           | Status text and soft badge backgrounds.             |
| `brand-soft`, `brand-soft-foreground`                             | Soft brand highlights, selected states.             |
| `surface-brand` (+ `-foreground`, `-muted`, `-accent`, `-border`) | A brand panel, like a dashboard hero or login side. |
| `destructive-solid`                                               | A solid destructive fill for white text.            |
| `sidebar-muted`                                                   | Inactive sidebar items.                             |

```tsx
<Badge className="bg-success-soft text-success">Approved</Badge>
<h1 className="font-display text-4xl font-bold uppercase">Good morning</h1>
```

### font-inter, font-barlow-condensed

Font items the theme depends on. `font-inter` sets `--font-sans`. `font-barlow-condensed` adds weights 500, 600 and 700 as `--font-display`, for the `font-display` utility. Next.js projects load them through `next/font`, other projects through Fontsource.

## Development

```bash
pnpm install
pnpm dev      # demo page
pnpm test     # unit tests
```
