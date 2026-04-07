"use client"

import { useMemo } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/convex-api"
import { toast } from "sonner"
import type { Id } from "@convex/_generated/dataModel"
import type { Client, Rack } from "@convex/schema"
import {
  createOrderFormSchema,
  type OrderFormValues,
} from "@/lib/order-form-schema"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { PlusIcon, TrashIcon } from "lucide-react"

type AddOrderFormProps = {
  clients: Client[]
  racks: Rack[]
}

const AddOrderForm = ({ clients, racks }: AddOrderFormProps) => {
  const router = useRouter()
  const createOrder = useMutation(api.orders.createOrder)

  const clientIds = useMemo(() => clients.map((c) => c._id), [clients])
  const rackIds = useMemo(() => racks.map((r) => r._id), [racks])

  const clientComboboxItems = useMemo(
    () =>
      clients.map((c) => ({
        value: c._id,
        label: c.name,
        description: c.email,
      })),
    [clients],
  )

  const rackComboboxItems = useMemo(
    () => [
      {
        value: "",
        label: "No rack",
        description: "Order not assigned to a rack yet",
      },
      ...racks.map((r) => ({
        value: r._id,
        label: r.label,
        description: `${r.location} · ${r.size}`,
      })),
    ],
    [racks],
  )

  const schema = useMemo(
    () => createOrderFormSchema(clientIds, rackIds),
    [clientIds, rackIds],
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: "",
      rackId: "",
      items: [{ name: "", quantity: 1 }],
      isDeliveryRequired: false,
      instructions: "",
      ironing: false,
      ironingFee: 0,
      orderFee: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const ironing = watch("ironing")

  const onSubmit = async (data: OrderFormValues) => {
    try {
      const res = await createOrder({
        clientId: data.clientId as Id<"clients">,
        rackId: data.rackId as Id<"racks"> || undefined,
        status: "pending",
        items: data.items.map((i) => ({
          name: i.name.trim(),
          quantity: i.quantity,
        })),
        isDeliveryRequired: data.isDeliveryRequired,
        instructions: data.instructions.trim(),
        ironing: data.ironing,
        ironingFee: data.ironing ? data.ironingFee : 0,
        orderFee: data.orderFee,
      })
      if(!res.success) throw new Error('Failed to create order, Try again later.')
    toast.success("Order created, redirecting to orders page...")
      reset();
      router.push(`/admin/orders/${res.order}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message + ". Try again later." : "Failed to create order, Try again later."
      toast.error(message)
    }
  }

  if (clients.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No clients yet. Add a client before creating an order.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-lg flex-col gap-4"
    >
      <Card size="sm">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle>Client</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <Combobox
                items={clientComboboxItems}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Choose client"
                searchPlaceholder="Search name or email…"
                emptyMessage="No client matches."
                aria-invalid={!!errors.clientId}
              />
            )}
          />
          {errors.clientId && (
            <p className="mt-1 text-xs text-destructive">
              {errors.clientId.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle>Rack (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          <p className="text-[0.65rem] text-muted-foreground">
            Optional: assign at most one rack per order.
          </p>
          <Controller
            name="rackId"
            control={control}
            render={({ field }) => (
              <Combobox
                items={rackComboboxItems}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Choose rack"
                searchPlaceholder="Search label or location…"
                emptyMessage="No rack matches."
                aria-invalid={!!errors.rackId}
              />
            )}
          />
          {errors.rackId && (
            <p className="text-xs text-destructive">{errors.rackId.message}</p>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex gap-2 items-end justify-between" 
            >
              <div className="min-w-0 space-y-1 w-full">
                <Label htmlFor={`item-name-${index}`}>Description</Label>
                <Input
                  id={`item-name-${index}`}
                  placeholder="e.g. Shirts"
                  aria-invalid={!!errors.items?.[index]?.name}
                  {...register(`items.${index}.name`)}
                />
                {errors.items?.[index]?.name && (
                  <p className="text-xs text-destructive">
                    {errors.items[index]?.name?.message}
                  </p>
                )}
              </div>
              <div className="w-full space-y-1 sm:w-24">
                <Label htmlFor={`item-qty-${index}`}>Qty</Label>
                <Input
                  id={`item-qty-${index}`}
                  type="number"
                  min={1}
                  step={1}
                  aria-invalid={!!errors.items?.[index]?.quantity}
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                />
                {errors.items?.[index]?.quantity && (
                  <p className="text-xs text-destructive">
                    {errors.items[index]?.quantity?.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
                aria-label="Remove Item"
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => append({ name: "", quantity: 1 })}
          >
            <PlusIcon className="size-3.5" />
            Add Item
          </Button>
          {errors.items && typeof errors.items.message === "string" && (
            <p className="text-xs text-destructive">{errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle>Fees & options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-3">
              <Controller
                name="ironing"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => {
                      const on = v === true
                      field.onChange(on)
                      if (!on) {
                        setValue("ironingFee", 0, { shouldValidate: true })
                      } else {
                        void trigger("ironingFee")
                      }
                    }}
                  />
                )}
              />
              <span className="text-xs">Ironing service</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <Controller
                name="isDeliveryRequired"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                  />
                )}
              />
              <span className="text-xs">Delivery required</span>
            </label>
          </div>

          <Separator />

          <div className="space-y-1 sm:max-w-xs">
            <Label htmlFor="orderFee">Order fee</Label>
            <Input
              id="orderFee"
              type="number"
              min={0}
              step="0.01"
              aria-invalid={!!errors.orderFee}
              {...register("orderFee", { valueAsNumber: true })}
            />
            {errors.orderFee && (
              <p className="text-xs text-destructive">{errors.orderFee.message}</p>
            )}
          </div>

          {ironing ? (
            <div className="space-y-1 sm:max-w-xs">
              <Label htmlFor="ironingFee">Ironing fee</Label>
              <Input
                id="ironingFee"
                type="number"
                min={0.01}
                step="0.01"
                placeholder="e.g. 50"
                aria-invalid={!!errors.ironingFee}
                {...register("ironingFee", { valueAsNumber: true })}
              />
              <p className="text-[0.65rem] text-muted-foreground">
                Required when ironing is on (must be greater than 0).
              </p>
              {errors.ironingFee && (
                <p className="text-xs text-destructive">
                  {errors.ironingFee.message}
                </p>
              )}
            </div>
          ) : null}

          <div className="space-y-1">
            <Label htmlFor="instructions">Instructions</Label>
            <textarea
              id="instructions"
              rows={3}
              placeholder="Pickup notes, stains, preferences…"
              className={cn(
                "min-h-[4.5rem] w-full resize-y border border-input bg-transparent px-2.5 py-2 text-xs outline-none",
                "placeholder:text-muted-foreground",
                "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-50",
                errors.instructions && "border-destructive"
              )}
              aria-invalid={!!errors.instructions}
              {...register("instructions")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 border-t border-border pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[8rem] gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner className="size-4 shrink-0" />
              Creating…
            </>
          ) : (
            "Create order"
          )}
        </Button>
      </div>
    </form>
  )
}

export default AddOrderForm
