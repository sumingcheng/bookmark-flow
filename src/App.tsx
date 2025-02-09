import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '@/view/home'
import Settings from '@/view/settings'
import { SearchDialog } from '@/components/search-dialog'
import { hotkeys } from '@/services/hotkeys'
import { db } from '@/services/db'

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleLinkClick = async (linkId: string) => {
    try {
      await db.incrementLinkUseCount(linkId)
    } catch (error) {
      console.error('更新使用次数失败:', error)
    }
  }

  useEffect(() => {
    // 初始化快捷键管理器
    hotkeys.init().then(() => {
      hotkeys.setCallback(() => setIsSearchOpen(true))
      hotkeys.enable()
    })

    return () => {
      hotkeys.disable()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onLinkClick={handleLinkClick}
      />
    </div>
  )
}
