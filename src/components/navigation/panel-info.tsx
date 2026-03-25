'use client'
import { Shield } from 'lucide-react'

const PanelInfo = ({ title, description }: { title: string, description: string }) => {
  return (
    <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:bg-muted">
    <div className="relative w-full max-w-lg p-8">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-background to-secondary/30 p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 size-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Shield className="size-10" />
          </div>
          <h3 className="mb-2 text-2xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  </div>
  )
}

export default PanelInfo