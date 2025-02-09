import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Link } from '@/services/db'
import { useDrag } from 'react-dnd'
import { FiArrowDown, FiDownload, FiEdit2, FiLink, FiTrash2 } from 'react-icons/fi'

interface LinkListProps {
  links: Link[]
  isLoading: boolean
  sortBy: 'createdAt' | 'useCount'
  onSortChange: (sort: 'createdAt' | 'useCount') => void
  onTagSelect: (tag: string) => void
  onTagsClear: () => void
  onImport: () => Promise<void>
  onEdit: (link: Link | null) => void
  onDelete: (linkId: string) => Promise<void>
  onLinkClick: (linkId: string) => Promise<void>
}

export function LinkList({
  links,
  isLoading,
  sortBy,
  onSortChange,
  onTagSelect,
  onTagsClear,
  onImport,
  onEdit,
  onDelete,
  onLinkClick
}: LinkListProps) {
  return (
    <div className="flex-1 bg-white">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">名称</TableHead>
                  <TableHead>
                    <button
                      onClick={() => onSortChange('createdAt')}
                      className="flex items-center gap-1 hover:text-blue-500"
                    >
                      时间
                      {sortBy === 'createdAt' && <FiArrowDown className="h-4 w-4" />}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => onSortChange('useCount')}
                      className="flex items-center gap-1 hover:text-blue-500"
                    >
                      使用频率
                      {sortBy === 'useCount' && <FiArrowDown className="h-4 w-4" />}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
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
          </ScrollArea>
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
        <TableCell>
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
        <TableCell className="text-sm text-gray-500">
          {new Date(link.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-sm text-gray-500">
          {link.useCount} 次
        </TableCell>
        <TableCell>
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
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="w-48 h-4 bg-gray-200 rounded" />
            <div className="w-64 h-3 bg-gray-200 rounded" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="w-20 h-4 bg-gray-200 rounded" />
      </TableCell>
      <TableCell>
        <div className="w-16 h-4 bg-gray-200 rounded" />
      </TableCell>
      <TableCell>
        <div className="w-16 h-4 bg-gray-200 rounded" />
      </TableCell>
    </TableRow>
  )
} 