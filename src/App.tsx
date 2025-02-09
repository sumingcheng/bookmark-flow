import { SearchDialog } from '@/components/search-dialog'
import { db } from '@/services/db'
import { hotkeys } from '@/services/hotkeys'
import { useEffect, useState } from 'react'
import { useRoutes } from 'react-router-dom'
import { routes } from '@/router'

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const element = useRoutes(routes)

  useEffect(() => {
    hotkeys.init().then(() => {
      hotkeys.setSearchCallback(() => setIsSearchOpen(true))
      hotkeys.enable()
    })

    return () => {
      hotkeys.disable()
    }
  }, [])

  return (
    <div className="min-h-full h-full bg-gray-50">
      {element}

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onLinkClick={async (linkId) => {
          try {
            await db.incrementLinkUseCount(linkId)
          } catch (error) {
            console.error('更新使用次数失败:', error)
          }
        }}
      />
    </div>
  )
}

export default App
