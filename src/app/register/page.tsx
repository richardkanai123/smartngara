"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo } from "react";
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
import {
  Lock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  UserPlus,
  Phone,
  MapPin,
  Truck,
} from "lucide-react";

type InviteRole = "client" | "courier" | "worker";

const VEHICLE_OPTIONS = [
  { value: "motorcycle", label: "Motorcycle" },
  { value: "car", label: "Car" },
  { value: "bicycle", label: "Bicycle" },
  { value: "other", label: "Other" },
] as const;

const registerFields = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Must contain uppercase, lowercase, and a number",
    ),
  confirmPassword: z.string(),
  phone: z.string(),
  address: z.string(),
  vehicle: z.enum(["motorcycle", "car", "bicycle", "other"]).optional(),
  vehicleReg: z.string(),
});

function createRegisterSchema(role: InviteRole) {
  return registerFields
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords do not match", path: ["confirmPassword"] });
      }
      if (role === "client" || role === "courier") {
        if (!data.phone) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone number is required", path: ["phone"] });
        }
      }
      if (role === "client" && !data.address) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Address is required", path: ["address"] });
      }
      if (role === "courier" && !data.vehicle) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Select a vehicle type", path: ["vehicle"] });
      }
    });
}

type RegisterFormValues = z.infer<typeof registerFields>;

interface InviteData {
  email: string;
  role: InviteRole;
  expiresAt: number;
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const invite = useQuery(
    api.userRoles.validateInviteToken,
    token ? { token } : "skip",
  );

  if (!token) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-destructive" />
          <h1 className="mb-2 text-2xl font-bold">Invalid Invitation</h1>
          <p className="text-muted-foreground">
            The registration link is missing or invalid. Please contact your
            administrator for a valid invitation.
          </p>
        </div>
      </div>
    );
  }

  if (invite === undefined) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 size-16 text-destructive" />
          <h1 className="mb-2 text-2xl font-bold">Invitation Expired</h1>
          <p className="text-muted-foreground">
            This invitation has expired or has already been used. Please contact
            your administrator for a new invitation.
          </p>
        </div>
      </div>
    );
  }

  return <RegisterForm invite={invite as InviteData} token={token} />;
}

function RegisterForm({ invite, token }: { invite: InviteData; token: string }) {
  const router = useRouter();
  const finalizeRegistration = useMutation(api.userRoles.finalizeInviteRegistration);

  const schema = useMemo(() => createRegisterSchema(invite.role), [invite.role]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
      vehicle: invite.role === "courier" ? "motorcycle" : undefined,
      vehicleReg: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const { data, error } = await authClient.signUp.email({
        email: invite.email,
        password: values.password,
        name: values.name,
        username: values.username,
      });

      if (error || !data?.user) {
        throw new Error(error?.message || "Failed to create account");
      }

      const res = await finalizeRegistration({
        token,
        email: invite.email,
        userId: data.user.id,
        phone: values.phone || undefined,
        address: values.address || undefined,
        vehicle: values.vehicle || undefined,
        vehicleReg: values.vehicleReg || undefined,
      });

      if (!res.success) {
        throw new Error("Unable to finalize registration");
      }

      toast.success("Account created successfully!");
      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="mx-auto mb-4 size-16 text-green-500" />
          <h1 className="mb-2 text-2xl font-bold">Welcome to SmartNgara!</h1>
          <p className="mb-6 text-muted-foreground">
            Your account has been created successfully. You will be redirected
            shortly.
          </p>
          <Button onClick={() => router.push("/login")} className="w-full">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const roleBadgeColor =
    invite.role === "client"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      : invite.role === "courier"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Brand */}
          <div className="mb-10 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              SmartNgara
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Complete Registration
            </h1>
            <h2 className="text-3xl font-light tracking-tight text-foreground">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You&apos;ve been invited as a{" "}
              <span
                className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold capitalize ${roleBadgeColor}`}
              >
                {invite.role}
              </span>
              . Fill in your details to get started.
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Email: </span>
              {invite.email}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup>
              {/* Name */}
              <Field>
                <Label htmlFor="name">Full Name</Label>
                <FieldContent>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="h-11"
                    {...register("name")}
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name && (
                    <FieldError errors={[{ message: errors.name.message }]} />
                  )}
                </FieldContent>
              </Field>

              {/* Username */}
              <Field>
                <Label htmlFor="username">Username</Label>
                <FieldContent>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    className="h-11"
                    {...register("username")}
                    aria-invalid={errors.username ? "true" : "false"}
                  />
                  {errors.username && (
                    <FieldError
                      errors={[{ message: errors.username.message }]}
                    />
                  )}
                </FieldContent>
              </Field>

              {/* Password */}
              <Field>
                <Label htmlFor="password">Password</Label>
                <FieldContent>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    className="h-11"
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  {errors.password && (
                    <FieldError
                      errors={[{ message: errors.password.message }]}
                    />
                  )}
                </FieldContent>
              </Field>

              {/* Confirm Password */}
              <Field>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <FieldContent>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="h-11"
                    {...register("confirmPassword")}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                  />
                  {errors.confirmPassword && (
                    <FieldError
                      errors={[{ message: errors.confirmPassword.message }]}
                    />
                  )}
                </FieldContent>
              </Field>
            </FieldGroup>

            {/* Role-specific fields */}
            {(invite.role === "client" || invite.role === "courier" || invite.role === "worker") && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 pt-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {invite.role} Details
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <FieldGroup>
                  {/* Phone — required for client & courier, optional for worker */}
                  <Field>
                    <Label htmlFor="phone">
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        Phone Number
                        {(invite.role === "client" || invite.role === "courier") && (
                          <span className="text-destructive">*</span>
                        )}
                      </span>
                    </Label>
                    <FieldContent>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={
                          invite.role === "worker"
                            ? "Phone number (optional)"
                            : "e.g. +254 712 345 678"
                        }
                        className="h-11"
                        {...register("phone")}
                        aria-invalid={errors.phone ? "true" : "false"}
                      />
                      {errors.phone && (
                        <FieldError
                          errors={[{ message: errors.phone.message }]}
                        />
                      )}
                    </FieldContent>
                  </Field>

                  {/* Address — required for client only */}
                  {invite.role === "client" && (
                    <Field>
                      <Label htmlFor="address">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          Address
                          <span className="text-destructive">*</span>
                        </span>
                      </Label>
                      <FieldContent>
                        <Input
                          id="address"
                          type="text"
                          placeholder="Enter your address"
                          className="h-11"
                          {...register("address")}
                          aria-invalid={errors.address ? "true" : "false"}
                        />
                        {errors.address && (
                          <FieldError
                            errors={[{ message: errors.address.message }]}
                          />
                        )}
                      </FieldContent>
                    </Field>
                  )}

                  {/* Vehicle type — required for courier only */}
                  {invite.role === "courier" && (
                    <>
                      <Field>
                        <Label htmlFor="vehicle">
                          <span className="flex items-center gap-1.5">
                            <Truck className="size-3.5" />
                            Vehicle Type
                            <span className="text-destructive">*</span>
                          </span>
                        </Label>
                        <FieldContent>
                          <select
                            id="vehicle"
                            className="h-11 w-full border border-input bg-transparent px-2.5 py-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
                            {...register("vehicle")}
                            aria-invalid={errors.vehicle ? "true" : "false"}
                          >
                            {VEHICLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {errors.vehicle && (
                            <FieldError
                              errors={[{ message: errors.vehicle.message }]}
                            />
                          )}
                        </FieldContent>
                      </Field>

                      <Field>
                        <Label htmlFor="vehicleReg">
                          Vehicle Registration
                          <span className="ml-1 text-xs text-muted-foreground">
                            (optional)
                          </span>
                        </Label>
                        <FieldContent>
                          <Input
                            id="vehicleReg"
                            type="text"
                            placeholder="e.g. KAA 123A"
                            className="h-11"
                            {...register("vehicleReg")}
                          />
                        </FieldContent>
                      </Field>
                    </>
                  )}
                </FieldGroup>
              </div>
            )}

            {/* Submit */}
            <Button
              disabled={isSubmitting}
              type="submit"
              className="h-11 w-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="size-4" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          {/* Help Text */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need help? Contact your administrator for assistance.
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
                <Lock className="size-10" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">Secure Your Account</h3>
              <p className="text-muted-foreground">
                Create a strong password to protect your account. Use a mix of
                letters, numbers, and symbols for best security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
