import { RouteObject } from 'react-router-dom'
import Home from '@/view/home'
import Settings from '@/view/settings'
import { PopupMenu } from '@/view/PopupMenu'

export const routes: RouteObject[] = [
  {
    path: '/popup',
    element: <PopupMenu />
  },
  {
    path: '/manager',
    element: <Home />
  },
  {
    path: '/settings',
    element: <Settings />
  },
  {
    path: '/',
    element: <Home />
  }
] 