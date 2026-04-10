import { useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BarcodeScanner from '../components/BarcodeScanner'
import ImageUploader from '../components/ImageUploader'
import CameraCapture from '../components/CameraCapture'
import LoadingState from '../components/LoadingState'
import { scanBarcode, scanImage, getHealthProfile } from '../utils/api'

export default function Scanner() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const fileRef    = useRef(null)
  const [mode,     setMode]    = useState(location.state?.defaultMode || 'barcode')
  const [photoSrc, setPhotoSrc] = useState('camera') // 'camera' | 'upload'
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState(null)
  const [barcode,  setBarcode] = useState('')
  const [focused,  setFocused] = useState(false)
  const [shake,    setShake]   = useState(false)
  const [valMsg,   setValMsg]  = useState(null)

  async function handleBarcode(code) {
    const trimmed = code?.trim()
    if (!trimmed) return
    // Reject QR codes / URLs — only accept 8–14 digit EAN/UPC barcodes
    if (!/^\d{8,14}$/.test(trimmed)) {
      setError('QR code detected — point camera at the barcode lines (the striped rectangle), not the QR code square.')
      return
    }
    setLoading(true); setError(null)
    try {
      const result = await scanBarcode(trimmed, getHealthProfile())
      if (!result.found) { navigate('/not-found'); return }
      navigate('/result', { state: result })
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Cannot reach server'
      setError(`Error: ${msg}`)
      setLoading(false)
    }
  }

  async function handleImage(base64) {
    setLoading(true); setError(null)
    try {
      const result = await scanImage(base64, getHealthProfile())
      navigate('/result', { state: result })
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Image scan failed'
      setError(`Error: ${msg}`)
      setLoading(false)
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    const code = barcode.trim()
    if (!code) return
    if (!/^\d{8,14}$/.test(code)) {
      setShake(true); setValMsg('Enter a valid 8-14 digit barcode.')
      setTimeout(() => setShake(false), 550)
      return
    }
    setValMsg(null); handleBarcode(code)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#F7F4EE' }}><LoadingState /></div>

  const ic = focused ? '#16A34A' : '#A8A29E'

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: '52px', background: '#fff',
        borderBottom: '1px solid #E5E1D6', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
          Cancel
        </button>
        <div style={{ display: 'flex', background: '#F7F4EE', border: '1px solid #E5E1D6', borderRadius: '8px', padding: '3px', gap: '2px' }}>
          {[{ id: 'barcode', label: 'Barcode' }, { id: 'image', label: 'Photo' }].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setError(null); setValMsg(null); setPhotoSrc('camera') }}
              style={{
                padding: '5px 14px', borderRadius: '6px', border: 'none',
                background: mode === m.id ? '#fff' : 'transparent',
                color: mode === m.id ? '#1C1917' : '#A8A29E',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                boxShadow: mode === m.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 150ms',
              }}>{m.label}</button>
          ))}
        </div>
        <div style={{ width: '60px' }} />
      </header>

      {error && (
        <div style={{ margin: '12px 16px 0', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 14px', color: '#DC2626', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ padding: '20px 0' }}>
        {mode === 'barcode' ? (
          <>
            <BarcodeScanner onScan={handleBarcode} />
            <p style={{ color: '#A8A29E', fontSize: '13px', textAlign: 'center', margin: '14px 16px 20px' }}>
              Point camera at the barcode on the packaging
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 16px 14px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E1D6' }} />
              <span style={{ color: '#D6D0C8', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>or enter manually</span>
              <div style={{ flex: 1, height: '1px', background: '#E5E1D6' }} />
            </div>
            <form onSubmit={handleManualSubmit} style={{ padding: '0 16px' }}>
              <div style={{ display: 'flex', gap: '8px', animation: shake ? 'shake 0.5s ease both' : 'none' }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#fff', borderRadius: '12px', padding: '0 12px', height: '48px',
                  border: `1px solid ${shake ? '#DC2626' : focused ? '#16A34A' : '#E5E1D6'}`,
                  transition: 'border-color 150ms',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <rect x="2" y="4" width="3" height="16" rx="0.5" fill={ic}/>
                    <rect x="7" y="4" width="1.5" height="16" rx="0.5" fill={ic}/>
                    <rect x="10.5" y="4" width="2.5" height="16" rx="0.5" fill={ic}/>
                    <rect x="15" y="4" width="1.5" height="16" rx="0.5" fill={ic}/>
                    <rect x="18.5" y="4" width="3" height="16" rx="0.5" fill={ic}/>
                  </svg>
                  <input type="text" inputMode="numeric" placeholder="e.g. 8901058155018"
                    value={barcode}
                    onChange={e => { setBarcode(e.target.value.replace(/\D/g, '')); setValMsg(null) }}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#1C1917', fontSize: '14px' }} />
                  {barcode && (
                    <button type="button" onClick={() => { setBarcode(''); setValMsg(null) }}
                      style={{ background: '#E5E1D6', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6760', fontSize: '12px', flexShrink: 0 }}>
                      x
                    </button>
                  )}
                </div>
                <button type="submit" disabled={!barcode}
                  style={{
                    width: '48px', height: '48px', flexShrink: 0, border: 'none', borderRadius: '12px',
                    background: barcode ? '#1C1917' : '#E5E1D6',
                    color: barcode ? '#fff' : '#A8A29E',
                    fontSize: '18px', fontWeight: 700, cursor: barcode ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 150ms',
                  }}>
                  {'>'}
                </button>
              </div>
              {valMsg && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '6px', paddingLeft: '2px' }}>{valMsg}</p>}
            </form>
          </>
        ) : (
          photoSrc === 'camera'
            ? <CameraCapture
                onCapture={handleImage}
                onUploadFallback={() => { setPhotoSrc('upload') }}
              />
            : <div>
                <ImageUploader onImage={handleImage} />
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <button
                    onClick={() => setPhotoSrc('camera')}
                    style={{ background: 'none', border: 'none', color: '#A8A29E', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Use live camera instead
                  </button>
                </div>
              </div>
        )}
      </div>
    </div>
  )
}
