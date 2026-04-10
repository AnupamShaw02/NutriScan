import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { scanBarcode, getHealthProfile } from '../utils/api'
import LoadingState from '../components/LoadingState'

export default function Search() {
  const navigate  = useNavigate()
  const inputRef  = useRef(null)
  const debounce  = useRef(null)

  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [focused,   setFocused]   = useState(false)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    clearTimeout(debounce.current)
    if (query.trim().length < 2) { setResults([]); return }
    debounce.current = setTimeout(async () => {
      setSearching(true)
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15&fields=code,product_name,brands,quantity,image_front_url`
        const res  = await fetch(url)
        const data = await res.json()
        setResults((data.products || []).filter(p => p.code && p.product_name))
      } catch {
        setError('Search failed. Check your connection.')
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(debounce.current)
  }, [query])

  async function handleSelect(product) {
    setLoading(true); setError(null)
    try {
      const result = await scanBarcode(product.code, getHealthProfile())
      if (!result.found) { navigate('/not-found'); return }
      navigate('/result', { state: result })
    } catch {
      setError('Could not reach server.')
      setLoading(false)
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#F7F4EE' }}><LoadingState /></div>

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EE', paddingBottom: '80px' }}>

      {/* Search bar */}
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #E5E1D6', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#F7F4EE', border: `1px solid ${focused ? '#16A34A' : '#E5E1D6'}`,
          borderRadius: '12px', padding: '0 14px', height: '46px',
          transition: 'border-color 150ms',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={focused ? '#16A34A' : '#A8A29E'} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transition: 'stroke 150ms' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search food products..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#1C1917', fontSize: '14px' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]) }}
              style={{ background: '#E5E1D6', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6760', fontSize: '13px', flexShrink: 0 }}>
              x
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ margin: '12px 16px 0', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 14px', color: '#DC2626', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {query.length >= 2 && (
        <p style={{ fontSize: '12px', color: '#A8A29E', padding: '10px 16px 4px', margin: 0 }}>
          {searching ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {results.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E5E1D6', margin: '8px 16px', borderRadius: '12px', overflow: 'hidden' }}>
          {results.map((product, i) => (
            <div key={product.code}
              onClick={() => handleSelect(product)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                cursor: 'pointer', borderBottom: i < results.length - 1 ? '1px solid #F0EDE6' : 'none',
                transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAF8'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#F7F4EE', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E1D6' }}>
                {product.image_front_url
                  ? <img src={product.image_front_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D6D0C8" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.product_name}
                </p>
                <p style={{ fontSize: '12px', color: '#A8A29E', margin: 0 }}>
                  {[product.brands, product.quantity].filter(Boolean).join(' · ')}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D6D0C8" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && !searching && results.length === 0 && (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '6px' }}>No results found</p>
          <p style={{ fontSize: '13px', color: '#A8A29E' }}>Try a different name, or scan the barcode directly.</p>
        </div>
      )}

      {query.length === 0 && (
        <div style={{ padding: '48px 24px 0', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#fff', border: '1px solid #E5E1D6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1C1917', marginBottom: '4px' }}>Search by name or brand</p>
          <p style={{ fontSize: '13px', color: '#A8A29E' }}>Try "Maggi", "Amul", "KitKat"</p>
        </div>
      )}
    </div>
  )
}
