"use client"

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
  name,
  className,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TimePickerProps) {
  const valueId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [focusedHour, setFocusedHour] = React.useState<number>()
  const [focusedMinute, setFocusedMinute] = React.useState<number>()
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

  const contentRef = React.useRef<HTMLDivElement>(null)
  const hourStop =
    current && HOURS.includes(current.hour)
      ? current.hour
      : HOURS.find((hour) => firstMinuteIn(hour) !== undefined)
  const minuteStop = minuteOptions.includes(current?.minute ?? -1)
    ? current?.minute
    : minuteOptions.find((minute) =>
        current
          ? inRange(current.hour, minute)
          : firstHourFor(minute) !== undefined
      )

  const focusOnOpen = (event: Event) => {
    event.preventDefault()
    const content = contentRef.current
    content
      ?.querySelector<HTMLElement>('[role="listbox"] [tabindex="0"]')
      ?.focus({ preventScroll: true })
    content
      ?.querySelectorAll(
        '[aria-selected="true"], [role="listbox"] [tabindex="0"]'
      )
      .forEach((el) => el.scrollIntoView({ block: "center" }))
  }

  const moveAcross = (from: HTMLElement, direction: 1 | -1) => {
    const lists = Array.from(
      contentRef.current?.querySelectorAll<HTMLElement>('[role="listbox"]') ??
        []
    )
    const target =
      lists[
        lists.indexOf(from.closest<HTMLElement>('[role="listbox"]')!) +
          direction
      ]
    target?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
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
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        setFocusedHour(undefined)
        setFocusedMinute(undefined)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-start font-normal", className)}
          {...props}
          aria-describedby={[valueId, ariaDescribedBy]
            .filter(Boolean)
            .join(" ")}
        >
          <ClockIcon data-icon="inline-start" />
          <span id={valueId}>
            {currentValue || (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        align="start"
        onOpenAutoFocus={focusOnOpen}
        className="flex w-auto flex-row gap-2"
        aria-label={`${hourLabel}, ${minuteLabel}`}
      >
        <TimeColumn label={hourLabel}>
          {HOURS.map((hour) => (
            <TimeOption
              key={hour}
              text={String(hour).padStart(2, "0")}
              selected={current?.hour === hour}
              tabbable={hour === (focusedHour ?? hourStop)}
              onFocus={() => setFocusedHour(hour)}
              onMoveAcross={moveAcross}
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
              tabbable={minute === (focusedMinute ?? minuteStop)}
              onFocus={() => setFocusedMinute(minute)}
              onMoveAcross={moveAcross}
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
      {name && <input type="hidden" name={name} value={currentValue} />}
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
  tabbable,
  onFocus,
  onSelect,
  onMoveAcross,
}: {
  text: string
  selected: boolean
  disabled: boolean
  tabbable: boolean
  onFocus: () => void
  onSelect: () => void
  onMoveAcross: (from: HTMLElement, direction: 1 | -1) => void
}) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const el = event.currentTarget
    if (event.key === "Enter" || event.key === " ") {
      if (!disabled) onSelect()
    } else if (event.key === "Home" || event.key === "End") {
      const enabled = Array.from(el.parentElement?.children ?? []).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          child.getAttribute("aria-disabled") !== "true"
      )
      ;(event.key === "Home" ? enabled[0] : enabled.at(-1))?.focus()
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      // Handled only to keep the browser from scrolling the list away.
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const step =
        event.key === "ArrowDown"
          ? "nextElementSibling"
          : "previousElementSibling"
      let next = el[step]
      while (next?.getAttribute("aria-disabled") === "true") next = next[step]
      if (next instanceof HTMLElement) next.focus()
    } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      onMoveAcross(el, event.key === "ArrowRight" ? 1 : -1)
    } else return
    event.preventDefault()
  }

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      tabIndex={tabbable ? 0 : -1}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onClick={disabled ? undefined : onSelect}
      className={cn(
        "cursor-pointer rounded-md px-2 py-1 text-center text-sm tabular-nums outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        selected
          ? "bg-primary text-primary-foreground hover:bg-primary"
          : "focus-visible:bg-muted",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
      )}
    >
      {text}
    </div>
  )
}
