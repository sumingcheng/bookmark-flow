export interface ShortcutKeys {
  ctrl: boolean
  alt: boolean
  shift: boolean
  key: string
}

export interface ShortcutCommand extends ShortcutKeys {
  description: string
  callback: () => void
}

const DEFAULT_SHORTCUT: ShortcutCommand = {
  key: 'F',
  ctrl: true,
  alt: true,
  shift: false,
  description: '默认快捷键',
  callback: () => { }
}

export class HotkeysManager {
  private shortcuts: ShortcutCommand[] = []
  private enabled = false
  private shortcut: ShortcutCommand = DEFAULT_SHORTCUT
  private callback?: () => void
  private searchCallback?: () => void

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  async init() {
    // 从存储中加载快捷键设置
    try {
      const stored = await chrome.storage.sync.get('shortcut')
      if (stored.shortcut) {
        this.shortcut = stored.shortcut
      }
    } catch (error) {
      console.error('Failed to load shortcut settings:', error)
    }
  }

  setCallback(callback: () => void) {
    this.callback = callback
  }

  setSearchCallback(callback: () => void) {
    this.searchCallback = callback
  }

  async updateShortcut(newShortcut: ShortcutCommand) {
    this.shortcut = newShortcut
    try {
      await chrome.storage.sync.set({ shortcut: newShortcut })
    } catch (error) {
      console.error('Failed to save shortcut settings:', error)
    }
  }

  getShortcut() {
    return this.shortcut
  }

  registerShortcut(command: ShortcutCommand) {
    this.shortcuts.push(command)
  }

  unregisterShortcut(key: string) {
    this.shortcuts = this.shortcuts.filter(cmd => cmd.key !== key)
  }

  private handleKeyDown(e: KeyboardEvent) {
    // 检查所有注册的快捷键
    for (const command of this.shortcuts) {
      if (
        e.key.toLowerCase() === command.key.toLowerCase() &&
        e.ctrlKey === !!command.ctrl &&
        e.altKey === !!command.alt &&
        e.shiftKey === !!command.shift
      ) {
        e.preventDefault()
        command.callback()
        return
      }
    }

    // 检查搜索快捷键
    if (
      e.ctrlKey === this.shortcut.ctrl &&
      e.altKey === this.shortcut.alt &&
      e.shiftKey === this.shortcut.shift &&
      e.key.toUpperCase() === this.shortcut.key
    ) {
      e.preventDefault()
      this.searchCallback?.()
    }
  }

  enable() {
    window.addEventListener('keydown', this.handleKeyDown)
  }

  disable() {
    window.removeEventListener('keydown', this.handleKeyDown)
  }
}

export const hotkeys = new HotkeysManager() 