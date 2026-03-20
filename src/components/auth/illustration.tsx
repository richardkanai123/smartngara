'use client';
import { Lock, ShieldCheck, Cloud } from "lucide-react";

const Illustration = () => {
  return (
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
                <img
                  src="/logo.png"
                  alt="Smart Ngara Logo"
                  className="h-auto w-64 object-contain drop-shadow-2xl"
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
        </div>
         {/* Bottom gradient overlay */}
         <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-purple-600/50 to-transparent" />
    </div>
  )
}

export default Illustration