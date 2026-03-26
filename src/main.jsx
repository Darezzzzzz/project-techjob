import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// ปิด hydration warning
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Hydration')) {
      return;
    }
    originalError.call(console, ...args);
  };
}

createRoot(document.getElementById('root')).render(<App />)