import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./alert"

type AlertVariant = 'default' | 'destructive' | 'warning'

interface AlertBannerProps {
  variant?: AlertVariant
  title: string
  description: string
  actions?: React.ReactNode
}

export function AlertBanner({ 
  variant = 'warning',
  title,
  description,
  actions 
}: AlertBannerProps) {
  const variantClasses = {
    default: 'bg-background border border-border',
    destructive: 'bg-destructive/15 border-destructive/50 text-destructive',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-200',
  }

  return (
    <Alert className={`relative overflow-hidden ${variantClasses[variant]} animate-pulse`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertTitle className="font-semibold">{title}</AlertTitle>
          <AlertDescription className="text-sm">
            {description}
          </AlertDescription>
          {actions && (
            <div className="mt-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </Alert>
  )
}
