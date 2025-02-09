import Dexie, { Table } from 'dexie'

export interface Link {
  id: string
  name: string
  url: string
  notes?: string
  tags: string[]
  createdAt: number
  useCount: number
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  children: string[]
  links: string[]
  createdAt: number
  order?: number
}

export class BookmarkDB extends Dexie {
  links!: Table<Link>
  folders!: Table<Folder>

  constructor() {
    super('BookmarkDB')

    this.version(2).stores({
      links: 'id, name, url, createdAt, useCount',
      folders: 'id, name, parentId, order'
    })
  }

  async addLink(link: Link) {
    return await this.links.add(link)
  }

  async updateLink(id: string, changes: Partial<Link>) {
    return await this.links.update(id, changes)
  }

  async deleteLink(id: string) {
    return await this.links.delete(id)
  }

  async incrementLinkUseCount(id: string) {
    const link = await this.links.get(id)
    if (link) {
      return await this.links.update(id, { useCount: (link.useCount || 0) + 1 })
    }
  }

  async addFolder(folder: Folder) {
    return await this.folders.add(folder)
  }

  async updateFolder(id: string, changes: Partial<Folder>) {
    return await this.folders.update(id, changes)
  }

  async deleteFolder(id: string) {
    return await this.folders.delete(id)
  }

  async getAllLinks() {
    return await this.links.toArray()
  }

  async getAllFolders() {
    return await this.folders.orderBy('order').toArray()
  }

  async searchLinks(query: string) {
    const normalizedQuery = query.toLowerCase()
    return await this.links
      .filter(link =>
        link.name.toLowerCase().includes(normalizedQuery) ||
        link.url.toLowerCase().includes(normalizedQuery) ||
        (link.notes && link.notes.toLowerCase().includes(normalizedQuery)) ||
        link.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
      )
      .toArray()
  }

  async updateFoldersOrder(folders: Folder[]) {
    const updates = folders.map((folder, index) => ({
      ...folder,
      order: index
    }))

    return await this.transaction('rw', this.folders, async () => {
      for (const folder of updates) {
        await this.folders.update(folder.id, { order: folder.order })
      }
    })
  }
}

export const db = new BookmarkDB() 