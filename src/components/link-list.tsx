import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Link } from '@/services/db'
import { useState } from 'react'
import { useDrag } from 'react-dnd'
import { FiArrowDown, FiArrowUp, FiDownload, FiEdit2, FiLink, FiLoader, FiSearch, FiTrash2 } from 'react-icons/fi'

interface LinkListProps {
  links: Link[]
  isLoading: boolean
  sortBy: 'createdAt' | 'useCount'
  sortDirection: 'asc' | 'desc'
  onSortChange: (sort: 'createdAt' | 'useCount') => void
  onTagSelect: (tag: string) => void
  onTagsClear: () => void
  onImport: () => Promise<void>
  onEdit: (link: Link | null) => void
  onDelete: (linkId: string) => Promise<void>
  onLinkClick: (linkId: string) => Promise<void>
  onSearch: (term: string) => void
  isSearching?: boolean
}

export function LinkList({
  links,
  isLoading,
  sortBy,
  sortDirection,
  onSortChange,
  onTagSelect,
  onTagsClear,
  onImport,
  onEdit,
  onDelete,
  onLinkClick,
  onSearch,
  isSearching = false
}: LinkListProps) {
  const [inputValue, setInputValue] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(inputValue)
  }

  return (
    <div className="h-[50vh] bg-white">
      <div className="h-full flex flex-col">
        <Table>
          <TableHeader className="sticky top-0 bg-white shadow-sm">
            <TableRow>
              <TableHead className="w-[45%] text-left">
                <div className="flex items-center gap-2">
                  <span>名称</span>
                  <div className="flex-1 max-w-xs">
                    <form onSubmit={handleSearch} className="relative">
                      <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                      {isSearching && (
                        <FiLoader className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                      )}
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="搜索书签，回车执行"
                        className="w-full pl-8 pr-8 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </form>
                  </div>
                </div>
              </TableHead>
              <TableHead className="w-[20%] text-left">
                <button
                  onClick={() => onSortChange('createdAt')}
                  className="flex items-center gap-1 hover:text-blue-500"
                >
                  时间
                  {sortBy === 'createdAt' && (
                    sortDirection === 'desc' ? 
                      <FiArrowDown className="h-4 w-4" /> : 
                      <FiArrowUp className="h-4 w-4" />
                  )}
                </button>
              </TableHead>
              <TableHead className="w-[20%] text-left">
                <button
                  onClick={() => onSortChange('useCount')}
                  className="flex items-center gap-1 hover:text-blue-500"
                >
                  使用频率
                  {sortBy === 'useCount' && (
                    sortDirection === 'desc' ? 
                      <FiArrowDown className="h-4 w-4" /> : 
                      <FiArrowUp className="h-4 w-4" />
                  )}
                </button>
              </TableHead>
              <TableHead className="w-[15%] text-left">操作</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <LinkItemSkeleton key={index} />
                ))
              ) : links.length > 0 ? (
                links.map(link => (
                  <LinkItem
                    key={link.id}
                    link={link}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onLinkClick={onLinkClick}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <span>还没有任何链接</span>
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        onClick={onImport}
                      >
                        <FiDownload /> 导入书签
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

function LinkItem({ 
  link, 
  onEdit, 
  onDelete,
  onLinkClick 
}: { 
  link: Link
  onEdit: (link: Link) => void
  onDelete: (id: string) => void
  onLinkClick: (linkId: string) => Promise<void>
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'link',
    item: { id: link.id },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }))

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    await onLinkClick(link.id)
    window.open(link.url, '_blank')
  }

  return (
    <TooltipProvider>
      <TableRow
        ref={drag}
        className={`group ${isDragging ? 'opacity-50' : ''}`}
      >
        <TableCell className="w-[45%]">
          <div className="flex items-center gap-3">
            <FiLink className="flex-shrink-0 text-gray-400" />
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="font-medium text-gray-800 truncate max-w-[400px]">
                    <div onClick={handleClick}>
                      {link.name}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">{link.name}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm text-gray-500 truncate max-w-[400px]">
                    {link.url}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">{link.url}</TooltipContent>
              </Tooltip>
              {link.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {link.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="w-[20%] text-sm text-gray-500">
          {new Date(link.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell className="w-[20%] text-sm text-gray-500">
          {link.useCount} 次
        </TableCell>
        <TableCell className="w-[15%]">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md transition-colors"
                  onClick={() => onEdit(link)}
                >
                  <FiEdit2 size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">编辑</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                  onClick={() => onDelete(link.id)}
                >
                  <FiTrash2 size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">删除</TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>
    </TooltipProvider>
  )
}

function LinkItemSkeleton() {
  return (
    <TableRow>
      <TableCell className="w-[45%]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="w-48 h-4 bg-gray-200 rounded" />
            <div className="w-64 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      </TableCell>
      <TableCell className="w-[20%]">
        <div className="w-20 h-4 bg-gray-200 rounded" />
      </TableCell>
      <TableCell className="w-[20%]">
        <div className="w-16 h-4 bg-gray-200 rounded" />
      </TableCell>
      <TableCell className="w-[15%]">
        <div className="w-16 h-4 bg-gray-200 rounded" />
      </TableCell>
    </TableRow>
  )
} 