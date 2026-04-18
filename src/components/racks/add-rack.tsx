"use client";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { api } from "@convex/_generated/api";
import type { Preloaded } from "convex/react";
import DefaultError from "../default-error";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Field, FieldContent, FieldError, FieldGroup } from "../ui/field";
import { Label } from "../ui/label";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

const addRackSchema = z.object({
  label: z.string().min(1, "Label is required"),
  size: z.enum(["small", "medium", "large"]),
  location: z.string().min(1, "Location is required"),
  maxOrders: z.number().min(1, "Max orders is required"),
});

const AddRack = ({
  preloadedUserQuery,
}: {
  preloadedUserQuery: Preloaded<typeof api.userRoles.getMyRole>;
}) => {
  const userRole = usePreloadedAuthQuery(preloadedUserQuery);
  
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    ...form
  } = useForm<z.infer<typeof addRackSchema>>({
    resolver: zodResolver(addRackSchema),
    defaultValues: {
      label: "",
      size: "small",
      location: "",
      maxOrders: 1,
    },
  });

  const mutation = useMutation(api.racks.createRack);
  const router = useRouter();

  // watch for size of rack to ensure if size is large, max orders is 3, 2 for medium, 1 for small

  const rackSize = form.watch("size");
  const maxOrders = useMemo<number>(() => {
    if (rackSize === "large") return 3;
    if (rackSize === "medium") return 2;
    return 1;
  }, [rackSize]);

  const onSubmit = async (data: z.infer<typeof addRackSchema>) => {
    try {
      await mutation({
        label: data.label,
        size: data.size,
        location: data.location,
        maxOrders: maxOrders,
      });
      toast.success("Rack added successfully");
      form.reset();
      router.push("/admin/racks");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add rack";
      toast.error(message);
    }
  };

  if (userRole !== "admin" ) {
    return (
      <DefaultError errorMessage="You are not authorized to access this page" />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md bg-card space-y-4 p-4 text-lg"
    >
      <FieldGroup>
        {/* Name */}
        <Field>
          <Label htmlFor="label">Label</Label>
          <FieldContent>
            <Input
              id="label"
              type="text"
              placeholder="Enter rack label"
              className="h-12"
              {...form.register("label")}
              aria-invalid={errors.label ? "true" : "false"}
            />
            {errors.label && (
              <FieldError errors={[{ message: errors.label.message }]} />
            )}
          </FieldContent>
        </Field>

        <Field>
          <Label htmlFor="size">Size</Label>
          <FieldContent>
            <Select
              id="size"
              onValueChange={(value) =>
                form.setValue("size", value as "small" | "medium" | "large")
              }
              value={form.getValues("size")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
            {errors.size && (
              <FieldError errors={[{ message: errors.size.message }]} />
            )}
          </FieldContent>
        </Field>
        <Field>
          <Label htmlFor="location">Location</Label>
          <FieldContent>
            <Input
              id="location"
              placeholder="Enter location"
              {...form.register("location")}
              aria-invalid={errors.location ? "true" : "false"}
            />
            {errors.location && (
              <FieldError errors={[{ message: errors.location.message }]} />
            )}
          </FieldContent>
        </Field>
        <Field>
          <Label htmlFor="maxOrders">Max Orders</Label>
          <FieldContent>
            <Input
              id="maxOrders"
              placeholder="Enter max orders"
              value={maxOrders}
              readOnly
              aria-invalid={errors.maxOrders ? "true" : "false"}
            />
            {errors.maxOrders && (
              <FieldError errors={[{ message: errors.maxOrders.message }]} />
            )}
          </FieldContent>
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : "Add Rack"}
      </Button>
    </form>
  );
};

export default AddRack;
