"use client"

import * as React from "react"
import { Calendar as ReactCalendar } from "react-calendar"
import "react-calendar/dist/Calendar.css"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof ReactCalendar>

function Calendar({
  className,
  ...props
}: CalendarProps) {
  return (
    <ReactCalendar
      locale="fr-FR"
      className={cn("p-3", className)}
      tileClassName={({ date, view }) =>
        cn(
          "rounded-lg hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          {
            "bg-primary text-primary-foreground": view === "month" && date.getDay() === new Date().getDay(),
          }
        )
      }
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
