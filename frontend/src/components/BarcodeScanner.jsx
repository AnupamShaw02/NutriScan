/**
 * BarcodeScanner
 *
 * Strategy:
 *  1. BarcodeDetector API (Chrome/Android) — hardware-accelerated, ~15 FPS, handles tilt/blur
 *  2. html5-qrcode fallback — for iOS Safari and older browsers
 *
 * The BarcodeDetector path gives us:
 *  - Continuous frame scanning via requestAnimationFrame
 *  - Multi-format support (EAN-13, EAN-8, UPC-A/E, Code128, ITF, DataMatrix)
 *  - Native motion compensation handled by the OS
 *  - Optional torch (flashlight) via track.applyConstraints
 */

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

// Formats supported by most Android devices via BarcodeDetector
const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'data_matrix']

// ─── Native BarcodeDetector path ───────────────────────────────────────────

function NativeScanner({ onScan }) {
  const videoRef   = useRef(null)
  const streamRef  = useRef(null)
  const detRef     = useRef(null)
  const rafRef     = useRef(null)
  const onScanRef  = useRef(onScan)
  const foundRef   = useRef(false)
  onScanRef.current = onScan

  const [ready,    setReady]    = useState(false)
  const [denied,   setDenied]   = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const [torchOn,  setTorchOn]  = useState(false)
  const [hint,     setHint]     = useState('Move closer to the barcode')

  useEffect(() => {
    let cancelled = false

    async function init() {
      // Build detector with available formats
      try {
        const supported = await window.BarcodeDetector.getSupportedFormats()
        const fmts = FORMATS.filter(f => supported.includes(f))
        detRef.current = new window.BarcodeDetector({ formats: fmts.length ? fmts : ['ean_13', 'upc_a'] })
      } catch {
        detRef.current = new window.BarcodeDetector({ formats: ['ean_13', 'upc_a'] })
      }

      // Start camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode:  { ideal: 'environment' },
            width:       { ideal: 1920 },
            height:      { ideal: 1080 },
            focusMode:   { ideal: 'continuous' },   // continuous autofocus
          },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream

        // Detect torch capability
        const track = stream.getVideoTracks()[0]
        const caps  = track.getCapabilities?.() || {}
        if (caps.torch) setHasTorch(true)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            if (!cancelled) { videoRef.current.play(); setReady(true); startLoop() }
          }
        }
      } catch {
        if (!cancelled) setDenied(true)
      }
    }

    init()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    }
  }, [])

  // Hint cycling while scanning
  useEffect(() => {
    const hints = [
      'Move closer to the barcode',
      'Keep the barcode inside the frame',
      'Hold steady for a moment',
      'Try different lighting if needed',
    ]
    let i = 0
    const iv = setInterval(() => {
      if (!foundRef.current) { i = (i + 1) % hints.length; setHint(hints[i]) }
    }, 2800)
    return () => clearInterval(iv)
  }, [])

  function startLoop() {
    let last = 0
    async function tick(ts) {
      if (foundRef.current) return
      // Scan every ~66ms → ~15 FPS (plenty to catch sharp frames amid motion)
      if (ts - last > 66 && videoRef.current?.readyState === 4) {
        last = ts
        try {
          const results = await detRef.current.detect(videoRef.current)
          if (results.length > 0) {
            foundRef.current = true
            if (navigator.vibrate) navigator.vibrate([40, 30, 40])
            onScanRef.current(results[0].rawValue)
            return
          }
        } catch { /* frame not ready */ }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const next = !torchOn
    try { await track.applyConstraints({ advanced: [{ torch: next }] }); setTorchOn(next) } catch {}
  }

  if (denied) return <DeniedState />

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#0a0a0a', aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: ready ? 1 : 0, transition: 'opacity 350ms' }}
        />

        {/* Startup spinner */}
        {!ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#fff', animation: 'spin 700ms linear infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Starting camera…</span>
          </div>
        )}

        {ready && (
          <>
            {/* Corner brackets */}
            <Corner pos={{ top: '16px',    left: '16px'  }} dirs={['top', 'left']} />
            <Corner pos={{ top: '16px',    right: '16px' }} dirs={['top', 'right']} />
            <Corner pos={{ bottom: '16px', left: '16px'  }} dirs={['bottom', 'left']} />
            <Corner pos={{ bottom: '16px', right: '16px' }} dirs={['bottom', 'right']} />

            {/* Animated scan line */}
            <ScanLine />

            {/* Torch button */}
            {hasTorch && (
              <button
                onClick={toggleTorch}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: torchOn ? 'rgba(255,220,0,0.9)' : 'rgba(0,0,0,0.45)',
                  border: 'none', borderRadius: '8px', padding: '7px 10px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={torchOn ? '#1a1a00' : '#fff'} stroke="none">
                  <path d="M9 2l-1 7H4l8 13 1-8h4z"/>
                </svg>
              </button>
            )}

            {/* Hint text */}
            <div style={{ position: 'absolute', bottom: '14px', left: 0, right: 0, textAlign: 'center' }}>
              <span style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px', borderRadius: '20px', padding: '4px 14px' }}>
                {hint}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Status row */}
      {ready && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', animation: 'pulse 1.4s ease infinite' }} />
          <span style={{ fontSize: '12px', color: '#6B6760' }}>Scanning 15 frames/sec · holds steady or moving</span>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(0.7)} }
        @keyframes scanLine { 0%{top:10%} 100%{top:88%} }
      `}</style>
    </div>
  )
}

function Corner({ pos, dirs }) {
  const bw = '3px'
  const size = '22px'
  const style = {
    position: 'absolute', width: size, height: size, borderRadius: '2px', ...pos,
    borderTop:    dirs.includes('top')    ? `${bw} solid #fff` : 'none',
    borderBottom: dirs.includes('bottom') ? `${bw} solid #fff` : 'none',
    borderLeft:   dirs.includes('left')  ? `${bw} solid #fff` : 'none',
    borderRight:  dirs.includes('right') ? `${bw} solid #fff` : 'none',
    opacity: 0.9,
  }
  return <div style={style} />
}

function ScanLine() {
  return (
    <div style={{
      position: 'absolute', left: '14px', right: '14px', height: '2px',
      background: 'linear-gradient(90deg, transparent, #16A34A, #4ADE80, #16A34A, transparent)',
      animation: 'scanLine 2s ease-in-out infinite alternate',
      boxShadow: '0 0 8px 1px rgba(22,163,74,0.6)',
      borderRadius: '1px',
    }} />
  )
}

function DeniedState() {
  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ background: '#fff', border: '1px solid #E5E1D6', borderRadius: '12px', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
            <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2"/>
          </svg>
        </div>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '6px' }}>Camera access denied</p>
        <p style={{ fontSize: '13px', color: '#A8A29E', lineHeight: 1.55 }}>
          Allow camera in your browser settings, then reload this page.
        </p>
      </div>
    </div>
  )
}

// ─── html5-qrcode fallback (iOS Safari, older browsers) ────────────────────

function FallbackScanner({ onScan }) {
  const scannerRef = useRef(null)
  const onScanRef  = useRef(onScan)
  onScanRef.current = onScan

  useEffect(() => {
    if (scannerRef.current) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 15,
        qrbox: { width: 280, height: 160 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.33,
        showTorchButtonIfSupported: true,
        useBarCodeDetectorIfSupported: true,   // uses native API inside html5-qrcode if available
        supportedScanTypes: [0],               // camera only, no file upload
      },
      false,
    )

    scanner.render(
      (text) => {
        if (navigator.vibrate) navigator.vibrate([40, 30, 40])
        scanner.clear().catch(() => {})
        scannerRef.current = null
        onScanRef.current(text)
      },
      () => {},
    )

    scannerRef.current = scanner

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div id="qr-reader" style={{ width: '100%' }} />
      <style>{`
        #qr-reader { border: none !important; }
        #qr-reader video { border-radius: 12px; }
        #qr-reader__scan_region { background: transparent !important; }
        #qr-reader__dashboard {
          background: #FFFFFF !important;
          border-radius: 0 0 12px 12px;
          padding: 12px 16px !important;
          border-top: 1px solid #E5E1D6 !important;
        }
        #qr-reader__dashboard_section_csr button {
          background: #16A34A !important; border: none !important;
          border-radius: 8px !important; color: #fff !important;
          padding: 8px 18px !important; font-family: Inter,sans-serif !important;
          font-weight: 700 !important; font-size: 13px !important; cursor: pointer !important;
        }
        #qr-reader__camera_selection {
          background: #F7F4EE !important; border: 1px solid #E5E1D6 !important;
          color: #1C1917 !important; border-radius: 8px !important;
          padding: 6px 10px !important; width: 100% !important;
          margin-bottom: 8px !important; font-family: Inter,sans-serif !important; font-size: 13px !important;
        }
        #qr-reader__status_span { color: #A8A29E !important; font-size: 12px !important; font-family: Inter,sans-serif !important; }
        #qr-reader__torch_button {
          background: #F7F4EE !important; border: 1px solid #E5E1D6 !important;
          border-radius: 8px !important; color: #1C1917 !important;
          padding: 6px 12px !important; margin-left: 8px !important;
          font-family: Inter,sans-serif !important; font-size: 13px !important;
        }
        #qr-reader img[alt="Info icon"] { display: none !important; }
        #qr-reader__header_message { display: none !important; }
      `}</style>
    </div>
  )
}

// ─── Exported component — picks the right engine ───────────────────────────

export default function BarcodeScanner({ onScan }) {
  const useNative = typeof window !== 'undefined' && 'BarcodeDetector' in window
  return useNative
    ? <NativeScanner onScan={onScan} />
    : <FallbackScanner onScan={onScan} />
}
