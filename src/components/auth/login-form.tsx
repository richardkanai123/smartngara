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
import { Fingerprint, Lock, ShieldCheck, Cloud, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import LogOutBtn from "./log-out-btn";
import Image from "next/image";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();

  const { data: sessionData, isPending: isSessionPending } = authClient.useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });


  if (isSessionPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (sessionData?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">You are already logged in</p>
          <Link href="/" className="text-sm text-primary">Go to home</Link>
          <LogOutBtn/>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: LoginFormValues) => {
    try {
    await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      },{
        onSuccess: () => {
          router.push("/");
        },
        onError: (error) => {
          toast.error(error.error.message || "An unexpected error occurred. Please try again.");
        },
      });
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Brand */}
          <div className="mb-10 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <Fingerprint className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">SmartNgara</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Holla,
            </h1>
            <h2 className="text-3xl font-light tracking-tight text-foreground">
              Welcome Back
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup>
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
                    <FieldError errors={[{ message: errors.password.message }]} />
                  )}
                </FieldContent>
              </Field>
            </FieldGroup>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {errors.email && (
              <div className="rounded border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {errors.email.message}
              </div>
            )}

            {/* Submit Button */}
            <Button
              disabled={isSubmitting}
              type="submit"
              className="h-11 w-full inline-flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Spinner className="size-4 animate-spin" /> : "Log in"}
              <ArrowRight className="size-4 group-hover:animate-in slide-in-from-right-2 duration-500 [animation-delay:700ms] fill-mode-backwards" />
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="inline-flex items-center group justify-center gap-2 mt-2 text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
            >
                Create now{" "}
                <ArrowRight className="size-4 group-hover:animate-in slide-in-from-right-2 duration-500 [animation-delay:700ms] fill-mode-backwards" />
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-purple-500 via-purple-600 to-blue-500">
          {/* Decorative Clouds */}
          <div className="absolute right-0 top-0 h-32 w-64 rounded-bl-full bg-white/10" />
          <div className="absolute left-0 top-20 h-24 w-48 rounded-br-full bg-white/10" />
          <div className="absolute bottom-20 right-10 h-28 w-56 rounded-tl-full bg-white/10" />
          <div className="absolute bottom-0 left-20 h-32 w-72 rounded-tr-full bg-white/10" />

          {/* Logo Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative flex flex-col items-center">
              {/* Logo Image */}
              <div className="relative">
                <Image
                  src="/images/logo.png"
                  width={200}
                  height={200}
                  alt="Smart Ngara Logo"
                  className="h-auto object-contain drop-shadow-2xl"
                />
              </div>

              {/* Floating Elements */}
              {/* Checkmark Bubble */}
              <div className="absolute -right-4 top-4 flex size-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/90 shadow-lg">
                <ShieldCheck className="size-6 text-purple-600" />
              </div>

              {/* Lock Icon */}
              <div className="absolute -bottom-2 -right-8 rounded-xl border-2 border-white/30 bg-white/90 p-2.5 shadow-lg">
                <Lock className="size-6 text-purple-600" />
              </div>

              {/* Cloud decorations */}
              <div className="absolute -left-12 top-8 text-white/40">
                <Cloud className="size-10" />
              </div>
              <div className="absolute -bottom-4 -left-4 text-white/30">
                <Cloud className="size-14" />
              </div>
              <div className="absolute -right-2 bottom-20 text-white/30">
                <Cloud className="size-8" />
              </div>
            </div>
          </div>

          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-purple-600/50 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 
