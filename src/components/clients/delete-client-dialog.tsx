'use client'
import { api } from '@/lib/convex-api'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { TrashIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '../ui/spinner'
const DeleteClientDialog = ({id, name}: {id: Id<'clients'>, name: string}) => {
    const [open, setOpen] = useState(false) 
    const deleteClient = useMutation(api.clients.deleteClient)
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        startTransition(async () => {
       try {
            const result = await deleteClient({id})
            if (result.success) {
                toast.success('Client deleted successfully')
                setOpen(false)
            } else {
                toast.error(result.message)
                setOpen(false)
            }
        }
       catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete client'
        toast.error(errorMessage)
        setOpen(false)
       }
       });

    }



  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className='hover:bg-muted'>
                <TrashIcon className="size-4 fill-destructive" />
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Client</DialogTitle>
            </DialogHeader>
            <DialogDescription>
                Are you sure you want to delete {name} from the clients list?
            </DialogDescription>
            <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                    {isPending ? <Spinner className="size-4" /> : 'Delete'}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default DeleteClientDialog