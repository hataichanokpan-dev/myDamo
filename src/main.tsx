import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ValuationCaseProvider } from './context/ValuationCaseContext'
import './styles/tokens.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ValuationCaseProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ValuationCaseProvider>
  </React.StrictMode>,
)
