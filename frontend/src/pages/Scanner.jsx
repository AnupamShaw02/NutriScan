import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BarcodeScanner from '../components/BarcodeScanner'
import ImageUploader from '../components/ImageUploader'
import LoadingState from '../components/LoadingState'
import { scanBarcode, scanImage, getHealthProfile } from '../utils/api'

function isValidBarcode(code) {
  return /^\d{8,14}$/.test(code)
}

export default function Scanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode,          setMode]          = useState(location.state?.defaultMode || 'barcode')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)
  const [manualBarcode, setManualBarcode] = useState('')
  const [inputFocused,  setInputFocused]  = useState(false)
  const [shake,         setShake]         = useState(false)
  const [validationMsg, setValidationMsg] = useState(null)

  async function handleBarcode(barcode) {
    const code = barcode.trim()
    if (!code) return
    setLoading(true)
    setError(null)
    try {
      const profile = getHealthProfile()
      const result  = await scanBarcode(code, profile)
      if (!result.found) { navigate('/not-found'); return }
      navigate('/result', { state: result })
    } catch {
      setError('Could not reach server. Make sure the backend is running.')
      setLoading(false)
    }
  }

  async function handleImage(base64) {
    setLoading(true)
    setError(null)
    try {
      const profile = getHealthProfile()
      const result  = await scanImage(base64, profile)
      navigate('/result', { state: result })
    } catch {
      setError('Image scan failed. Try barcode mode instead.')
      setLoading(false)
    }
  }

  function handleManualChange(e) {
    setManualBarcode(e.target.value.replace(/\D/g, ''))
    setValidationMsg(null)
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    const code = manualBarcode.trim()
    if (!code) return
    if (!isValidBarcode(code)) {
      setShake(true)
      setValidationMsg('Enter a valid 8–14 digit barcode.')
      setTimeout(() => setShake(false), 600)
      return
    }
    setValidationMsg(null)
    handleBarcode(code)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F2EB' }}>
        <LoadingState />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EB' }}>

      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', background: '#FFFFFF', borderBottom: '1px solid #E8E4D8',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', color: '#6B6760',
            cursor: 'pointer', fontSize: '14px', padding: 0,
            transition: 'color 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#1A1916'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B6760'}
        >
          ← Cancel
        </button>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', background: '#F5F2EB',
          border: '1px solid #E8E4D8', borderRadius: '10px',
          padding: '3px', gap: '2px',
        }}>
          {[
            { id: 'barcode', label: 'Barcode' },
            { id: 'image',   label: 'Photo'   },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setError(null); setValidationMsg(null) }}
              style={{
                padding: '6px 16px', borderRadius: '7px', border: 'none',
                background: mode === m.id ? '#FFFFFF' : 'transparent',
                color: mode === m.id ? '#1A1916' : '#9B9890',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                boxShadow: mode === m.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 150ms',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ width: '60px' }} />
      </div>

      {/* API error */}
      {error && (
        <div style={{
          margin: '12px 16px 0',
          background: '#FEE2E2', border: '1px solid #FECACA',
          borderRadius: '10px', padding: '12px 14px',
          color: '#DC2626', fontSize: '13px', lineHeight: 1.4,
        }}>
          {error}
        </div>
      )}

      <div style={{ padding: '20px 0' }}>
        {mode === 'barcode' ? (
          <>
            <BarcodeScanner onScan={handleBarcode} />

            <p style={{
              color: '#9B9890', fontSize: '13px', textAlign: 'center',
              margin: '14px 20px 20px',
            }}>
              Point camera at the barcode on the packaging
            </p>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 20px 14px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E8E4D8' }} />
              <span style={{ color: '#C5C2BA', fontSize: '11px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                or enter manually
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E8E4D8' }} />
            </div>

            {/* Ghost-style barcode input */}
            <form onSubmit={handleManualSubmit} style={{ padding: '0 20px' }}>
              <div style={{
                display: 'flex', gap: '8px',
                animation: shake ? 'shake 0.55s ease both' : 'none',
              }}>
                {/* Input wrapper */}
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                  background: inputFocused ? '#FFFFFF' : '#EFECE4',
                  border: `1.5px solid ${shake ? '#EF4444' : inputFocused ? '#16A34A' : 'transparent'}`,
                  borderRadius: '13px', padding: '0 14px', height: '50px',
                  transition: 'background 200ms, border-color 200ms',
                }}>
                  {/* Barcode icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" flexShrink="0"
                    style={{ flexShrink: 0, transition: 'opacity 200ms', opacity: inputFocused ? 1 : 0.5 }}>
                    <rect x="2"    y="4" width="3"   height="16" rx="0.5" fill={inputFocused ? '#16A34A' : '#9B9890'}/>
                    <rect x="7"    y="4" width="1.5" height="16" rx="0.5" fill={inputFocused ? '#16A34A' : '#9B9890'}/>
                    <rect x="10.5" y="4" width="2.5" height="16" rx="0.5" fill={inputFocused ? '#16A34A' : '#9B9890'}/>
                    <rect x="15"   y="4" width="1.5" height="16" rx="0.5" fill={inputFocused ? '#16A34A' : '#9B9890'}/>
                    <rect x="18.5" y="4" width="3"   height="16" rx="0.5" fill={inputFocused ? '#16A34A' : '#9B9890'}/>
                  </svg>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 8901058155018"
                    value={manualBarcode}
                    onChange={handleManualChange}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    style={{
                      flex: 1, background: 'none', border: 'none', outline: 'none',
                      color: '#1A1916', fontSize: '14px', fontFamily: 'Inter, sans-serif',
                    }}
                  />

                  {manualBarcode && (
                    <button
                      type="button"
                      onClick={() => { setManualBarcode(''); setValidationMsg(null) }}
                      style={{
                        background: '#D5D0C3', border: 'none', borderRadius: '50%',
                        width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6B6760', fontSize: '13px', lineHeight: 1,
                      }}
                    >×</button>
                  )}
                </div>

                {/* Arrow submit button */}
                <button
                  type="submit"
                  disabled={!manualBarcode}
                  style={{
                    height: '50px', width: '50px', flexShrink: 0,
                    background: manualBarcode ? '#16A34A' : '#E8E4D8',
                    border: 'none', borderRadius: '13px',
                    color: manualBarcode ? '#FFFFFF' : '#9B9890',
                    fontSize: '22px', fontWeight: 700,
                    cursor: manualBarcode ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 150ms, color 150ms',
                  }}
                  onMouseDown={e => { if (manualBarcode) e.currentTarget.style.transform = 'scale(0.94)' }}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  →
                </button>
              </div>

              {validationMsg && (
                <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '7px', paddingLeft: '2px' }}>
                  {validationMsg}
                </p>
              )}
            </form>
          </>
        ) : (
          <ImageUploader onImage={handleImage} />
        )}
      </div>
    </div>
  )
}
