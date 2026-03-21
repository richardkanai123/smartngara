"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { UserPlus, Shield, Users, ArrowLeft, PackageOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
const createUserSchema = z.object({
  email: z.email("Please enter a valid email address"),
  role: z.enum(["client", "courier"]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function AdminUsersPage() {
  const isAdmin = useQuery(api.userRoles.amIAdmin);
  const createUser = useMutation(api.userRoles.adminCreateUser);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      role: "client",
    },
  });

  const selectedRole = watch("role");

  if (isAdmin === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  // Redirect if not admin
  if (isAdmin === false) {
    redirect("/");
  }

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      const result = await createUser({
        email: values.email,
        role: values.role,
      });

      toast.success(`Invitation sent to ${result.email}`);
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create user";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Side - Admin Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Link */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>

          {/* Brand */}
          <div className="mb-10 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Shield className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              SmartNgara
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Admin Panel
            </h1>
            <h2 className="text-3xl font-light tracking-tight text-foreground">
              Invite New User
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Invite clients or couriers to join the platform. They will receive
              an email with a registration link to set up their own account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup>
              {/* Email Field */}
              <Field>
                <Label htmlFor="email">Email</Label>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    className="h-11"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email && (
                    <FieldError errors={[{ message: errors.email.message }]} />
                  )}
                </FieldContent>
              </Field>

              {/* Role Selection */}
              <Field>
                <Label htmlFor="role">User Role</Label>
                <FieldContent>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                        selectedRole === "client"
                          ? "border-primary bg-primary/5"
                          : errors.role
                            ? "border-destructive"
                            : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Users className={`mb-2 size-5 ${selectedRole === "client" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${selectedRole === "client" ? "text-primary" : ""}`}>Client</span>
                      <input
                        type="radio"
                        value="client"
                        {...register("role")}
                        className="sr-only"
                      />
                    </label>
                    <label
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                        selectedRole === "courier"
                          ? "border-primary bg-primary/5"
                          : errors.role
                            ? "border-destructive"
                            : "border-border hover:border-primary/50"
                      }`}
                    >
                      <PackageOpen className={`mb-2 size-5 ${selectedRole === "courier" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${selectedRole === "courier" ? "text-primary" : ""}`}>Courier</span>
                      <input
                        type="radio"
                        value="courier"
                        {...register("role")}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  {errors.role && (
                    <FieldError errors={[{ message: errors.role.message }]} />
                  )}
                </FieldContent>
              </Field>
            </FieldGroup>

            {/* Submit Button */}
            <Button
              disabled={isSubmitting}
              type="submit"
              className="h-11 w-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Sending Invitation...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="size-4" />
                  Send Invitation
                </span>
              )}
            </Button>
          </form>

          {/* Note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            The user will receive an email with a registration link where they can
            create their username and password.
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:bg-muted">
        <div className="relative w-full max-w-lg p-8">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-background to-secondary/30 p-8 shadow-2xl">
            <div className="absolute -right-20 -top-20 size-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-secondary/20 blur-3xl" />

            <div className="relative text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Shield className="size-10" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">Admin Dashboard</h3>
              <p className="text-muted-foreground">
                Manage users, track deliveries, and oversee platform operations
                from one centralized location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
