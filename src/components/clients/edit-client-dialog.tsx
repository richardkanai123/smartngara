"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Client } from "@convex/schema"
import { useState } from "react"
import EditClientForm from "./edit-client-form"
import { PencilIcon } from "lucide-react"

const EditClientDialog = ({ client }: { client: Client }) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Edit client ${client.name}`}
          />
        }
      >
        <PencilIcon className="size-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit client</DialogTitle>
          <DialogDescription>
            Update details for <span className="font-medium text-foreground">{client.name}</span>
            . Changes apply immediately.
          </DialogDescription>
        </DialogHeader>
        <EditClientForm client={client} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export default EditClientDialog
