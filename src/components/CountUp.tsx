import { useEffect, useState } from "react"

interface CountUpProps {
  value: number
}

export default function CountUp({ value }: CountUpProps) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1000)
      const eased = 1 - Math.pow(1 - progress, 3)

      setShown(Math.round(value * eased))

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{shown.toLocaleString("en-US")}</>
}
