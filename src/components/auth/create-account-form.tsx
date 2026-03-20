"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { UserPlus, Lock, ShieldCheck, Cloud } from "lucide-react";
import { toast } from "sonner";
import Illustration from "@/components/auth/illustration";

const createAccountSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

const CreateAccountForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: CreateAccountFormValues) => {
    try {
      const result = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to create account");
      } else {
        toast.success("Account created successfully!");
        router.push("/");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Side - Create Account Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Brand */}
          <div className="mb-10 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <UserPlus className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              SmartNgara
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Create Account
            </h1>
            <h2 className="text-3xl font-light tracking-tight text-foreground">
              Get Started
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join Smart Ngara and experience the intelligent shine.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup>
              {/* Name Field */}
              <Field>
                <FieldContent>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    className="h-11"
                    {...register("name")}
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name && (
                    <FieldError errors={[{ message: errors.name.message }]} />
                  )}
                </FieldContent>
              </Field>

              {/* Email Field */}
              <Field>
                <FieldContent>
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="h-11"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email && (
                    <FieldError errors={[{ message: errors.email.message }]} />
                  )}
                </FieldContent>
              </Field>

              {/* Password Field */}
              <Field>
                <FieldContent>
                  <Input
                    type="password"
                    placeholder="Password"
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

              {/* Confirm Password Field */}
              <Field>
                <FieldContent>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
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

            {/* Submit Button */}
            <Button
              disabled={isSubmitting}
              type="submit"
              className="h-11 w-full bg-purple-600 text-sm font-medium text-white hover:bg-purple-700"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-purple-600 transition-colors hover:text-purple-700"
            >
              Login Now
            </Link>
          </p>
        </div>
      </div>
      {/* Right Side - Illustration */}
      <Illustration />
    </div>
  );
};

export default CreateAccountForm;
