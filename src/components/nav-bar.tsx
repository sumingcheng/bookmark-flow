import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiSettings } from 'react-icons/fi'

export function NavBar() {
  const location = useLocation()

  return (
    <nav className="h-14 border-b bg-white">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              location.pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiHome />
            <span>主页</span>
          </Link>
          <Link
            to="/settings"
            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              location.pathname === '/settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiSettings />
            <span>设置</span>
          </Link>
        </div>
      </div>
    </nav>
  )
} 