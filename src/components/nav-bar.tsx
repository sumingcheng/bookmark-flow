import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiSettings } from 'react-icons/fi'
import { cn } from '@/lib/utils'

export function NavBar() {
  const location = useLocation()

  return (
    <nav className="h-12 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full flex items-center justify-end gap-1 px-4">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            "hover:bg-gray-100",
            location.pathname === '/' ? 
              "bg-blue-50 text-blue-600 hover:bg-blue-100" : 
              "text-gray-600"
          )}
        >
          <FiHome className="h-3.5 w-3.5" />
          <span>主页</span>
        </Link>

        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            "hover:bg-gray-100",
            location.pathname === '/settings' ? 
              "bg-blue-50 text-blue-600 hover:bg-blue-100" : 
              "text-gray-600"
          )}
        >
          <FiSettings className="h-3.5 w-3.5" />
          <span>设置</span>
        </Link>
      </div>
    </nav>
  )
} 