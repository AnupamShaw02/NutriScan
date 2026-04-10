import { useRef, useState } from 'react'

export default function ImageUploader({ onImage }) {
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      // Resize to max 1024px on longest side to keep payload small
      const MAX = 1024
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX }
        else { width = Math.round((width * MAX) / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      const base64 = canvas.toDataURL('image/jpeg', 0.85)
      setPreview(base64)
      onImage(base64)
    }
    img.src = objectUrl
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {preview ? (
        <div>
          <img
            src={preview}
            alt="Selected"
            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '12px', border: '1px solid #E5E1D6', display: 'block', marginBottom: '12px' }}
          />
          <button
            onClick={() => { setPreview(null); inputRef.current.value = '' }}
            style={{
              width: '100%', height: '44px', background: '#fff',
              border: '1px solid #E5E1D6', borderRadius: '12px',
              color: '#6B6760', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              transition: 'border-color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#CFC9BC'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E1D6'}
          >
            Choose a different image
          </button>
        </div>
      ) : (
        <div
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current.click()}
          style={{
            border: `1.5px dashed ${dragging ? '#16A34A' : '#CFC9BC'}`,
            borderRadius: '12px', padding: '48px 24px',
            textAlign: 'center', cursor: 'pointer',
            background: dragging ? '#F0FDF4' : '#fff',
            transition: 'all 150ms',
          }}
        >
          {/* Camera icon */}
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F7F4EE', border: '1px solid #E5E1D6', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>

          <p style={{ fontSize: '15px', fontWeight: 700, color: '#1C1917', margin: '0 0 6px 0' }}>
            Take a photo or upload
          </p>
          <p style={{ fontSize: '13px', color: '#A8A29E', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Point at the front of the packaging. Our AI reads the label.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F7F4EE', border: '1px solid #E5E1D6', borderRadius: '8px', padding: '6px 14px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#6B6760' }}>Choose file</span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={e => handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </div>
  )
}
