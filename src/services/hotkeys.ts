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

export class HotkeysManager {
  private shortcuts: ShortcutCommand[] = []
  private enabled = false
  private currentShortcut?: ShortcutCommand

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  async init() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // 只初始化自定义快捷键，不处理搜索快捷键
        const result = await chrome.storage.sync.get(['shortcuts'])
        if (result.shortcuts) {
          this.shortcuts = result.shortcuts
        }
      }
      return this
    } catch (error) {
      console.error('初始化快捷键失败:', error)
      return this
    }
  }

  registerShortcut(command: ShortcutCommand) {
    this.shortcuts.push(command)
    this.saveShortcuts()
  }

  private async saveShortcuts() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.sync.set({ shortcuts: this.shortcuts })
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    for (const command of this.shortcuts) {
      if (
        e.key.toLowerCase() === command.key.toLowerCase() &&
        e.ctrlKey === command.ctrl &&
        e.altKey === command.alt &&
        e.shiftKey === command.shift
      ) {
        e.preventDefault()
        command.callback()
        return
      }
    }
  }

  enable() {
    if (!this.enabled) {
      window.addEventListener('keydown', this.handleKeyDown)
      this.enabled = true
    }
  }

  disable() {
    if (this.enabled) {
      window.removeEventListener('keydown', this.handleKeyDown)
      this.enabled = false
    }
  }

  unregisterShortcut(key: string) {
    this.shortcuts = this.shortcuts.filter(cmd => cmd.key !== key)
    this.saveShortcuts()
  }

  async updateShortcut(shortcut: ShortcutCommand) {
    this.currentShortcut = shortcut
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.sync.set({ shortcut: shortcut })
    }
  }

  getShortcut(): ShortcutKeys {
    return this.currentShortcut || {
      ctrl: false,
      alt: true,
      shift: false,
      key: 'S'
    }
  }
}

export const hotkeys = new HotkeysManager() 