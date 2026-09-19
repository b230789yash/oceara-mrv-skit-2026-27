'use client'

import { useRef, useEffect, useCallback } from 'react'

interface HolographicCardProps {
  role: {
    id: string
    title: string
    description: string
    icon: string
    color: string
  }
  isSelected: boolean
  onSelect: () => void
  onHover: (isHovered: boolean) => void
}

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max)
const round = (value: number, precision = 3) => parseFloat(value.toFixed(precision))
const adjust = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin))
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

export default function HolographicCard({ role, isSelected, onSelect, onHover }: HolographicCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)

  const getGradientForRole = (roleId: string) => {
    switch (roleId) {
      case 'landowner':
        return {
          behind: 'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(142,100%,90%,var(--card-opacity)) 4%,hsla(142,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(142,25%,70%,calc(--card-opacity)*0.5)) 50%,hsla(142,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaa 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#10b981 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#10b981 0%,#059669 40%,#059669 60%,#10b981 100%)',
          inner: 'linear-gradient(145deg,#10b98144 0%,#05966944 100%)',
          sunpillars: ['hsl(142, 100%, 73%)', 'hsl(142, 100%, 69%)', 'hsl(142, 100%, 65%)', 'hsl(142, 100%, 76%)', 'hsl(142, 100%, 74%)', 'hsl(142, 100%, 73%)']
        }
      case 'buyer':
        return {
          behind: 'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(211,100%,90%,var(--card-opacity)) 4%,hsla(211,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(211,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(211,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00c1ff 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#3b82f6 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#3b82f6 0%,#2563eb 40%,#2563eb 60%,#3b82f6 100%)',
          inner: 'linear-gradient(145deg,#3b82f644 0%,#2563eb44 100%)',
          sunpillars: ['hsl(211, 100%, 73%)', 'hsl(211, 100%, 69%)', 'hsl(211, 100%, 65%)', 'hsl(211, 100%, 76%)', 'hsl(211, 100%, 74%)', 'hsl(211, 100%, 73%)']
        }
      case 'admin':
        return {
          behind: 'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(283,100%,90%,var(--card-opacity)) 4%,hsla(283,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(283,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(283,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#c137ff 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#a855f7 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#a855f7 0%,#9333ea 40%,#9333ea 60%,#a855f7 100%)',
          inner: 'linear-gradient(145deg,#a855f744 0%,#9333ea44 100%)',
          sunpillars: ['hsl(283, 100%, 73%)', 'hsl(283, 100%, 69%)', 'hsl(283, 100%, 65%)', 'hsl(283, 100%, 76%)', 'hsl(283, 100%, 74%)', 'hsl(283, 100%, 73%)']
        }
      default:
        return {
          behind: 'radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%)',
          inner: 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)',
          sunpillars: ['hsl(2, 100%, 73%)', 'hsl(53, 100%, 69%)', 'hsl(93, 100%, 69%)', 'hsl(176, 100%, 76%)', 'hsl(228, 100%, 74%)', 'hsl(283, 100%, 73%)']
        }
    }
  }

  const updateCardTransform = useCallback((offsetX: number, offsetY: number) => {
    const card = cardRef.current
    const wrap = wrapRef.current
    if (!card || !wrap) return

    const width = card.clientWidth
    const height = card.clientHeight

    const percentX = clamp((100 / width) * offsetX)
    const percentY = clamp((100 / height) * offsetY)

    const centerX = percentX - 50
    const centerY = percentY - 50

    const properties = {
      '--pointer-x': `${percentX}%`,
      '--pointer-y': `${percentY}%`,
      '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
      '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
      '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
      '--pointer-from-top': `${percentY / 100}`,
      '--pointer-from-left': `${percentX / 100}`,
      '--rotate-x': `${round(-(centerX / 5))}deg`,
      '--rotate-y': `${round(centerY / 4)}deg`
    }

    Object.entries(properties).forEach(([property, value]) => {
      wrap.style.setProperty(property, value)
    })
  }, [])

  const createSmoothAnimation = useCallback((duration: number, startX: number, startY: number) => {
    const wrap = wrapRef.current
    const card = cardRef.current
    if (!wrap || !card) return

    const startTime = performance.now()
    const targetX = wrap.clientWidth / 2
    const targetY = wrap.clientHeight / 2

    const animationLoop = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = clamp(elapsed / duration)
      const easedProgress = easeInOutCubic(progress)

      const currentX = adjust(easedProgress, 0, 1, startX, targetX)
      const currentY = adjust(easedProgress, 0, 1, startY, targetY)

      updateCardTransform(currentX, currentY)

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animationLoop)
      }
    }

    rafId.current = requestAnimationFrame(animationLoop)
  }, [updateCardTransform])

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    updateCardTransform(event.clientX - rect.left, event.clientY - rect.top)
  }, [updateCardTransform])

  const handlePointerEnter = useCallback(() => {
    const card = cardRef.current
    const wrap = wrapRef.current
    if (!card || !wrap) return

    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }

    wrap.classList.add('active')
    card.classList.add('active')
    onHover(true)
  }, [onHover])

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    const card = cardRef.current
    const wrap = wrapRef.current
    if (!card || !wrap) return

    createSmoothAnimation(600, event.nativeEvent.offsetX, event.nativeEvent.offsetY)
    wrap.classList.remove('active')
    card.classList.remove('active')
    onHover(false)
  }, [createSmoothAnimation, onHover])

  useEffect(() => {
    const wrap = wrapRef.current
    const card = cardRef.current
    if (!wrap || !card) return

    const initialX = wrap.clientWidth - 70
    const initialY = 60

    updateCardTransform(initialX, initialY)
    createSmoothAnimation(1500, initialX, initialY)

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [updateCardTransform, createSmoothAnimation])

  const gradient = getGradientForRole(role.id)

  return (
    <div
      ref={wrapRef}
      className={`holo-card-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        '--behind-gradient': gradient.behind,
        '--inner-gradient': gradient.inner,
        '--sunpillar-1': gradient.sunpillars[0],
        '--sunpillar-2': gradient.sunpillars[1],
        '--sunpillar-3': gradient.sunpillars[2],
        '--sunpillar-4': gradient.sunpillars[3],
        '--sunpillar-5': gradient.sunpillars[4],
        '--sunpillar-6': gradient.sunpillars[5],
      } as React.CSSProperties}
      onClick={onSelect}
    >
      <section
        ref={cardRef}
        className="holo-card"
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <div className="holo-inside">
          <div className="holo-shine" />
          <div className="holo-glare" />
          <div className="holo-content">
            <div className="holo-details">
              <div className="holo-icon">{role.icon}</div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
              {isSelected && (
                <div className="holo-selected-badge">✓ Selected</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

