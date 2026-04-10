import { useRef, useState } from 'react'

export default function ImageUploader({ onImage }) {
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target.result
      setPreview(base64)
      onImage(base64)
    }
    reader.readAsDataURL(file)
  }

  function handleChange(e) { handleFile(e.target.files[0]) }
  function handleDrop(e) { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }

  return (
    <div style={{ padding: '0 20px' }}>
      {preview ? (
        <div style={{ textAlign: 'center' }}>
          <img
            src={preview}
            alt="Selected"
            style={{
              width: '100%', maxHeight: '300px', objectFit: 'contain',
              borderRadius: '16px', border: '1px solid #E8E4D8',
            }}
          />
          <button
            onClick={() => { setPreview(null); inputRef.current.value = '' }}
            style={{
              marginTop: '12px', background: '#FFFFFF',
              border: '1.5px solid #E8E4D8', color: '#6B6760',
              borderRadius: '10px', padding: '8px 20px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500, transition: 'border-color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#D5D0C3'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#E8E4D8'}
          >
            Choose a different image
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current.click()}
          style={{
            border: '2px dashed #D5D0C3', borderRadius: '18px',
            padding: '52px 20px', textAlign: 'center',
            cursor: 'pointer', transition: 'border-color 150ms, background 150ms',
            background: '#FFFFFF',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.background = '#F0FDF4' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#D5D0C3'; e.currentTarget.style.background = '#FFFFFF' }}
        >
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: '#DCFCE7', border: '1px solid #BBF7D0',
            margin: '0 auto 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
          }}>
            📷
          </div>
          <p style={{ color: '#1A1916', fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0' }}>
            Take a photo or upload
          </p>
          <p style={{ color: '#9B9890', fontSize: '13px', margin: 0 }}>
            Point at the front of the product packaging
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}
