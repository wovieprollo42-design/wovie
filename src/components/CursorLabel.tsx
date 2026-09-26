import { useEffect, useRef } from 'react'
import { cursorLabel } from '@/data/site'

/**
 * "Hire Me" pill that trails the mouse pointer (like wovieofficial.vercel.app), paired with
 * the custom arrow cursor set in styles.css. Mouse devices only: touch screens have no
 * pointer to follow. Position updates go straight to the element on each animation frame,
 * so moving the mouse never re-renders React.
 */
export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !cursorLabel.text) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let x = 0
    let y = 0
    let raf = 0
    const place = () => {
      raf = 0
      el.style.left = `${x}px`
      el.style.top = `${y}px`
    }
    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      if (!raf) raf = requestAnimationFrame(place)
      el.classList.add('is-visible')
    }
    const onLeave = () => el.classList.remove('is-visible')

    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  if (!cursorLabel.text) return null
  return (
    <div ref={ref} aria-hidden="true" className="cursor-label">
      {cursorLabel.text}
    </div>
  )
}
