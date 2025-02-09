import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Link } from '@/services/db'
import { useDrag } from 'react-dnd'
import { FiDownload, FiEdit2, FiFilter, FiLink, FiTrash2 } from 'react-icons/fi'

interface LinkListProps {
  links: Link[]
  isLoading: boolean
  sortBy: 'createdAt' | 'useCount'
  selectedTags: string[]
  allTags: string[]
  onSortChange: (sort: 'createdAt' | 'useCount') => void
  onTagSelect: (tag: string) => void
  onTagsClear: () => void
  onImport: () => void
  onEdit: (link: Link) => void
  onDelete: (id: string) => void
}

export function LinkList({
  links,
  isLoading,
  sortBy,
  selectedTags,
  allTags,
  onSortChange,
  onTagSelect,
  onTagsClear,
  onImport,
  onEdit,
  onDelete
}: LinkListProps) {
  return (
    <div className="flex-1 bg-white">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">链接库</h2>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  sortBy === 'createdAt' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => onSortChange('createdAt')}
              >
                按时间
              </button>
              <button
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  sortBy === 'useCount' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => onSortChange('useCount')}
              >
                按使用频率
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                onClick={onImport}
              >
                <FiDownload /> 导入书签
              </button>
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">标签过滤</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`px-2 py-1 text-sm rounded-md transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => onTagSelect(tag)}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                    onClick={onTagsClear}
                  >
                    清除
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-5 w-5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : links.length > 0 ? (
              links.map(link => (
                <LinkItem
                  key={link.id}
                  link={link}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                暂无链接
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

interface LinkItemProps {
  link: Link
  onEdit: (link: Link) => void
  onDelete: (id: string) => void
}

function LinkItem({ link, onEdit, onDelete }: LinkItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'link',
    item: { id: link.id },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }))

  return (
    <TooltipProvider>
      <div
        ref={drag}
        className={`group flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FiLink className="text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-medium text-gray-800 truncate">
                  {link.name}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                {link.name}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm text-gray-500 truncate">
                  {link.url}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                {link.url}
              </TooltipContent>
            </Tooltip>
            {link.notes && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm text-gray-400 truncate">
                    {link.notes}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {link.notes}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {link.tags.length > 0 && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex gap-1 flex-shrink-0">
              {link.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>
    </TooltipProvider>
  )
} 