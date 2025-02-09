import { SearchDialog } from '@/components/search-dialog'
import { db } from '@/services/db'

export default function SearchPage() {
  return (
    <SearchDialog 
      isOpen={true}  // 在独立页面中始终显示
      onClose={() => window.close()}  // 关闭整个弹窗
      onLinkClick={async (linkId) => {
        await db.incrementLinkUseCount(linkId)
      }}
    />
  )
} 