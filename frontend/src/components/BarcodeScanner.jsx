import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function BarcodeScanner({ onScan }) {
  const scannerRef = useRef(null)
  const onScanRef  = useRef(onScan)
  onScanRef.current = onScan

  useEffect(() => {
    if (scannerRef.current) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        useBarCodeDetectorIfSupported: true,
      },
      false
    )

    scanner.render(
      (text) => {
        if (navigator.vibrate) navigator.vibrate(50)
        scanner.clear().catch(() => {})
        scannerRef.current = null
        onScanRef.current(text)
      },
      () => {}
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
          background: #16A34A !important;
          border: none !important;
          border-radius: 8px !important;
          color: #FFFFFF !important;
          padding: 8px 18px !important;
          font-family: Inter, sans-serif !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          cursor: pointer !important;
        }
        #qr-reader__camera_selection {
          background: #F7F4EE !important;
          border: 1px solid #E5E1D6 !important;
          color: #1C1917 !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          width: 100% !important;
          margin-bottom: 8px !important;
          font-family: Inter, sans-serif !important;
          font-size: 13px !important;
        }
        #qr-reader__status_span {
          color: #A8A29E !important;
          font-size: 12px !important;
          font-family: Inter, sans-serif !important;
        }
        #qr-reader__torch_button {
          background: #F7F4EE !important;
          border: 1px solid #E5E1D6 !important;
          border-radius: 8px !important;
          color: #1C1917 !important;
          padding: 6px 12px !important;
          margin-left: 8px !important;
          font-family: Inter, sans-serif !important;
          font-size: 13px !important;
        }
        #qr-reader img[alt="Info icon"] { display: none !important; }
        #qr-reader__header_message { display: none !important; }
      `}</style>
    </div>
  )
}
