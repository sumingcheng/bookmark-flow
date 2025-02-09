import { db } from '@/services/db'
import { hotkeys } from '@/services/hotkeys'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiDownload, FiUpload } from 'react-icons/fi'
import type { ShortcutKeys } from '@/services/hotkeys'

export default function Settings() {
  const [shortcut, setShortcut] = useState<ShortcutKeys>(hotkeys.getShortcut())
  const [isRecording, setIsRecording] = useState(false)

  // 处理快捷键记录
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (!isRecording) return

    e.preventDefault()
    const newShortcut: ShortcutKeys = {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      key: e.key.toUpperCase()
    }

    // 确保至少有一个修饰键
    if (!newShortcut.ctrl && !newShortcut.alt && !newShortcut.shift) {
      toast.error('请至少使用一个修饰键 (Ctrl/Alt/Shift)')
      return
    }

    setShortcut(newShortcut)
    setIsRecording(false)

    try {
      await hotkeys.updateShortcut(newShortcut)
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">设置</h1>
      
      {/* 快捷键设置 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">快捷键设置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              搜索快捷键
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className={`px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isRecording ? 'bg-blue-50' : ''
                }`}
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
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                onClick={() => setIsRecording(true)}
              >
                {isRecording ? '请按下快捷键' : '修改'}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              请至少包含一个修饰键 (Ctrl/Alt/Shift)
            </p>
          </div>
        </div>
      </section>

      {/* 配置导入导出 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">配置管理</h2>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleExport}
          >
            <FiDownload />
            导出配置
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
            <FiUpload />
            导入配置
            <input
              type="file"
              className="hidden"
              accept=".json"
              onChange={handleImport}
            />
          </label>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          导入配置将覆盖现有的所有数据，请谨慎操作
        </p>
      </section>
    </div>
  )
}
