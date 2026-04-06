"use client"

import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShieldX } from "lucide-react"

const UnAuthorised = ({
  title,
  message,
}: {
  title: string
  message: string
}) => {
  const router = useRouter()

  // Strong ease-out for UI interactions

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-8">
      {/* Ambient background glow for visual depth */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20 mix-blend-screen transition-opacity duration-1000 dark:opacity-30">
        <div className="absolute h-[30rem] w-[30rem] rounded-full bg-rose-500/20 blur-[100px]" />
        <div className="absolute h-[20rem] w-[40rem] rounded-full bg-orange-500/10 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center overflow-hidden rounded-3xl border border-border/50 bg-background/60 p-8 text-center shadow-2xl backdrop-blur-xl ring-1 ring-white/10 dark:bg-zinc-950/50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              delay: 0.1,
              duration: 0.5,
              ease: "easeOut",
            }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20 shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)]"
          >
            <ShieldX className="h-10 w-10 text-rose-500" strokeWidth={1.5} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-muted-foreground sm:text-base max-w-[280px]">
              {message}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
            className="flex w-full flex-col gap-3 sm:flex-row"
          >
            <Button
              onClick={() => router.push("/")}
              className="h-11 w-full rounded-xl bg-rose-500 text-sm font-medium text-white shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)] transition-all duration-200 hover:bg-rose-600 hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.5)] active:scale-[0.97] active:translate-y-0"
            >
              Go Back Home
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
};

export default UnAuthorised;
