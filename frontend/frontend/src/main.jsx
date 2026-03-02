import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CreditProvider } from "./context/CreditContext"
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CreditProvider>
      <App />
    </CreditProvider>
  </StrictMode>,
)
