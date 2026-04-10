import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { scanBarcode, getHealthProfile } from '../utils/api'
import LoadingState from '../components/LoadingState'

export default function Search() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15&fields=code,product_name,brands,quantity,image_front_url`
        const res = await fetch(url)
        const data = await res.json()
        setResults((data.products || []).filter(p => p.code && p.product_name))
      } catch {
        setError('Search failed. Check your connection.')
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  async function handleSelect(product) {
    setLoading(true)
    setError(null)
    try {
      const profile = getHealthProfile()
      const result = await scanBarcode(product.code, profile)
      if (!result.found) { navigate('/not-found'); return }
      navigate('/result', { state: result })
    } catch {
      setError('Could not reach server.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F2EB' }}>
        <LoadingState />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EB', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px', background: '#FFFFFF',
        borderBottom: '1px solid #E8E4D8',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#F5F2EB', border: '1.5px solid #E8E4D8', borderRadius: '12px',
          padding: '0 14px', height: '46px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B9890" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search food products…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#1A1916', fontSize: '14px', fontFamily: 'Inter, sans-serif',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: '#E8E4D8', border: 'none', borderRadius: '50%',
                width: '20px', height: '20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6B6760', fontSize: '14px', lineHeight: 1, flexShrink: 0,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          margin: '12px 16px 0',
          background: '#FEE2E2', border: '1px solid #FECACA',
          borderRadius: '10px', padding: '12px 14px', color: '#DC2626', fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* Status */}
      {query.length >= 2 && (
        <p style={{ color: '#9B9890', fontSize: '12px', padding: '10px 16px 4px', margin: 0 }}>
          {searching ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E8E4D8',
          margin: '8px 16px', borderRadius: '16px', overflow: 'hidden',
        }}>
          {results.map((product, i) => (
            <div
              key={product.code}
              onClick={() => handleSelect(product)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid #F5F2EB' : 'none',
                transition: 'background 130ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: '#F5F2EB', flexShrink: 0, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {product.image_front_url
                  ? <img src={product.image_front_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ color: '#C5C2BA', fontSize: '18px', fontWeight: 700 }}>?</span>
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  color: '#1A1916', fontSize: '14px', fontWeight: 600, margin: '0 0 2px 0',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {product.product_name}
                </p>
                <p style={{ color: '#9B9890', fontSize: '12px', margin: 0 }}>
                  {[product.brands, product.quantity].filter(Boolean).join(' · ')}
                </p>
              </div>

              <span style={{ color: '#C5C2BA', fontSize: '18px', flexShrink: 0 }}>›</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {query.length >= 2 && !searching && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 20px' }}>
          <p style={{ color: '#6B6760', fontSize: '14px', margin: '0 0 6px 0' }}>No products found</p>
          <p style={{ color: '#C5C2BA', fontSize: '13px', margin: 0 }}>
            Try a different name or scan the barcode
          </p>
        </div>
      )}

      {/* Initial hint */}
      {query.length === 0 && (
        <div style={{ padding: '48px 20px 0', textAlign: 'center' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: '#DCFCE7', margin: '0 auto 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
          }}>
            🔍
          </div>
          <p style={{ color: '#6B6760', fontSize: '14px', fontWeight: 500 }}>
            Search by product or brand name
          </p>
          <p style={{ color: '#C5C2BA', fontSize: '13px', marginTop: '4px' }}>
            e.g. "Maggi", "Amul", "KitKat"
          </p>
        </div>
      )}

    </div>
  )
}
