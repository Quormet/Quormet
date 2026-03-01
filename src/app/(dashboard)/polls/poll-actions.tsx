'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { closePoll, deletePoll } from './actions'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function PollActions({ id, isClosed }: { id: number, isClosed: boolean }) {
    const [isClosing, setIsClosing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleClose() {
        setIsClosing(true)
        try {
            await closePoll(id)
            toast.success('Poll closed successfully')
        } catch (e: any) {
            toast.error(e.message || 'Failed to close poll')
        } finally {
            setIsClosing(false)
        }
    }

    async function handleDelete() {
        setIsDeleting(true)
        try {
            await deletePoll(id)
            toast.success('Poll deleted successfully')
        } catch (e: any) {
            toast.error(e.message || 'Failed to delete poll')
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex gap-2 items-center">
            {!isClosed && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50" disabled={isClosing}>
                            {isClosing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <AlertCircle className="h-4 w-4 mr-1" />}
                            Close Poll
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Close Poll Early?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will end voting immediately and reveal the final results to all members.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClose} className="bg-amber-600 hover:bg-amber-700">
                                Close Poll
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50" disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this poll? This will remove all votes and the poll itself permanently.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
