'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateIssueStatus } from '@/app/(dashboard)/issues/actions'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const STATUSES = [
  { value: 'submitted',        label: 'Submitted' },
  { value: 'board_review',     label: 'Board Review' },
  { value: 'vendor_assigned',  label: 'Vendor Assigned' },
  { value: 'in_progress',      label: 'In Progress' },
  { value: 'resolved',         label: 'Resolved' },
]

export default function AdminStatusPanel({
  issueId,
  currentStatus,
  vendors,
  currentVendorId
}: {
  issueId: string
  currentStatus: string
  vendors?: { id: string, name: string }[]
  currentVendorId?: string | null
}) {
  const [status, setStatus] = useState(currentStatus)
  const [vendorId, setVendorId] = useState(currentVendorId || 'unassigned')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      const assignedVendorId = vendorId === 'unassigned' ? undefined : vendorId
      await updateIssueStatus(issueId, status, note, assignedVendorId)
      setNote('')
      toast.success(`Issue moved to ${STATUSES.find(s => s.value === status)?.label}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-xl p-5 space-y-5 bg-card shadow-sm">
      <h3 className="font-semibold tracking-tight text-lg">Admin Controls</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status === 'vendor_assigned' || status === 'in_progress' || currentVendorId ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Assign Vendor</label>
          <Select value={vendorId} onValueChange={setVendorId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a vendor..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {vendors?.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium">Update Note (optional)</label>
        <Textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note for the resident..."
          className="resize-none"
          rows={3}
        />
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save Update
      </Button>
    </div>
  )
}
