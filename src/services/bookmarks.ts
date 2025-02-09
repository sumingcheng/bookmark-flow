import { nanoid } from 'nanoid'
import type { Link, Folder } from './db'

interface ImportResult {
  links: Link[]
  folders: Folder[]
}

export async function importChromeBookmarks(): Promise<ImportResult> {
  try {
    const bookmarks = await chrome.bookmarks.getTree()
    const result: ImportResult = {
      links: [],
      folders: []
    }
    traverseBookmarks(bookmarks[0], result)
    return result
  } catch (error) {
    console.error('Failed to import bookmarks:', error)
    throw new Error('导入书签失败')
  }
}

function traverseBookmarks(
  node: chrome.bookmarks.BookmarkTreeNode,
  result: ImportResult,
  parentId?: string
) {
  // 如果是文件夹（没有 url 且有 title）
  if (!node.url && node.title) {
    const folder: Folder = {
      id: nanoid(),
      name: node.title,
      parentId,
      children: [],
      links: [],
      createdAt: node.dateAdded || Date.now(),
      order: result.folders.length
    }
    result.folders.push(folder)

    // 递归处理子节点
    if (node.children) {
      node.children.forEach(child => {
        traverseBookmarks(child, result, folder.id)
      })
    }
  }
  // 如果是书签（有 url）
  else if (node.url) {
    const link: Link = {
      id: nanoid(),
      name: node.title || node.url,
      url: node.url,
      notes: '',  // Chrome 书签没有备注字段
      tags: [],   // 可以根据文件夹路径生成标签
      createdAt: node.dateAdded || Date.now(),
      useCount: 0
    }
    result.links.push(link)

    // 如果有父文件夹，添加到父文件夹的 links 中
    if (parentId) {
      const parentFolder = result.folders.find(f => f.id === parentId)
      if (parentFolder) {
        parentFolder.links.push(link.id)
      }
    }
  }

  // 如果是根节点，继续处理其他子节点
  if (node.children && !node.title) {
    node.children.forEach(child => {
      traverseBookmarks(child, result)
    })
  }
} 