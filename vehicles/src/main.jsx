import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import DriversContextProvider from './context/DriversContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <DriversContextProvider>
      <App />
    </DriversContextProvider>
  </BrowserRouter>,
)
