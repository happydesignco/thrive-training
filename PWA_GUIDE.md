# PWA Extension — Implementation Guide

## Overview

Add Progressive Web App (PWA) support to the Thrive Training Platform so users can install it to their home screen and use it offline. This is a lightweight addition to the existing Vite + React build — no new dependencies required.

---

## What Users Get

- **"Add to Home Screen"** prompt on iOS and Android — app icon on their phone
- **Full-screen experience** — no browser chrome, looks and feels native
- **Offline support** — workout library, 5/3/1 calculator, and roulette all work without internet
- **Fast load** — assets cached locally after first visit
- **Auto-updates** — new content loads in background, available next launch

---

## Files to Create

### 1. Web App Manifest

Create `public/manifest.json`:

```json
{
  "name": "Thrive Athletic Club",
  "short_name": "Thrive",
  "description": "Training platform for hybrid athletes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#FF00FF",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Notes:**
- `display: "standalone"` removes browser chrome — app fills the screen
- `theme_color: "#FF00FF"` sets the status bar color on Android (magenta, matching your brand)
- `background_color: "#000000"` shows during app launch before React mounts
- Icons need to be generated from your Thrive logo — see Icon Generation section below

### 2. Service Worker

Vite has built-in PWA support via the `vite-plugin-pwa` plugin. This is the simplest path.

Install:
```bash
npm install -D vite-plugin-pwa
```

Update `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: false, // we're using our own manifest.json in /public
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            // Cache Google Fonts (DM Mono)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache font files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
```

**What this does:**
- Pre-caches all built JS, CSS, HTML, JSON, and assets on first load
- Caches DM Mono font files from Google Fonts for offline use
- Auto-updates the service worker when you deploy new code — users get updates on next launch
- No manual service worker file to write or maintain

### 3. HTML Head Tags

Add to `index.html` inside `<head>`:

```html
<!-- PWA -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#FF00FF">

<!-- iOS-specific -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Thrive">
<link rel="apple-touch-icon" href="/icons/icon-192.png">

<!-- Prevent zoom on input focus (iOS) -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

**Notes:**
- `apple-mobile-web-app-status-bar-style: black-translucent` makes the status bar transparent over your black background — looks clean
- The viewport meta prevents iOS from zooming in when users tap input fields (5/3/1 calculator, user selector)

---

## Icon Generation

You need two PNG icons from your Thrive logo:
- `public/icons/icon-192.png` — 192×192px
- `public/icons/icon-512.png` — 512×512px

**Requirements:**
- Use your existing Thrive icon/logo
- Add padding for maskable icon support (safe zone is the inner 80% circle)
- Black background with the logo centered works well given your design system
- PNG format, no transparency needed (black bg is fine)

**Quick generation options:**
- [Maskable.app](https://maskable.app/editor) — upload your logo, export both sizes
- [RealFaviconGenerator](https://realfavicongenerator.net/) — generates all sizes from one source image
- Or just export from Figma/Canva at both sizes

You already have these on your WordPress site:
- `cropped-thrive_icon-192x192.png`
- `cropped-thrive_icon-32x32.png`

You could start by downloading the 192px version from your WP site and upscaling/recreating at 512px.

---

## Offline Behavior

### What works offline (immediately after first visit):
- Full workout library (Monday, Wednesday, Thursday) — it's all in the JS bundle via JSON imports
- 5/3/1 calculator — pure client-side math
- HYROX roulette — pure client-side randomization
- Weekly planner — reads from localStorage
- Session logging — writes to localStorage
- User selector and all preferences

### What requires connectivity:
- Nothing, for your current feature set

This is one of the advantages of your architecture — the entire app is static with localStorage persistence. There's no API to call, no database to query. Once cached, it's fully functional offline forever (until a new version is deployed and the service worker updates).

---

## Install Prompts

### Android
Chrome will automatically show an "Add to Home Screen" banner after the user visits twice with at least 5 minutes between visits, IF the PWA criteria are met (manifest + service worker + HTTPS). You don't need to do anything.

### iOS
Safari doesn't show automatic install prompts. You have two options:

**Option A — Do nothing.** Users who know about PWAs will use Share → Add to Home Screen. For 10 gym buddies, you can just tell them.

**Option B — Add a subtle install hint.** Show a dismissable banner on first visit for iOS users:

```jsx
// components/InstallPrompt.jsx
import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show on iOS Safari, not already installed
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem('thrive:install-dismissed')

    if (isIOS && !isStandalone && !dismissed) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#151515',
      borderTop: '1px solid #FF00FF',
      padding: '1rem',
      fontFamily: '"DM Mono", monospace',
      fontSize: '12px',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>
        Install Thrive: tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
      </span>
      <button
        onClick={() => {
          setShow(false)
          localStorage.setItem('thrive:install-dismissed', '1')
        }}
        style={{
          background: 'none',
          border: '1px solid #333',
          color: 'white',
          padding: '4px 8px',
          fontFamily: 'inherit',
          cursor: 'pointer'
        }}
      >
        ✕
      </button>
    </div>
  )
}
```

Drop `<InstallPrompt />` into your `App.jsx` and it handles itself.

---

## Deployment

PWAs require HTTPS. Your deployment options:

| Host | HTTPS | Free Tier | Deploy Command |
|------|-------|-----------|----------------|
| **Vercel** | Auto | Yes | `vercel` or git push |
| **Netlify** | Auto | Yes | `netlify deploy --prod` |
| **GitHub Pages** | Auto | Yes | `gh-pages` package |
| **Your WP site** | Already has it | N/A | Upload `dist/` to a subdirectory |

**Recommended:** Vercel or Netlify. Connect your repo, push to main, auto-deploys. Zero config.

**WordPress option:** If you want this at `thriveathletic.club/app`, you can upload the built `dist/` folder to your server. Just make sure the base path is configured in `vite.config.js`:
```javascript
export default defineConfig({
  base: '/app/',
  // ... rest of config
})
```

---

## Testing

### Verify PWA is working:
1. Build the app: `npm run build`
2. Preview locally: `npm run preview`
3. Open Chrome DevTools → Application tab → Manifest (should show your manifest data)
4. Application → Service Workers (should show registered worker)
5. Application → Cache Storage (should show cached assets)
6. Lighthouse → Run audit → PWA section (should pass all checks)

### Test offline:
1. Load the app once with network on
2. DevTools → Network tab → check "Offline"
3. Refresh — app should load fully from cache
4. Navigate between tabs, use 5/3/1 calculator, browse workouts — all should work

### Test install:
- **Android:** Visit in Chrome, should see install prompt or use menu → "Install app"
- **iOS:** Visit in Safari, Share → Add to Home Screen
- **Desktop:** Chrome shows install icon in address bar

---

## Estimated Effort

| Task | Time |
|------|------|
| Install `vite-plugin-pwa`, configure | 10 min |
| Create `manifest.json` | 5 min |
| Add HTML head tags | 5 min |
| Generate icons (2 sizes) | 10 min |
| iOS install prompt component (optional) | 10 min |
| Test in Lighthouse + offline | 10 min |
| **Total** | **~30–50 min** |

This is a one-time setup. Once it's in, every future deploy is automatically PWA-enabled.

---

## Future PWA Enhancements (Not Needed Now)

These are things you could add later if demand exists:

- **Push notifications** — remind users of their daily workout (requires a push server, significant additional complexity)
- **Background sync** — queue session logs when offline, sync when back online (only matters if you add a backend)
- **Share target** — let users share workout results directly from the app
- **Shortcuts** — long-press the app icon to jump directly to Roulette or 5/3/1

None of these are worth building until the core app is solid and people are using it daily.

---

End of Document
