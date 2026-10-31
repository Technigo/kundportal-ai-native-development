import type { ComponentProps, HTMLAttributes } from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// BOLDkit alert-dialog styles on Base UI (ADR-002) instead of Radix.
// Action and Cancel are both Close: Base UI has no separate action part.
// What the button does is the caller's onClick. Both close the confirmation.

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

function AlertDialogOverlay({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
  return (
    <AlertDialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/70 ease-out data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-starting-style:fade-in-0 data-ending-style:fade-out-0",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Popup>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <AlertDialogPrimitive.Popup
          className={cn(
            "relative grid w-full max-w-lg gap-4 border-3 border-foreground bg-background p-6 shadow-[8px_8px_0px_hsl(var(--shadow-color))] duration-200 ease-out data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-starting-style:fade-in-0 data-starting-style:zoom-in-95 data-ending-style:fade-out-0 data-ending-style:zoom-out-95",
            className,
          )}
          {...props}
        />
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("text-lg font-bold tracking-wide uppercase", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Close>) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Close>) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
