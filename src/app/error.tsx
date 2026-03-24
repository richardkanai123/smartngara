'use client'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const CustomError = ({error}: {error: Error}) => {
    const router = useRouter()
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground">An error occurred while loading the page</p>
        <p className="text-muted-foreground">{error.message || "An unexpected error occurred"}</p>


        <div className="mx-auto flex items-center justify-center gap-2">
            <Button variant="default" onClick={() => router.push("/")}>Go to home</Button>
            <Button variant="secondary" onClick={() => router.refresh()}>Refresh</Button>
        </div>
        </div>
    )
}

export default CustomError