import { formatDuration, cn } from '../utils'

describe('formatDuration', () => {
  it('should format milliseconds correctly', () => {
    expect(formatDuration(1500)).toBe('1500ms')
    expect(formatDuration(999)).toBe('999ms')
  })

  it('should format seconds correctly', () => {
    expect(formatDuration(5000)).toBe('5.00s')
    expect(formatDuration(10500)).toBe('10.50s')
  })

  it('should handle zero', () => {
    expect(formatDuration(0)).toBe('0ms')
  })

  it('should handle negative values', () => {
    expect(formatDuration(-100)).toBe('-100ms')
  })
})

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toContain('text-red-500')
    expect(cn('text-red-500', 'bg-blue-500')).toContain('bg-blue-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active')).toContain('active')
    expect(cn('base', false && 'inactive')).not.toContain('inactive')
  })

  it('should deduplicate classes', () => {
    const result = cn('p-4', 'p-6')
    expect(result).toContain('p-6')
    expect(result).not.toContain('p-4')
  })
})
