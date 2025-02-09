import { nanoid } from 'nanoid'
import type { Link } from './db'

export async function importChromeBookmarks(): Promise<Link[]> {
  try {
    const bookmarks = await chrome.bookmarks.getTree()
    return flattenBookmarks(bookmarks)
  } catch (error) {
    console.error('Failed to import bookmarks:', error)
    throw new Error('导入书签失败')
  }
}

function flattenBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[]): Link[] {
  const links: Link[] = []

  function traverse(node: chrome.bookmarks.BookmarkTreeNode) {
    // 如果是书签（有 url）
    if (node.url) {
      links.push({
        id: nanoid(),
        name: node.title || node.url,
        url: node.url,
        tags: [], // 可以根据书签文件夹路径生成标签
        createdAt: node.dateAdded || Date.now(),
        useCount: 0
      })
    }
    // 如果有子节点，继续遍历
    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  nodes.forEach(traverse)
  return links
} 