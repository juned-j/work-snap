// Lightweight global error handler and toast helper
export function initGlobalErrorHandlers() {
  if (typeof window === 'undefined') return

  const showToast = (message: string, type: 'error' | 'warn' = 'error') => {
    try {
      const id = `app-toast-${Date.now()}`
      const el = document.createElement('div')
      el.id = id
      el.style.position = 'fixed'
      el.style.right = '16px'
      el.style.bottom = '16px'
      el.style.zIndex = '9999'
      el.style.background = type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(245,158,11,0.95)'
      el.style.color = 'white'
      el.style.padding = '10px 14px'
      el.style.borderRadius = '8px'
      el.style.boxShadow = '0 6px 18px rgba(2,6,23,0.2)'
      el.style.maxWidth = '320px'
      el.style.fontSize = '13px'
      el.textContent = message
      document.body.appendChild(el)
      setTimeout(() => {
        try { document.body.removeChild(el) } catch (e) {}
      }, 6000)
    } catch (e) {
      // fallback
      // eslint-disable-next-line no-alert
      try { alert(message) } catch (e) {}
    }
  }

  const safeLog = (err: any) => {
    try {
      const safe = { message: err?.message ?? String(err) }
      // eslint-disable-next-line no-console
      console.error('[GlobalError]', safe)
    } catch (e) {}
  }

  window.addEventListener('error', (event) => {
    try {
      safeLog(event.error || event.message)
      showToast('An unexpected error occurred', 'error')
      event.preventDefault()
    } catch (e) {}
  })

  window.addEventListener('unhandledrejection', (event) => {
    try {
      safeLog(event.reason)
      showToast('A network or background error occurred', 'warn')
      event.preventDefault()
    } catch (e) {}
  })
}
