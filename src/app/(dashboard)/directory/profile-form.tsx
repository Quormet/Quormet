'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateProfileSettings } from './actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type ProfileFormProps = {
    me: {
        name: string
        email: string
        phone: string | null
        address: string | null
        directoryOptIn: boolean | null
    }
}

export function ProfileForm({ me }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await updateProfileSettings(formData)
            toast.success('Profile updated successfully')
        } catch (e: any) {
            toast.error(e.message || 'Failed to update profile')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4 text-sm">
            <div className="space-y-1">
                <label className="font-medium text-slate-700">Name</label>
                <div className="p-2 bg-slate-100 rounded border text-slate-500 cursor-not-allowed">{me.name}</div>
            </div>

            <div className="space-y-1">
                <label className="font-medium text-slate-700">Email</label>
                <div className="p-2 bg-slate-100 rounded border text-slate-500 cursor-not-allowed break-all">{me.email}</div>
            </div>

            <div className="space-y-1 pt-2">
                <label htmlFor="phone" className="font-medium text-slate-700">Phone Number</label>
                <Input id="phone" name="phone" placeholder="(555) 123-4567" defaultValue={me.phone || ""} />
            </div>

            <div className="space-y-1">
                <label htmlFor="address" className="font-medium text-slate-700">Unit / Address</label>
                <Input id="address" name="address" placeholder="Unit 4B or 123 Main St" defaultValue={me.address || ""} />
            </div>

            <div className="pt-2 border-t mt-4">
                <label className="flex items-start gap-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-slate-50">
                    <input
                        type="checkbox"
                        name="directoryOptIn"
                        defaultChecked={me.directoryOptIn || false}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    <div>
                        <p className="font-medium text-slate-900">Show me in directory</p>
                        <p className="text-xs text-slate-500 mt-0.5">Allow members to see my name and contact info.</p>
                    </div>
                </label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
            </Button>
        </form>
    )
}
