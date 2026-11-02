export const typeText = (text: string, set: (value: string) => void) =>
  new Promise<void>((resolve) => {
    let shown = 0
    const step = Math.max(1, Math.ceil(text.length / 60))

    const timer = setInterval(() => {
      shown += step
      set(text.slice(0, shown))

      if (shown >= text.length) {
        clearInterval(timer)
        set(text)
        resolve()
      }
    }, 20)
  })