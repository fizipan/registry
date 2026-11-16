import * as React from "react"
import { ClockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type Time = { hour: number; minute: number }

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export function parseTime(value: string): Time | null {
  const match = TIME_PATTERN.exec(value)
  if (!match) return null
  return { hour: Number(match[1]), minute: Number(match[2]) }
}

export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function getMinuteOptions(step: number): number[] {
  const safeStep = Number.isInteger(step) && step > 0 ? step : 1
  const options: number[] = []
  for (let minute = 0; minute < 60; minute += safeStep) options.push(minute)
  return options
}

const toMinutes = (time: Time) => time.hour * 60 + time.minute

export function isTimeInRange(time: Time, min?: string, max?: string): boolean {
  const lower = min ? parseTime(min) : null
  const upper = max ? parseTime(max) : null
  const minutes = toMinutes(time)
  if (lower && minutes < toMinutes(lower)) return false
  if (upper && minutes > toMinutes(upper)) return false
  return true
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

type TimePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  minuteStep?: number
  min?: string
  max?: string
  placeholder?: string
  hourLabel?: string
  minuteLabel?: string
}

export function TimePicker({
  value,
  defaultValue = "",
  onValueChange,
  minuteStep = 1,
  min,
  max,
  placeholder = "Select time",
  hourLabel = "Hour",
  minuteLabel = "Minute",
  ...props
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = value ?? internalValue
  const current = parseTime(currentValue)
  const minuteOptions = getMinuteOptions(minuteStep)

  const inRange = (hour: number, minute: number) =>
    isTimeInRange({ hour, minute }, min, max)
  const firstMinuteIn = (hour: number) =>
    minuteOptions.find((minute) => inRange(hour, minute))
  const firstHourFor = (minute: number) =>
    HOURS.find((hour) => inRange(hour, minute))

  const commit = (hour: number, minute: number) => {
    const next = formatTime(hour, minute)
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  const pickHour = (hour: number) => {
    const minute =
      current &&
      minuteOptions.includes(current.minute) &&
      inRange(hour, current.minute)
        ? current.minute
        : firstMinuteIn(hour)
    if (minute === undefined) return
    commit(hour, minute)
  }

  const pickMinute = (minute: number) => {
    const hour = current?.hour ?? firstHourFor(minute)
    if (hour === undefined || !inRange(hour, minute)) return
    commit(hour, minute)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" {...props}>
          <ClockIcon data-icon="inline-start" />
          {currentValue || (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-auto flex-row gap-2"
        aria-label={`${hourLabel} and ${minuteLabel}`}
      >
        <TimeColumn label={hourLabel}>
          {HOURS.map((hour) => (
            <TimeOption
              key={hour}
              text={String(hour).padStart(2, "0")}
              selected={current?.hour === hour}
              disabled={firstMinuteIn(hour) === undefined}
              onSelect={() => pickHour(hour)}
            />
          ))}
        </TimeColumn>
        <TimeColumn label={minuteLabel}>
          {minuteOptions.map((minute) => (
            <TimeOption
              key={minute}
              text={String(minute).padStart(2, "0")}
              selected={current?.minute === minute}
              disabled={
                current
                  ? !inRange(current.hour, minute)
                  : firstHourFor(minute) === undefined
              }
              onSelect={() => pickMinute(minute)}
            />
          ))}
        </TimeColumn>
      </PopoverContent>
    </Popover>
  )
}

function TimeColumn({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="px-2 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div
        role="listbox"
        aria-label={label}
        className="flex max-h-56 w-16 flex-col gap-0.5 overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}

function TimeOption({
  text,
  selected,
  disabled,
  onSelect,
}: {
  text: string
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onSelect}
      className={cn(
        "cursor-pointer rounded-md px-2 py-1 text-center text-sm tabular-nums hover:bg-muted",
        selected && "bg-primary text-primary-foreground hover:bg-primary",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
      )}
    >
      {text}
    </div>
  )
}
