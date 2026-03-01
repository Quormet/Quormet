'use client'
import { useState } from 'react'
import { submitIssue } from '@/app/(dashboard)/issues/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ReportIssueModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState('')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            formData.set('category', category)
            const newIssue = await submitIssue(formData)
            setOpen(false)
            toast.success('Issue reported successfully')
            router.push(`/issues/${newIssue.id}`)
        } catch {
            toast.error('Failed to report issue')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Report Issue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report an Issue</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="Short description" minLength={10} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="safety">Safety</SelectItem>
                                <SelectItem value="noise">Noise</SelectItem>
                                <SelectItem value="parking">Parking</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" placeholder="Where is this?" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe the issue in detail..."
                            rows={4}
                            minLength={10}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="photoUrl">Photo URL (Optional)</Label>
                        <Input id="photoUrl" name="photoUrl" placeholder="https://..." type="url" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!category || loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Submit Issue
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
