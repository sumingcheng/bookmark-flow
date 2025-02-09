import { Badge } from '@/components/ui/badge'
import { ContextMenuItem, ContextMenuRoot } from '@/components/ui/context-menu'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { importChromeBookmarks } from '@/services/bookmarks'
import type { Folder, Link } from '@/services/db'
import { db } from '@/services/db'
import { hotkeys } from '@/services/hotkeys'
import { fetchPageTitle } from '@/utils/fetch-title'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import toast from 'react-hot-toast'
import { FiDownload, FiEdit2, FiFilter, FiFolder, FiLink, FiPlus, FiTrash2 } from 'react-icons/fi'

// 添加拖拽类型常量
const ItemTypes = {
  LINK: 'link'
} as const

interface DragItem {
  id: string
  type: typeof ItemTypes.LINK
}

export default function Home() {
  const [links, setLinks] = useState<Link[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [sortBy, setSortBy] = useState<'createdAt' | 'useCount'>('createdAt')
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 加载初始数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [loadedLinks, loadedFolders] = await Promise.all([
          db.getAllLinks(),
          db.getAllFolders()
        ])
        setLinks(loadedLinks)
        setFolders(loadedFolders)
      } catch (error) {
        toast.error('加载数据失败')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // 加载所有标签
  useEffect(() => {
    const tags = links.reduce((acc, link) => {
      link.tags.forEach(tag => {
        if (!acc.includes(tag)) {
          acc.push(tag)
        }
      })
      return acc
    }, [] as string[])
    setAllTags(tags)
  }, [links])

  // 添加新链接
  const handleAddLink = async (url: string) => {
    try {
      // 尝试获取网页标题
      const title = await fetchPageTitle(url)
      
      const newLink: Link = {
        id: nanoid(),
        name: title,
        url,
        tags: [],
        createdAt: Date.now(),
        useCount: 0
      }
      await db.addLink(newLink)
      setLinks(prev => [...prev, newLink])
      toast.success('添加链接成功')
    } catch (error) {
      toast.error('添加链接失败')
    }
  }

  // 修改链接处理函数
  const handleSaveLink = async (updatedLink: Link) => {
    try {
      await db.updateLink(updatedLink.id, updatedLink)
      setLinks(links.map(link => 
        link.id === updatedLink.id ? updatedLink : link
      ))
      toast.success('更新链接成功')
    } catch (error) {
      toast.error('更新链接失败')
    }
  }

  // 添加文件夹
  const handleAddFolder = async (parentId?: string) => {
    try {
      const newFolder: Folder = {
        id: nanoid(),
        name: '新建文件夹',
        parentId,
        children: [],
        links: []
      }
      await db.addFolder(newFolder)
      setFolders(prev => [...prev, newFolder])
      toast.success('创建文件夹成功')
    } catch (error) {
      toast.error('创建文件夹失败')
    }
  }

  // 重命名文件夹
  const handleRename = async (folderId: string, newName: string) => {
    try {
      await db.updateFolder(folderId, { name: newName })
      setFolders(folders.map(folder => 
        folder.id === folderId ? { ...folder, name: newName } : folder
      ))
      toast.success('重命名成功')
    } catch (error) {
      toast.error('重命名失败')
    }
  }

  // 拖拽链接到文件夹
  const handleDrop = async (folderId: string, linkId: string) => {
    try {
      const folder = folders.find(f => f.id === folderId)
      if (folder && !folder.links.includes(linkId)) {
        const updatedFolder: Folder = {
          ...folder,
          links: [...folder.links, linkId]
        }
        await db.updateFolder(folderId, updatedFolder)
        setFolders(folders.map(f => 
          f.id === folderId ? updatedFolder : f
        ))
        toast.success('移动链接成功')
      }
    } catch (error) {
      toast.error('移动链接失败')
    }
  }

  // 更新链接使用次数
  const handleLinkClick = async (linkId: string) => {
    try {
      await db.incrementLinkUseCount(linkId)
      const updatedLinks = await db.getAllLinks()
      setLinks(updatedLinks)
    } catch (error) {
      console.error('更新使用次数失败:', error)
    }
  }

  // 删除链接
  const handleDeleteLink = async (linkId: string) => {
    if (!window.confirm('确定要删除这个链接吗？')) return

    try {
      await db.deleteLink(linkId)
      setLinks(links.filter(link => link.id !== linkId))
      // 更新文件夹中的链接引用
      const updatedFolders = folders.map(folder => ({
        ...folder,
        links: folder.links.filter(id => id !== linkId)
      }))
      await Promise.all(
        updatedFolders.map(folder => db.updateFolder(folder.id, folder))
      )
      setFolders(updatedFolders)
      toast.success('链接已删除')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  // 删除文件夹
  const handleDeleteFolder = async (folderId: string) => {
    if (!window.confirm('确定要删除这个文件夹吗？')) return

    try {
      // 递归获取所有子文件夹ID
      const getChildFolderIds = (parentId: string): string[] => {
        const children = folders
          .filter(f => f.parentId === parentId)
          .map(f => f.id)
        return [
          ...children,
          ...children.flatMap(childId => getChildFolderIds(childId))
        ]
      }

      const folderIds = [folderId, ...getChildFolderIds(folderId)]
      
      // 删除文件夹及其子文件夹
      await Promise.all(folderIds.map(id => db.deleteFolder(id)))
      setFolders(folders.filter(f => !folderIds.includes(f.id)))
      toast.success('文件夹已删除')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  // 导入书签
  const handleImportBookmarks = async () => {
    try {
      const bookmarks = await importChromeBookmarks()
      // 批量添加到数据库
      await Promise.all(bookmarks.map(link => db.addLink(link)))
      // 更新状态
      setLinks(prev => [...prev, ...bookmarks])
      toast.success(`成功导入 ${bookmarks.length} 个书签`)
    } catch (error) {
      toast.error('导入书签失败')
    }
  }

  const sortedLinks = [...links].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return b.createdAt - a.createdAt
    }
    return b.useCount - a.useCount
  })

  // 过滤链接
  const filteredLinks = sortedLinks.filter(link => 
    selectedTags.length === 0 || 
    selectedTags.every(tag => link.tags.includes(tag))
  )

  useEffect(() => {
    // 注册快捷键
    hotkeys.registerShortcut({
      key: 'n',
      ctrl: true,
      alt: true,
      shift: false,
      description: '新建链接',
      callback: () => {

        const url = prompt('请输入链接地址')
        if (url) handleAddLink(url)
      }
    })

    hotkeys.registerShortcut({
      key: 'f',
      ctrl: true,
      alt: true,
      shift: false,
      description: '新建文件夹',
      callback: () => handleAddFolder()
    })

    return () => {
      hotkeys.unregisterShortcut('n')
      hotkeys.unregisterShortcut('f')
    }
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* 文件夹区域 (上方) */}
        <div className="h-2/5 min-h-[300px] bg-white border-b">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">位置</h2>
                <button
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  onClick={() => handleAddFolder()}
                >
                  <FiPlus /> 新建
                </button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {isLoading ? (
                    // 骨架屏
                    Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="aspect-square border rounded-lg p-4 flex flex-col items-center justify-center gap-2">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))
                  ) : folders.filter(folder => !folder.parentId).length > 0 ? (
                    folders
                      .filter(folder => !folder.parentId)
                      .map(folder => (
                        <FolderItem
                          key={folder.id}
                          folder={folder}
                          folders={folders}
                          level={0}
                          onDrop={handleDrop}
                          onRename={handleRename}
                          onDelete={handleDeleteFolder}
                        />
                      ))
                  ) : (
                    <button
                      onClick={() => handleAddFolder()}
                      className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                    >
                      <FiPlus size={24} />
                      <span>点击创建新位置</span>
                    </button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* 链接库区域 (下方) */}
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
                    onClick={() => setSortBy('createdAt')}
                  >
                    按时间
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      sortBy === 'useCount' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setSortBy('useCount')}
                  >
                    按使用频率
                  </button>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    onClick={handleImportBookmarks}
                  >
                    <FiDownload /> 导入书签
                  </button>
                </div>
              </div>

              {/* 标签过滤器 */}
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
                        onClick={() => {
                          setSelectedTags(prev =>
                            prev.includes(tag)
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          )
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                    {selectedTags.length > 0 && (
                      <button
                        className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                        onClick={() => setSelectedTags([])}
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
                  // 骨架屏
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
                ) : filteredLinks.length > 0 ? (
                  filteredLinks.map(link => (
                    <LinkItem
                      key={link.id}
                      link={link}
                      onEdit={setEditingLink}
                      onDelete={handleDeleteLink}
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

        <LinkEditDialog
          link={editingLink}
          isOpen={!!editingLink}
          onClose={() => setEditingLink(null)}
          onSave={handleSaveLink}
        />
      </div>
    </DndProvider>
  )
}

// 链接项组件
function LinkItem({
  link,
  onEdit,
  onDelete
}: {
  link: Link
  onEdit: (link: Link) => void
  onDelete: (id: string) => void
}) {
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>(() => ({
    type: ItemTypes.LINK,
    item: { id: link.id, type: ItemTypes.LINK },
    collect: (monitor) => ({
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
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(link)
                }}
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
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(link.id)
                }}
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

// 文件夹项组件
function FolderItem({
  folder,
  folders,
  level,
  onDrop,
  onRename,
  onDelete
}: {
  folder: Folder
  folders: Folder[]
  level: number
  onDrop: (folderId: string, linkId: string) => void
  onRename: (folderId: string, newName: string) => void
  onDelete: (folderId: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(folder.name)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.LINK,
    drop: (item: { id: string }) => {
      onDrop(folder.id, item.id)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  const handleRename = () => {
    if (newName.trim() && newName.length <= 20) {
      onRename(folder.id, newName.trim())
      setIsEditing(false)
    }
  }

  return (
    <ContextMenuRoot
      content={
        <>
          <ContextMenuItem
            className="flex items-center px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
            onSelect={() => setIsEditing(true)}
          >
            <FiEdit2 className="mr-2" size={14} />
            重命名
          </ContextMenuItem>
          <ContextMenuItem
            className="flex items-center px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            onSelect={() => onDelete(folder.id)}
          >
            <FiTrash2 className="mr-2" size={14} />
            删除
          </ContextMenuItem>
        </>
      }
    >
      <div
        ref={drop}
        className={`w-24 h-24 border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-colors ${
          isOver ? 'bg-blue-50' : 'hover:bg-gray-50'
        }`}
      >
        {isEditing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="w-full px-2 py-1 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            maxLength={20}
            autoFocus
          />
        ) : (
          <>
            <FiFolder className="w-8 h-8 text-blue-500" />
            <span 
              className="text-gray-700 text-center truncate w-full text-sm" 
              onDoubleClick={() => setIsEditing(true)}
            >
              {folder.name}
            </span>
          </>
        )}
      </div>
    </ContextMenuRoot>
  )
}

// 添加链接编辑对话框组件
function LinkEditDialog({
  link,
  isOpen,
  onClose,
  onSave
}: {
  link: Link | null
  isOpen: boolean
  onClose: () => void
  onSave: (link: Link) => void
}) {
  const [editedLink, setEditedLink] = useState<Link | null>(null)

  useEffect(() => {
    setEditedLink(link)
  }, [link])

  if (!editedLink) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>编辑链接</DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名称
            </label>
            <input
              type="text"
              value={editedLink.name}
              onChange={(e) => setEditedLink({ ...editedLink, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              value={editedLink.notes || ''}
              onChange={(e) => setEditedLink({ ...editedLink, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标签 (最多2个)
            </label>
            <div className="flex gap-2">
              {editedLink.tags.map((tag, index) => (
                <input
                  key={index}
                  type="text"
                  value={tag}
                  onChange={(e) => {
                    const newTags = [...editedLink.tags]
                    newTags[index] = e.target.value
                    setEditedLink({ ...editedLink, tags: newTags })
                  }}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={10}
                />
              ))}
              {editedLink.tags.length < 2 && (
                <button
                  onClick={() => setEditedLink({ ...editedLink, tags: [...editedLink.tags, ''] })}
                  className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  添加标签
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => {
              onSave(editedLink)
              onClose()
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
