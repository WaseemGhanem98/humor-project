import { AlertIcon, CheckIcon } from '@/components/icons'

export type FeedbackMessage = { type: 'success' | 'error'; text: string }

// Always-mounted live region so screen readers announce new messages.
export default function Feedback({
  message,
  className = '',
}: {
  message: FeedbackMessage | null
  className?: string
}) {
  return (
    <div aria-live="polite" className={className}>
      {message && (
        <p
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`alert flex items-start gap-2 ${
            message.type === 'success' ? 'alert-success' : 'alert-error'
          }`}
        >
          {message.type === 'success' ? (
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </p>
      )}
    </div>
  )
}
