import { cn } from '../../lib/utils'

interface OptionPickerProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function OptionPicker({ options, value, onChange, className }: OptionPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const selected = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              selected
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400',
            )}
            aria-pressed={selected}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

interface MultiOptionPickerProps {
  options: string[]
  values: string[]
  onChange: (values: string[]) => void
  className?: string
}

export function MultiOptionPicker({ options, values, onChange, className }: MultiOptionPickerProps) {
  const toggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option))
    } else {
      onChange([...values, option])
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const selected = values.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              selected
                ? 'border-red-600 bg-red-50 text-red-700'
                : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400',
            )}
            aria-pressed={selected}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
