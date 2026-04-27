import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { FormModal } from '@/components/dashboard/form-modal'
import { useI18n } from '@/lib/i18n'
import { createServiceRequest } from '@/lib/api/services'
import { CalendarClock, FileText, Sparkles } from 'lucide-react'

const TYPES = ['typeSpecialMeeting', 'typeConference', 'typeVigil', 'typeBaptisms', 'typeOther'] as const

export function ServiceRequestForm({
  isOpen, onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { t } = useI18n()
  const qc = useQueryClient()
  const [serviceType, setServiceType] = useState('')
  const [requestedFor, setRequestedFor] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setServiceType(''); setRequestedFor(''); setNotes(''); setError(null)
  }

  const mutation = useMutation({
    mutationFn: () => createServiceRequest({
      service_type:  serviceType,
      requested_for: new Date(requestedFor).toISOString(),
      notes:         notes.trim() || undefined
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services-overview'] })
      toast.success(t('services.toastRequestCreated'))
      reset()
      onClose()
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(t('services.toastError'))
      } else {
        toast.error(t('services.toastError'))
      }
    }
  })

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    setError(null)
    const dt = new Date(requestedFor)
    if (Number.isNaN(dt.getTime()) || dt.getTime() <= Date.now()) {
      setError(t('services.formRequiredFutureDate'))
      return
    }
    if (!serviceType) return
    mutation.mutate()
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={() => { reset(); onClose() }}
      onSubmit={() => submit()}
      title={t('services.newRequestButton')}
      icon={<Sparkles className="w-6 h-6" />}
      submitText={mutation.isPending ? t('common.loading') : t('services.newRequestButton')}
      cancelText={t('common.cancel')}
      size="lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('services.formServiceType')}
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm"
          >
            <option value="">—</option>
            {TYPES.map((key) => (
              <option key={key} value={t(`services.${key}`)}>{t(`services.${key}`)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('services.formRequestedFor')}
          </label>
          <div className="relative">
            <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="datetime-local"
              value={requestedFor}
              onChange={(e) => setRequestedFor(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('services.formNotes')}
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={t('services.formNotesPlaceholder')}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-sm"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </FormModal>
  )
}
