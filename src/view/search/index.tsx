import { db, Link } from '@/services/db'
import { debounce } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { FiSearch } from 'react-icons/fi'

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Link[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    document.title = '搜索书签'
  }, [])

  // 使用 debounce 避免过多请求
  const searchLinks = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([])
        return
      }
      const links = await db.searchLinks(query)
      setResults(links)
      setSelectedIndex(0)
    }, 300),
    []
  )

  useEffect(() => {
    searchLinks(searchTerm)
  }, [searchTerm, searchLinks])

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleLinkClick(results[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        window.close()
        break
    }
  }

  const handleLinkClick = async (link: Link) => {
    await db.incrementLinkUseCount(link.id)
    window.open(link.url, '_blank')
    window.close()
  }

  return (
    <div className="fixed inset-0 z-[9999999] bg-black/15">
      <div className="flex items-start justify-center pt-[15vh]">
        <div className="w-full max-w-xl px-4">
          <div onKeyDown={handleKeyDown}>
            {/* 搜索输入框 */}
            <div className="flex items-center p-3 bg-white rounded-lg shadow-lg border border-gray-200">
              <FiSearch className="text-gray-400 mr-3" size={20} />
              <input
                type="text"
                className="flex-1 outline-none text-base"
                placeholder="输入书签名称或者网址..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            {/* 搜索结果 */}
            <div className="mt-2 max-h-[60vh] overflow-y-auto">
              {results.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
                  {results.map((link, index) => (
                    <div
                      key={link.id}
                      className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                        index === selectedIndex ? 'bg-blue-50' : ''
                      } ${index !== 0 ? 'border-t border-gray-100' : ''}`}
                      onClick={() => handleLinkClick(link)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{link.name}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {link.url}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center text-gray-500 mt-4">
                  未找到匹配的链接
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 

export default SearchPage