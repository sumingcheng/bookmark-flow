import { createHashRouter } from 'react-router-dom'
import { BaseLayout } from '@/layouts/BaseLayout'
import Home from '@/view/home'
import Settings from '@/view/settings'
import SearchPage from '@/view/search'
import PopupMenu from '@/view/PopupMenu'

// 工具函数：使用基础布局包装组件
const withBaseLayout = (Component: React.ComponentType) => (
  <BaseLayout>
    <Component />
  </BaseLayout>
)

export const router = createHashRouter([
  {
    path: '/',
    element: withBaseLayout(Home)
  },
  {
    path: '/home',
    element: withBaseLayout(Home)
  },
  {
    path: '/settings',
    element: withBaseLayout(Settings)
  },
  // 独立页面路由（不需要基础布局）
  {
    path: '/popup',
    element: <PopupMenu />
  },
  {
    path: '/search',
    element: <SearchPage />
  }
]) 