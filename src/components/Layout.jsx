import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import Sidebar from './ui/Sidebar'
import Header from './ui/Header'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    // Get user info from token or API
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // Decode token to get user info (basic implementation)
        setUser({ username: 'admin' })
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Main content area */}
      <div className={`
        min-h-screen transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
      `}>
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          user={user}
          onLogout={handleLogout}
        />

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout