import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FormModal } from '@/components/dashboard/form-modal'
import { useI18n } from '@/lib/i18n'
import { createService } from '@/lib/api/services'
import { listChurches } from '@/lib/api/churches'
import { CalendarClock, Church as ChurchIcon, ChevronsRight } from 'lucide-react'

const TYPES = [
  'typeRegularSunday', 'typeBibleStudy', 'typeSpecialMeeting',
  'typeConference', 'typeVigil', 'typeBaptisms', 'typeOther'
] as const

export function ScheduleServiceForm({
  isOpen, onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { t } = useI18n()
  const qc = useQueryClient()
  const [churchId, setChurchId]         = useState<number | ''>('')
  const [serviceType, setServiceType]   = useState('')
  const [scheduledAt, setScheduledAt]   = useState('')
  const [error, setError]               = useState<string | null>(null)

  const churchesQ = useQuery({
    queryKey: ['churches'],
    queryFn:  () => listChurches({ perPage: 100 })
  })

  const reset = () => {
    setChurchId(''); setServiceType(''); setScheduledAt(''); setError(null)
  }

  const mutation = useMutation({
    mutationFn: () => createService({
      church_id:    churchId as number,
      service_type: serviceType,
      scheduled_at: new Date(scheduledAt).toISOString()
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services-overview'] })
      toast.success(t('services.toastServiceScheduled'))
      reset()
      onClose()
    },
    onError: () => toast.error(t('services.toastError'))
  })

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    setError(null)
    if (!churchId || !serviceType) return
    const dt = new Date(scheduledAt)
    if (Number.isNaN(dt.getTime()) || dt.getTime() <= Date.now()) {
      setError(t('services.formRequiredFutureDate'))
      return
    }
    mutation.mutate()
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={() => { reset(); onClose() }}
      onSubmit={() => submit()}
      title={t('services.scheduleServiceButton')}
      icon={<ChevronsRight className="w-6 h-6" />}
      submitText={mutation.isPending ? t('common.loading') : t('services.scheduleServiceButton')}
      cancelText={t('common.cancel')}
      size="lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {t('services.formChurch')}
          </label>
          <div className="relative">
            <ChurchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={churchId}
              onChange={(e) => setChurchId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-sm"
            >
              <option value="">—</option>
              {(churchesQ.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

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
            {t('services.formScheduledAt')}
          </label>
          <div className="relative">
            <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-sm"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </FormModal>
  )
}
