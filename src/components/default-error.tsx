'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

const DefaultError = ({errorMessage}: {errorMessage: string}) => {
    const router = useRouter()
    return (

        <div className="self-center bg-card p-4 rounded-lg max-w-md m-auto items-center justify-center shadow-lg shadow-sidebar-ring/50">
          <AlertTriangle className="size-10 text-destructive" />
      <div className="flex flex-col items-center justify-center  max-h-[500px]  gap-4">
        <h1 className="text-2xl text-destructive font-bold">An Error Occurred</h1>
        <p className="text-muted-foreground">{errorMessage || "An unexpected error occurred"}</p>
      </div>
      <div className="flex items-center justify-center gap-2 mt-2">
        <Link href="/" className="text-sm  bg-primary p-2 rounded-lg">Go to home</Link>
        <Button onClick={() => router.refresh()} variant="secondary">Refresh</Button>
      </div>
    </div>
  );
};

export default DefaultError;