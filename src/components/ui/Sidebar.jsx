import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  Menu,
  X,
  Home,
  MessageSquare,
  Users,
  Settings,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react'

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, isDark, toggleTheme }) => {
  const location = useLocation()

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Campanhas', path: '/campaigns' },
    { icon: Users, label: 'Grupos', path: '/groups' },
    { icon: FileText, label: 'Logs', path: '/logs' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // Close mobile sidebar when clicking on a link
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }

  // Handle click outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar')
        if (sidebar && !sidebar.contains(event.target)) {
          setIsOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setIsOpen])

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        id="sidebar"
        className={`
          fixed top-0 left-0 z-50 h-full
          bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  WhatsApp
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Sender
                </span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Collapse Toggle - Desktop only */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden lg:flex"
              title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Close Button - Mobile only */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
              title="Fechar menu"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg
                  transition-all duration-200 ease-in-out
                  ${active 
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-4 border-blue-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center lg:px-2' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`
                  h-5 w-5 flex-shrink-0
                  ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}
                  ${isCollapsed ? '' : 'mr-3'}
                `} />
                {!isCollapsed && (
                  <span className="truncate">
                    {item.label}
                  </span>
                )}
                {!isCollapsed && active && (
                  <div className="ml-auto">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3">
              <div className="text-xs">
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  WhatsApp Sender v1.0
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Evolution API Integration
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Footer */}
        {isCollapsed && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar