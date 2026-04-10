import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Scanner from './pages/Scanner'
import Result from './pages/Result'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Search from './pages/Search'
import BottomNav from './components/BottomNav'

const NO_NAV = ['/scan', '/result', '/not-found']

function Layout() {
  const { pathname } = useLocation()
  const showNav = !NO_NAV.includes(pathname)

  return (
    <>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/scan"      element={<Scanner />} />
        <Route path="/result"    element={<Result />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/search"    element={<Search />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
