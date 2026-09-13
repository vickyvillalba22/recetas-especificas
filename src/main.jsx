import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { Header } from './components/home/Header'
import { HomePage } from './pages/HomePage'
import { RecipesPage } from './pages/RecipesPage'
import { JournalPage } from './pages/JournalPage'
import './styles.css'

function AppLayout() {
  const navigate = useNavigate(); const [theme, setTheme] = useState(() => { try { return localStorage.getItem('sibo-theme') || 'light' } catch { return 'light' } }); const [mobileNavOpen, setMobileNavOpen] = useState(false)
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); try { localStorage.setItem('sibo-theme', theme) } catch {} }, [theme])
  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')
  return <><Header theme={theme} mobileNavOpen={mobileNavOpen} onThemeToggle={toggleTheme} onMobileNavToggle={setMobileNavOpen} onCreateRecipe={() => navigate('/recetas')} /><Routes><Route path="/" element={<HomePage />} /><Route path="/recetas" element={<RecipesPage />} /><Route path="/diario" element={<JournalPage />} /><Route path="*" element={<HomePage />} /></Routes></>
}

function App() { return <BrowserRouter><AppLayout /></BrowserRouter> }

createRoot(document.getElementById('root')).render(<App />)
