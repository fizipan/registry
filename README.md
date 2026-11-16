# fizipan/registry

A small shadcn registry of components I reuse. Items install with the shadcn CLI, so the source lands in your repo and you can edit it.

Items are written for Radix-based shadcn projects (the `radix-nova` style, `lucide-react` icons).

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

## Development

```bash
pnpm install
pnpm dev      # demo page
pnpm test     # unit tests
```
