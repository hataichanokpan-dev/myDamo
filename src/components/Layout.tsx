import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import Icon from './Icon'
import './Layout.css'

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/fcff-simple', label: 'DCF Simple', icon: 'chart' },
  { path: '/fcff-full', label: 'DCF Full', icon: 'layers' },
  { path: '/high-growth', label: 'High Growth', icon: 'rocket' },
  { path: '/wacc', label: 'WACC', icon: 'gauge' },
  { path: '/model-selector', label: 'Model Pick', icon: 'compass' },
  { path: '/implied-roc-roe', label: 'ROC/ROE', icon: 'trendingUp' },
  { path: '/implied-erp', label: 'ERP', icon: 'percent' },
  { path: '/rd-converter', label: 'R&D', icon: 'beaker' },
  { path: '/operating-lease', label: 'Lease', icon: 'fileText' },
  { path: '/normalized-earnings', label: 'Normalize', icon: 'repeat' },
]

export default function Layout() {
  const { pathname } = useLocation()
  const currentLabel = NAV_ITEMS.find(i => i.path === pathname)?.label
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="app-layout">
      <nav className="global-nav">
        <div className="global-nav-inner">
          <Link to="/" className="nav-logo">
            <Icon name="chart" size="md" />
            <span>Damodaran</span>
          </Link>
          <div className="nav-links">
            {NAV_ITEMS.slice(1).map(item => (
              <Link key={item.path} to={item.path} className={`nav-link ${pathname === item.path ? 'active' : ''}`}>
                <Icon name={item.icon as any} size="sm" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <button className="nav-menu-btn" aria-label="Menu" onClick={() => setDrawerOpen(!drawerOpen)}>
            <Icon name="menu" size="md" />
          </button>
        </div>
      </nav>

      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}
      <aside className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Link to="/" className="nav-logo" onClick={() => setDrawerOpen(false)}>
            <Icon name="chart" size="md" />
            <span>Damodaran</span>
          </Link>
          <button className="drawer-close-btn" aria-label="Close" onClick={() => setDrawerOpen(false)}>
            <Icon name="x" size="md" />
          </button>
        </div>
        <nav className="drawer-nav">
          {NAV_ITEMS.map(item => (
            <Link key={item.path} to={item.path} className={`drawer-link ${pathname === item.path ? 'active' : ''}`} onClick={() => setDrawerOpen(false)}>
              <Icon name={item.icon as any} size="sm" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {pathname !== '/' && currentLabel && (
        <div className="page-title-bar">
          <div className="page-title-inner">
            <Link to="/" className="page-title-back">
              <Icon name="home" size="sm" />
              Home
            </Link>
            <span className="page-title-sep">/</span>
            <span className="page-title-current">{currentLabel}</span>
          </div>
        </div>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="mobile-tabbar" aria-label="Primary mobile navigation">
        {NAV_ITEMS.slice(0, 5).map(item => (
          <Link key={item.path} to={item.path} className={`tabbar-link ${pathname === item.path ? 'active' : ''}`}>
            <Icon name={item.icon as any} size="sm" />
            <span>{item.label}</span>
          </Link>
        ))}
        <button className="tabbar-link tabbar-more" type="button" onClick={() => setDrawerOpen(true)}>
          <Icon name="grid" size="sm" />
          <span>More</span>
        </button>
      </nav>

      <footer className="footer">
        <div className="container footer-inner">
          <p>Based on Aswath Damodaran's valuation spreadsheets. For educational purposes only.</p>
          <p className="footer-legal">Formulas sourced from NYU Stern spreadsheets. Not financial advice.</p>
        </div>
      </footer>
    </div>
  )
}
