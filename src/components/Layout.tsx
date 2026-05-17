import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import './Layout.css'

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/fcff-simple', label: 'DCF Simple' },
  { path: '/fcff-full', label: 'DCF Full' },
  { path: '/high-growth', label: 'High Growth' },
  { path: '/wacc', label: 'WACC' },
  { path: '/model-selector', label: 'Model Pick' },
  { path: '/implied-roc-roe', label: 'ROC/ROE' },
  { path: '/implied-erp', label: 'ERP' },
  { path: '/rd-converter', label: 'R&D' },
  { path: '/operating-lease', label: 'Lease' },
  { path: '/normalized-earnings', label: 'Normalize' },
]

export default function Layout() {
  const { pathname } = useLocation()
  const currentLabel = NAV_ITEMS.find(i => i.path === pathname)?.label
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="app-layout">
      <nav className="global-nav">
        <div className="global-nav-inner">
          <Link to="/" className="nav-logo">Damodaran</Link>
          <div className="nav-links">
            {NAV_ITEMS.slice(1).map(item => (
              <Link key={item.path} to={item.path} className={`nav-link ${pathname === item.path ? 'active' : ''}`}>
                {item.label}
              </Link>
            ))}
          </div>
          <button className="nav-menu-btn" aria-label="Menu" onClick={() => setDrawerOpen(!drawerOpen)}>&#9776;</button>
        </div>
      </nav>

      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}
      <aside className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Link to="/" className="nav-logo" onClick={() => setDrawerOpen(false)}>Damodaran</Link>
          <button className="drawer-close-btn" aria-label="Close" onClick={() => setDrawerOpen(false)}>&times;</button>
        </div>
        <nav className="drawer-nav">
          {NAV_ITEMS.map(item => (
            <Link key={item.path} to={item.path} className={`drawer-link ${pathname === item.path ? 'active' : ''}`} onClick={() => setDrawerOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {pathname !== '/' && currentLabel && (
        <div className="page-title-bar">
          <div className="page-title-inner">
            <Link to="/" className="page-title-back">Home</Link>
            <span className="page-title-sep">/</span>
            <span className="page-title-current">{currentLabel}</span>
          </div>
        </div>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <p>Based on Aswath Damodaran's valuation spreadsheets. For educational purposes only.</p>
          <p className="footer-legal">Formulas sourced from NYU Stern spreadsheets. Not financial advice.</p>
        </div>
      </footer>
    </div>
  )
}
