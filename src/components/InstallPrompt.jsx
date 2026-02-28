import { useState, useEffect, useRef } from 'react'

function isIOSSafari() {
  const ua = navigator.userAgent
  return /iP(hone|od|ad)/.test(ua) && /WebKit/.test(ua) && !/(CriOS|FxiOS|OPiOS|mercury)/.test(ua)
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPrompt = useRef(null)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem('thrive:install-dismissed')) return

    // iOS Safari — manual instructions
    if (isIOSSafari()) {
      setIsIOS(true)
      setShow(true)
      return
    }

    // Chrome / Edge / Android — capture beforeinstallprompt
    function handleBeforeInstall(e) {
      e.preventDefault()
      deferredPrompt.current = e
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  function dismiss() {
    localStorage.setItem('thrive:install-dismissed', '1')
    setShow(false)
    deferredPrompt.current = null
  }

  async function handleInstall() {
    const prompt = deferredPrompt.current
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    deferredPrompt.current = null
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-border p-4 flex items-center justify-between z-50">
      {isIOS ? (
        <p className="text-xs">
          Install Thrive: tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-xs">Install Thrive for quick access</p>
          <button
            onClick={handleInstall}
            className="text-xs font-bold text-magenta hover:underline shrink-0"
          >
            Install
          </button>
        </div>
      )}
      <button
        onClick={dismiss}
        className="ml-4 text-xs opacity-60 hover:opacity-100 shrink-0"
      >
        Dismiss
      </button>
    </div>
  )
}
