import { useEffect, useRef, useState } from 'react'

export default function CameraCapture({ onCapture, onUploadFallback }) {
  const videoRef   = useRef(null)
  const streamRef  = useRef(null)
  const [ready,    setReady]    = useState(false)
  const [flash,    setFlash]    = useState(false)
  const [denied,   setDenied]   = useState(false)
  const [pressing, setPressing] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
            setReady(true)
          }
        }
      } catch {
        if (!cancelled) setDenied(true)
      }
    }
    startCamera()
    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  function capture() {
    if (!videoRef.current || !ready) return
    // Flash effect
    setFlash(true)
    setTimeout(() => setFlash(false), 160)
    if (navigator.vibrate) navigator.vibrate(40)

    // Draw current frame to canvas, resize to ≤1024px, export as JPEG
    const video = videoRef.current
    const MAX = 1024
    let w = video.videoWidth
    let h = video.videoHeight
    if (w > MAX || h > MAX) {
      if (w > h) { h = Math.round((h * MAX) / w); w = MAX }
      else { w = Math.round((w * MAX) / h); h = MAX }
    }
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    canvas.getContext('2d').drawImage(video, 0, 0, w, h)
    const base64 = canvas.toDataURL('image/jpeg', 0.88)
    onCapture(base64)
  }

  if (denied) {
    return (
      <div style={{ padding: '0 16px' }}>
        <div style={{ background: '#fff', border: '1px solid #E5E1D6', borderRadius: '12px', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
              <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2"/>
            </svg>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '6px' }}>Camera access denied</p>
          <p style={{ fontSize: '13px', color: '#A8A29E', lineHeight: 1.55, marginBottom: '20px' }}>
            Allow camera in your browser settings, or upload a photo instead.
          </p>
          <button
            onClick={onUploadFallback}
            style={{
              width: '100%', height: '48px', border: '1px solid #E5E1D6', borderRadius: '12px',
              background: '#fff', color: '#1C1917', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Upload from gallery
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Camera viewfinder */}
      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#0a0a0a', aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: ready ? 1 : 0, transition: 'opacity 300ms' }}
        />

        {/* Loading skeleton */}
        {!ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#fff', animation: 'spin 700ms linear infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Starting camera…</span>
          </div>
        )}

        {/* Flash overlay */}
        {flash && (
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.7, pointerEvents: 'none' }} />
        )}

        {/* Corner brackets */}
        {ready && (
          <>
            {[
              { top: '14px',  left: '14px',  borderTop: '3px solid #fff', borderLeft: '3px solid #fff' },
              { top: '14px',  right: '14px', borderTop: '3px solid #fff', borderRight: '3px solid #fff' },
              { bottom: '14px', left: '14px',  borderBottom: '3px solid #fff', borderLeft: '3px solid #fff' },
              { bottom: '14px', right: '14px', borderBottom: '3px solid #fff', borderRight: '3px solid #fff' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: '22px', height: '22px', borderRadius: '2px', ...s, opacity: 0.85 }} />
            ))}
          </>
        )}

        {/* Hint */}
        {ready && (
          <div style={{ position: 'absolute', bottom: '14px', left: 0, right: 0, textAlign: 'center' }}>
            <span style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: '11px', borderRadius: '20px', padding: '4px 12px', letterSpacing: '0.03em' }}>
              Point at front of packaging · press to capture
            </span>
          </div>
        )}
      </div>

      {/* Capture button row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', marginBottom: '4px', gap: '24px' }}>
        {/* Upload fallback */}
        <button
          onClick={onUploadFallback}
          style={{ background: '#fff', border: '1px solid #E5E1D6', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6760" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B6760' }}>Gallery</span>
        </button>

        {/* Main shutter button */}
        <button
          onClick={capture}
          disabled={!ready}
          onMouseDown={() => setPressing(true)}
          onMouseUp={() => setPressing(false)}
          onTouchStart={() => setPressing(true)}
          onTouchEnd={() => { setPressing(false); capture() }}
          style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: ready ? '#16A34A' : '#E5E1D6',
            border: `4px solid ${ready ? '#fff' : '#E5E1D6'}`,
            boxShadow: ready ? '0 0 0 3px #16A34A' : 'none',
            cursor: ready ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: pressing && ready ? 'scale(0.91)' : 'scale(1)',
            transition: 'transform 100ms, background 200ms, box-shadow 200ms',
            outline: 'none',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={ready ? '#fff' : '#A8A29E'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>

        {/* Spacer to balance the row */}
        <div style={{ width: '82px' }} />
      </div>
    </div>
  )
}
