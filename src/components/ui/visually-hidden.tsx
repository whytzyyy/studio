"use client"

import * as React from "react"
import * as VisuallyHiddenPrimitive from "@radix-ui/react-visually-hidden"

import { cn } from "@/lib/utils"

const VisuallyHidden = React.forwardRef<
  React.ElementRef<"span">,
  React.ComponentProps<"span">
>(({ className, ...props }, ref) => {
  return (
    <VisuallyHiddenPrimitive.Root
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  )
})
VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden }
