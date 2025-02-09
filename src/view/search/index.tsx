import { useEffect, useState, useCallback } from 'react'
import { FiSearch, FiExternalLink } from 'react-icons/fi'
import { db, Link } from '@/services/db'
import { debounce } from 'lodash-es'

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto" onKeyDown={handleKeyDown}>
        {/* 搜索输入框 */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center p-4 border-gray-100">
            <FiSearch className="text-black mr-3" size={20} />
            <input
              type="text"
              className="flex-1 outline-none text-lg text-black placeholder:text-gray-500"
              placeholder="输入书签名称或者网址..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* 搜索结果 */}
          <div className="max-h-[70vh] overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((link, index) => (
                  <div
                    key={link.id}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                      index === selectedIndex ? 'bg-blue-50/70' : ''
                    }`}
                    onClick={() => handleLinkClick(link)}
                  >
                    <FiExternalLink className="text-black" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-black truncate">
                        {link.name}
                      </div>
                      <div className="text-sm text-black truncate">
                        {link.url}
                      </div>
                      {link.notes && (
                        <div className="text-sm text-black/80 truncate">
                          {link.notes}
                        </div>
                      )}
                    </div>
                    {link.tags.length > 0 && (
                      <div className="flex gap-1">
                        {link.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs text-black bg-gray-100 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="p-4 text-center text-black">
                未找到匹配的链接
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
} 

export default SearchPage