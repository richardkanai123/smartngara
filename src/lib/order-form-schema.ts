import { z } from "zod"

/** Matches `createOrder` `status` union in `convex/orders.ts` (for API / future use). */
export const orderStatusValues = [
  "pending",
  "in-transit",
  "ready-for-pickup",
  "on-delivery",
  "delivered",
  "cancelled",
] as const

export type OrderFormStatus = (typeof orderStatusValues)[number]

export const orderLineItemSchema = z.object({
  name: z.string().min(1, "Name required"),
  /** Use `valueAsNumber` on the input in RHF */
  quantity: z.number().int().positive("At least 1"),
})

/**
 * Builds a schema that restricts `clientId` / optional `rackId` to the provided id sets.
 * Matches `orders` table: `rackId` is a single optional `Id<"racks">`.
 * New orders use `status: "pending"` in the mutation unless you extend the form.
 */
export function createOrderFormSchema(
  validClientIds: readonly string[],
  validRackIds: readonly string[],
) {
  const clientSet = new Set(validClientIds)
  const rackSet = new Set(validRackIds)

  return z
    .object({
      clientId: z
        .string()
        .min(1, "Select a client")
        .refine((id) => clientSet.has(id), "Pick a client from the list"),
      /** Empty string = no rack (schema: `rackId` optional on `orders`) */
      rackId: z
        .string()
        .refine((id) => id === "" || rackSet.has(id), "Pick a rack from the list"),
      items: z.array(orderLineItemSchema).min(1, "Add at least one item"),
      isDeliveryRequired: z.boolean(),
      instructions: z.string(),
      ironing: z.boolean(),
      ironingFee: z.number().min(0, "Min. 0"),
      orderFee: z.number().min(0, "Min. 0"),
    })
    .refine((data) => !data.ironing || data.ironingFee > 0, {
      message: "Enter an ironing fee greater than 0",
      path: ["ironingFee"],
    })
}

export type OrderFormValues = z.infer<ReturnType<typeof createOrderFormSchema>>
