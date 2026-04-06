"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Client } from "@convex/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Spinner } from "../ui/spinner"
import { cn, validateKenyanPhoneNumber } from "@/lib/utils"
import { useMutation } from "convex/react"
import { api } from "@/lib/convex-api"
import { toast } from "sonner"

const editClientSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().refine(validateKenyanPhoneNumber, {
    message: "Please enter a valid Kenyan phone number",
  }),
  address: z.string().min(3, "Address must be at least 3 characters"),
})

type EditClientValues = z.infer<typeof editClientSchema>

const EditClientForm = ({
  client,
  onSuccess,
}: {
  client: Client
  onSuccess?: () => void
}) => {
  const updateClient = useMutation(api.clients.updateClient)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditClientValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      address: client.address || "",
    },
  })

  const onSubmit = async (data: EditClientValues) => {
    try {
      const result = await updateClient({
        id: client._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      })
      if (result.success) {
        toast.success(result.message)
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update client"
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-phone">Phone</Label>
        <Input
          id="edit-phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-address">Address</Label>
        <Input
          id="edit-address"
          aria-invalid={!!errors.address}
          {...register("address")}
        />
        {errors.address && (
          <p className="text-xs text-destructive">{errors.address.message}</p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn("gap-2", isSubmitting && "pointer-events-none")}
        >
          {isSubmitting ? (
            <>
              <Spinner className="size-4 shrink-0" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  )
}

export default EditClientForm
