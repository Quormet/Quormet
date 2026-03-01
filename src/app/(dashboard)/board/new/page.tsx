'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { submitHelpRequest } from '../actions'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'

export default function NewHelpRequestPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [neededBy, setNeededBy] = useState('')

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
            setTags([...tags, tagInput.trim().toLowerCase()])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !description.trim()) {
            toast.error('Please fill in required fields')
            return
        }

        startTransition(async () => {
            try {
                await submitHelpRequest(
                    title,
                    description,
                    tags,
                    neededBy ? new Date(neededBy) : undefined
                )
                toast.success("Help request posted successfully")
                router.push('/help')
            } catch (error) {
                toast.error("Failed to post request")
                console.error(error)
            }
        })
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-2xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Post Help Request</h1>
                <p className="text-slate-500 mt-1">Ask your fellow members for a hand with something.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Request Details</CardTitle>
                        <CardDescription>Provide enough context so members know how they can help.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                placeholder="e.g. Need to borrow a ladder"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="description"
                                placeholder="Can anyone lend me a tall ladder this weekend? Need to clean my gutters."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (Skills Needed)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="tags"
                                    placeholder="e.g. tools, heavy lifting"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddTag()
                                        }
                                    }}
                                />
                                <Button type="button" variant="secondary" onClick={handleAddTag}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-slate-700">
                                            {tag}
                                            <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-slate-600">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="neededBy">Needed By (Optional)</Label>
                            <Input
                                id="neededBy"
                                type="datetime-local"
                                value={neededBy}
                                onChange={e => setNeededBy(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t py-4 bg-slate-50/50">
                        <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Posting..." : "Post Request"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
