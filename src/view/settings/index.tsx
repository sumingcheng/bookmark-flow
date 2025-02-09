import { NavBar } from '@/components/nav-bar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { importChromeBookmarks } from '@/services/bookmarks'
import { db } from '@/services/db'
import type { ShortcutKeys } from '@/services/hotkeys'
import { hotkeys } from '@/services/hotkeys'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiDownload, FiRefreshCw, FiTrash2, FiUpload } from 'react-icons/fi'

export default function Settings() {
  const [shortcut, setShortcut] = useState<ShortcutKeys>(hotkeys.getShortcut())
  const [isRecording, setIsRecording] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // 处理快捷键记录
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (!isRecording) return

    e.preventDefault()

    // 只记录修饰键(Ctrl/Alt/Shift)和一个普通键
    const modifierCount = Number(e.ctrlKey) + Number(e.altKey) + Number(e.shiftKey)
    if (modifierCount > 2) {
      toast.error('最多支持两个修饰键加一个普通键的组合')
      return
    }

    // 确保至少有一个修饰键
    if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
      toast.error('请至少使用一个修饰键 (Ctrl/Alt/Shift)')
      return
    }

    // 忽略单独的修饰键
    if (['Control', 'Alt', 'Shift'].includes(e.key)) {
      return
    }

    const newShortcut: ShortcutKeys = {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      key: e.key.toUpperCase()
    }

    setShortcut(newShortcut)
    setIsRecording(false)

    try {
      await hotkeys.updateShortcut({
        ...newShortcut,
        description: '打开搜索',
        callback: () => {}
      })
      
      // 发送消息给 background 脚本更新快捷键
      await chrome.runtime.sendMessage({
        type: 'UPDATE_SHORTCUT',
        shortcut: newShortcut
      })
      
      toast.success('快捷键已更新')
    } catch (error) {
      toast.error('保存快捷键失败')
    }
  }

  // 导出配置
  const handleExport = async () => {
    try {
      const [links, folders] = await Promise.all([
        db.getAllLinks(),
        db.getAllFolders()
      ])

      const config = {
        links,
        folders,
        shortcut: hotkeys.getShortcut(),
        version: '1.0.0'
      }

      const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookmark-config-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('配置已导出')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  // 导入配置
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const config = JSON.parse(text)

      // 验证配置格式
      if (!config.links || !config.folders) {
        throw new Error('无效的配置文件格式')
      }

      // 清除现有数据
      await Promise.all([
        db.links.clear(),
        db.folders.clear()
      ])

      // 导入新数据
      await Promise.all([
        ...config.links.map((link: any) => db.addLink(link)),
        ...config.folders.map((folder: any) => db.addFolder(folder))
      ])

      // 导入快捷键设置
      if (config.shortcut) {
        await hotkeys.updateShortcut(config.shortcut)
      }

      toast.success('配置已导入')
    } catch (error) {
      toast.error('导入失败：' + (error as Error).message)
    }

    // 清除文件选择
    e.target.value = ''
  }

  // 清除所有数据
  const handleClearAll = async () => {
    try {
      await Promise.all([
        db.links.clear(),
        db.folders.clear()
      ])
      toast.success('所有数据已清除')
      setShowClearConfirm(false)
    } catch (error) {
      toast.error('清除数据失败')
    }
  }

  // 添加同步书签的处理函数
  const handleSyncBookmarks = async () => {
    try {
      const { links: importedLinks, folders: importedFolders } = await importChromeBookmarks()
      
      // 批量添加到数据库
      await Promise.all([
        ...importedLinks.map(link => db.addLink(link)),
        ...importedFolders.map(folder => db.addFolder(folder))
      ])
      
      toast.success(`成功同步 ${importedLinks.length} 个书签，${importedFolders.length} 个文件夹`)
    } catch (error) {
      console.error('同步书签失败:', error)
      toast.error('同步 Chrome 书签失败')
    }
  }

  return (
    <div className="min-h-full h-full bg-gray-50">
      <NavBar />
      <div className="max-w-2xl mx-auto p-6">
        {/* 快捷键设置 */}
        <div className="py-6">
          <h3 className="text-lg font-medium text-gray-900">快捷键设置</h3>
          <p className="mt-1 text-sm text-gray-500">
            设置全局搜索快捷键，按下快捷键可以随时打开搜索框快速访问书签
          </p>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              className={cn(
                "flex-1 px-3 py-2 border rounded-md",
                "text-sm font-medium text-gray-900",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                "bg-gray-50",
                isRecording && "bg-blue-50 border-blue-200 text-blue-600"
              )}
              value={`${shortcut.ctrl ? 'Ctrl+' : ''}${shortcut.alt ? 'Alt+' : ''}${
                shortcut.shift ? 'Shift+' : ''
              }${shortcut.key}`}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsRecording(true)}
              onBlur={() => setIsRecording(false)}
              readOnly
              placeholder="点击此处设置快捷键"
            />
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                "text-white hover:bg-gray-800 bg-gray-500",
                isRecording && "text-blue-600 bg-blue-50 hover:bg-blue-100"
              )}
              onClick={() => setIsRecording(true)}
            >
              {isRecording ? '请按下快捷键' : '修改'}
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                "bg-blue-500 text-white hover:bg-blue-600"
              )}
              onClick={async () => {
                try {
                  await hotkeys.updateShortcut({
                    ...shortcut,
                    description: '打开搜索',
                    callback: () => {}
                  })
                  toast.success('快捷键已保存')
                } catch (error) {
                  toast.error('保存失败')
                }
              }}
            >
              保存
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* 书签管理 - 更新部分 */}
        <div className="py-6">
          <h3 className="text-lg font-medium text-gray-900">书签管理</h3>
          <p className="mt-1 text-sm text-gray-500">
            管理书签数据，同步 Chrome 书签，请谨慎操作
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSyncBookmarks}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              <FiRefreshCw className="h-4 w-4" />
              同步 Chrome 书签
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                "bg-red-500 text-white hover:bg-red-600"
              )}
            >
              <FiTrash2 className="h-4 w-4" />
              清除全部数据
            </button>
          </div>
          <p className="mt-3 text-sm text-amber-600">
            同步操作会将 Chrome 书签添加到现有书签中，清除操作会删除所有书签和文件夹且不可恢复
          </p>
        </div>

        <div className="h-px bg-gray-200" />

        {/* 数据管理 - 修改后的部分 */}
        <div className="py-6">
          <h3 className="text-lg font-medium text-gray-900">数据管理</h3>
          <p className="mt-1 text-sm text-gray-500">
            导出数据包含：所有书签链接、文件夹结构、标签信息、快捷键设置等
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleExport}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                "bg-green-500 text-white hover:bg-green-600"
              )}
            >
              <FiDownload className="h-4 w-4" />
              导出配置
            </button>
            <label
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              <FiUpload className="h-4 w-4" />
              导入配置
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleImport}
              />
            </label>
          </div>
          <p className="mt-3 text-sm text-amber-600">
            导入新配置会覆盖现有的所有数据，请提前备份重要信息
          </p>
        </div>
      </div>

      {/* 清除确认对话框 */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <h2 className="text-lg font-medium text-black mb-4">确认清除全部数据？</h2>
          <div className="py-4">
            <p className="text-gray-500">
              此操作将永久删除所有书签、文件夹和标签数据，且无法恢复。
            </p>
            <p className="mt-2 text-amber-600 font-medium">
              建议在清除前先导出备份。
            </p>

          </div>
          <div className="flex justify-end mt-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors"
              >
                确认清除
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
