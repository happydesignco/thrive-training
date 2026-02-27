import { useState, useEffect } from 'react'

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

  useEffect(() => {
    if (!isIOSSafari()) return
    if (isStandalone()) return
    if (localStorage.getItem('thrive:install-dismissed')) return
    setShow(true)
  }, [])

  function dismiss() {
    localStorage.setItem('thrive:install-dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-border p-4 flex items-center justify-between z-50">
      <p className="text-xs">
        Install Thrive: tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
      </p>
      <button
        onClick={dismiss}
        className="ml-4 text-xs opacity-60 hover:opacity-100 shrink-0"
      >
        Dismiss
      </button>
    </div>
  )
}
