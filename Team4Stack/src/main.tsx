import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import App from './App.tsx'
import ErrorBoundary from './components/utilities/ErrorBoundary.tsx'
import { logEnvValidation } from './utils/envValidation.ts'

// Validate environment variables in development
logEnvValidation()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
    <App />
    </ErrorBoundary>
  </StrictMode>,
)
