import { ContextMenuItem, ContextMenuRoot } from '@/components/ui/context-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import type { Folder } from '@/services/db'
import { useState } from 'react'
import { useDrop } from 'react-dnd'
import { FiEdit2, FiFolder, FiTrash2 } from 'react-icons/fi'

interface FolderGridProps {
  folders: Folder[]
  isLoading: boolean
  onAddFolder: () => void
  onRename: (folderId: string, newName: string) => void
  onDelete: (folderId: string) => void
  onDrop: (folderId: string, linkId: string) => void
}

export function FolderGrid({
  folders,
  isLoading,
  onAddFolder,
  onRename,
  onDelete,
  onDrop
}: FolderGridProps) {
  return (
    <div className="h-2/5 min-h-[300px] bg-white border-b">
      <div className="h-full flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="flex flex-wrap gap-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="w-24 h-24 border rounded-lg p-4 flex flex-col items-center justify-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : (
                <>
                  {folders.map(folder => (
                    <FolderItem
                      key={folder.id}
                      folder={folder}
                      onDrop={onDrop}
                      onRename={onRename}
                      onDelete={onDelete}
                    />
                  ))}
                  <button
                    onClick={onAddFolder}
                    className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                  >
                    <FiFolder className="w-8 h-8" />
                    <span className="text-sm">新建文件夹</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

interface FolderItemProps {
  folder: Folder
  onDrop: (folderId: string, linkId: string) => void
  onRename: (folderId: string, newName: string) => void
  onDelete: (folderId: string) => void
}

function FolderItem({ folder, onDrop, onRename, onDelete }: FolderItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editInput, setEditInput] = useState<HTMLInputElement | null>(null)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'link',
    drop: (item: { id: string }) => onDrop(folder.id, item.id),
    collect: monitor => ({
      isOver: monitor.isOver()
    })
  }))

  const handleStartEdit = () => {
    setIsEditing(true)
    // 等待 DOM 更新后聚焦并选中文本
    setTimeout(() => {
      if (editInput) {
        editInput.value = folder.name
        editInput.focus()
        editInput.select()
      }
    }, 0)
  }

  const handleFinishEdit = () => {
    if (editInput && editInput.value.trim() && editInput.value !== folder.name) {
      onRename(folder.id, editInput.value.trim())
    }
    setIsEditing(false)
  }

  return (
    <ContextMenuRoot
      content={
        <>
          <ContextMenuItem
            className="flex items-center px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
            onSelect={handleStartEdit}
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
        <FiFolder className="w-8 h-8 text-blue-500" />
        {isEditing ? (
          <input
            ref={setEditInput}
            type="text"
            className="w-full px-2 py-1 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            maxLength={20}
            onBlur={handleFinishEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFinishEdit()
              } else if (e.key === 'Escape') {
                setIsEditing(false)
              }
            }}
          />
        ) : (
          <span 
            className="text-gray-700 text-center truncate w-full text-sm" 
            onDoubleClick={handleStartEdit}
          >
            {folder.name}
          </span>
        )}
      </div>
    </ContextMenuRoot>
  )
} 