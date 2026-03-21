"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { LogIn, Sparkles, ArrowRight, Shield } from "lucide-react";

const UnauthenticatedCard = () => {
  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-backwards">
      <Card className="relative overflow-hidden border-0 bg-card shadow-2xl">
        {/* Decorative gradient background using theme colors */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-card to-secondary/30" />

        {/* Animated gradient orbs using theme colors */}
        <div className="absolute -right-20 -top-20 size-40 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-40 animate-pulse rounded-full bg-secondary/30 blur-3xl [animation-delay:2s]" />

        <div className="relative">
          <CardHeader className="pb-4 pt-8 text-center">
            {/* Brand badge */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 animate-in zoom-in duration-500 [animation-delay:200ms] fill-mode-backwards"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                SmartNgara
              </span>
            </div>

            {/* Shield icon */}
            <div
              className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 animate-in zoom-in duration-500 [animation-delay:300ms] fill-mode-backwards"
            >
              <Shield className="size-8" />
            </div>

            {/* Two-tone heading matching create-account style */}
            <h1
              className="text-3xl font-bold tracking-tight text-card-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:400ms] fill-mode-backwards"
            >
              Welcome Back
            </h1>
            <h2
              className="text-3xl font-light tracking-tight text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:500ms] fill-mode-backwards"
            >
              Sign In to Continue
            </h2>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <p
              className="text-center text-sm text-muted-foreground animate-in fade-in duration-500 [animation-delay:600ms] fill-mode-backwards"
            >
              Access your account to manage your experience and explore all
              features.
            </p>

            {/* Primary CTA */}
            <div
              className="animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:700ms] fill-mode-backwards"
            >
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="size-4" />
                Sign In to Your Account
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Secondary CTA */}
            <div
              className="text-center animate-in fade-in duration-500 [animation-delay:800ms] fill-mode-backwards"
            >
              <p className="text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary transition-colors hover:opacity-80"
                >
                  Create one now
                </Link>
              </p>
            </div>

            {/* Trust indicators */}
            <div
              className="flex items-center justify-center gap-4 border-t border-border pt-4 animate-in fade-in duration-500 [animation-delay:900ms] fill-mode-backwards"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="size-1.5 rounded-full bg-green-500" />
                Secure login
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="size-1.5 rounded-full bg-green-500" />
                Encrypted data
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default UnauthenticatedCard;
