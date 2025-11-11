"use client"

import * as React from "react"

import {
  Dialog as AlertDialog,
  DialogTrigger as AlertDialogTrigger,
  DialogContent as AlertDialogContent,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function AlertDialogCancel({
  asChild = true,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { asChild?: boolean }) {
  return (
    <DialogClose asChild={asChild}>
      <Button variant="outline" {...props}>
        {children ?? "Cancel"}
      </Button>
    </DialogClose>
  )
}

function AlertDialogAction({
  asChild = true,
  children,
  variant = "destructive",
  ...props
}: React.ComponentProps<typeof Button> & { asChild?: boolean }) {
  return (
    <DialogClose asChild={asChild}>
      <Button variant={variant as any} {...props}>
        {children ?? "Confirm"}
      </Button>
    </DialogClose>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
}
