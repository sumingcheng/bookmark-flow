import { ContextMenuItem, ContextMenuRoot } from '@/components/ui/context-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import type { Folder } from '@/services/db'
import { useState } from 'react'
import { useDrop } from 'react-dnd'
import { FiEdit2, FiFolder, FiPlus, FiTrash2 } from 'react-icons/fi'

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
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">位置</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                    <FiPlus size={20} />
                    <span className="text-sm">新建位置</span>
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
  const [newName, setNewName] = useState(folder.name)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'link',
    drop: (item: { id: string }) => onDrop(folder.id, item.id),
    collect: monitor => ({
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