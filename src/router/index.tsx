import { createHashRouter } from 'react-router-dom'
import App from '@/App'
import Home from '@/view/home'
import Settings from '@/view/settings'
import SearchPage from '@/view/search'
import PopupMenu from '@/view/PopupMenu'

export const router = createHashRouter([
  {
    path: '/',
    element: <App><Home /></App>
  },
  {
    path: '/home',
    element: <App><Home /></App>
  },
  {
    path: '/settings',
    element: <App><Settings /></App>
  },
  // 独立页面路由（不需要 App 布局）
  {
    path: '/popup',
    element: <PopupMenu />
  },
  {
    path: '/search',
    element: <SearchPage />
  }
]) 