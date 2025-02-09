import { SearchDialog } from '@/components/search-dialog'
import { db } from '@/services/db'
import { useEffect } from 'react'

export default function SearchPage() {
  useEffect(() => {
    // 设置窗口标题
    document.title = '搜索书签'
  }, [])

  return (
    <SearchDialog 
      isOpen={true}
      onClose={() => window.close()}
      onLinkClick={async (linkId) => {
        await db.incrementLinkUseCount(linkId)
        window.close() // 点击后关闭窗口
      }}
    />
  )
} 