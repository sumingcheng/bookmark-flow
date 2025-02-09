import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import type { Link } from '@/services/db'
import { useEffect, useState } from 'react'

interface LinkEditDialogProps {
  link: Link | null
  isOpen: boolean
  onClose: () => void
  onSave: (link: Link) => void
}

export function LinkEditDialog({
  link,
  isOpen,
  onClose,
  onSave
}: LinkEditDialogProps) {
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